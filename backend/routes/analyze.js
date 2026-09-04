const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
const cheerio = require("cheerio");
const pdf = require("pdf-parse");
const { analyzeWithGemini, chatWithPolicy, generateRegulatorNotice, analyzeDarkPatterns } = require("../lib/gemini");
const { saveScan, getScan, getScanHistory, getUserIdFromToken, getAlerts, supabase } = require("../lib/supabase");

const upload = multer({ storage: multer.memoryStorage() });

async function extractTextFromURL(url) {
  const { data } = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    timeout: 10000,
  });
  const $ = cheerio.load(data);
  $("script, style, nav, footer, header").remove();
  const text = $("body").text().replace(/\s+/g, " ").trim();
  if (text.length < 200) throw new Error("Could not extract enough text from URL");
  return text.slice(0, 8000);
}

async function extractTextFromPDF(buffer) {
  const data = await pdf(buffer);
  if (!data.text || data.text.length < 200)
    throw new Error("Could not extract text from PDF");
  return data.text.slice(0, 8000);
}

router.post("/analyze-url", async (req, res) => {
  try {
    const { url, jurisdiction, monitor } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    const userId = await getUserIdFromToken(req.headers.authorization);
    const text = await extractTextFromURL(url);
    const result = await analyzeWithGemini(text, jurisdiction);

    let scanId = null;
    let policyId = null;
    try {
      const saved = await saveScan({
        url,
        jurisdiction: jurisdiction || "DPDP",
        policyText: text,
        result,
        userId,
      });
      scanId = saved.scanId;
      policyId = saved.policyId;
      if (monitor) {
        // mark this policy as monitored for the continuous-recheck cron
        await supabase.from("policies").update({ is_monitored: true }).eq("id", policyId);
      }
    } catch (dbErr) {
      // Don't fail the whole request if persistence fails — the scan result
      // itself is still valid and useful to the user.
      console.error("Supabase save failed:", dbErr.message);
    }

    res.json({ success: true, result, scan_id: scanId, policy_id: policyId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/analyze-pdf", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "PDF file is required" });
    const jurisdiction = req.body.jurisdiction || "DPDP";
    const userId = await getUserIdFromToken(req.headers.authorization);

    const text = await extractTextFromPDF(req.file.buffer);
    const result = await analyzeWithGemini(text, jurisdiction);

    let scanId = null;
    let policyId = null;
    try {
      const saved = await saveScan({ jurisdiction, policyText: text, result, userId });
      scanId = saved.scanId;
      policyId = saved.policyId;
    } catch (dbErr) {
      console.error("Supabase save failed:", dbErr.message);
    }

    res.json({ success: true, result, scan_id: scanId, policy_id: policyId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Chat with an already-scanned policy
router.post("/chat", async (req, res) => {
  try {
    const { scan_id, question } = req.body;
    if (!scan_id || !question)
      return res.status(400).json({ error: "scan_id and question are required" });

    const scan = await getScan(scan_id);
    const answer = await chatWithPolicy(scan.policy_text, scan.result_json, question);

    res.json({ success: true, answer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Compliance history for a policy — feeds the risk-score timeline chart
router.get("/history/:policyId", async (req, res) => {
  try {
    const history = await getScanHistory(req.params.policyId);
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lists the logged-in user's policies, enriched with each one's latest risk
// score, last-scanned time, and how many scans it has — feeds both the
// dashboard metrics and the History panel's policy list.
router.get("/my-policies", async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req.headers.authorization);
    if (!userId) return res.status(401).json({ error: "Login required" });

    const { data: policies, error } = await supabase
      .from("policies")
      .select("id, url, jurisdiction, is_monitored, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;

    if (!policies.length) return res.json({ success: true, policies: [] });

    const policyIds = policies.map((p) => p.id);
    const { data: scans, error: scanErr } = await supabase
      .from("scans")
      .select("policy_id, risk_score, created_at")
      .in("policy_id", policyIds)
      .order("created_at", { ascending: false });
    if (scanErr) throw scanErr;

    // scans is already newest-first, so the first hit per policy_id is the latest scan
    const latestByPolicy = {};
    const countByPolicy = {};
    for (const s of scans) {
      countByPolicy[s.policy_id] = (countByPolicy[s.policy_id] || 0) + 1;
      if (!latestByPolicy[s.policy_id]) latestByPolicy[s.policy_id] = s;
    }

    const enriched = policies.map((p) => ({
      ...p,
      latest_risk_score: latestByPolicy[p.id]?.risk_score || null,
      last_scanned_at: latestByPolicy[p.id]?.created_at || p.created_at,
      scan_count: countByPolicy[p.id] || 0,
    }));

    res.json({ success: true, policies: enriched });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Drift/amendment alert feed for one monitored policy — feeds the
// "Monitored" tab detail view in the History panel.
router.get("/alerts/:policyId", async (req, res) => {
  try {
    const alerts = await getAlerts(req.params.policyId);
    res.json({ success: true, alerts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mock DPDP Board-style notice, generated from an existing scan's violations.
// Clearly illustrative — see the disclaimer baked into the generated text itself.
router.post("/notice", async (req, res) => {
  try {
    const { scan_id } = req.body;
    if (!scan_id) return res.status(400).json({ error: "scan_id is required" });
    const scan = await getScan(scan_id);
    const notice = await generateRegulatorNotice(scan.policy_text, scan.result_json);
    res.json({ success: true, notice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dark pattern detector: fetches the live page, pulls out checkbox/button
// signals via cheerio (no headless browser — works within Render's free
// tier), and asks Gemini to interpret them.
router.post("/dark-patterns", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "url is required" });

    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 10000,
    });
    const $ = cheerio.load(data);
    const signals = [];

    $("input[type=checkbox]").each((_, el) => {
      const $el = $(el);
      signals.push({
        type: "checkbox",
        checked: $el.attr("checked") !== undefined,
        nearText: $el.parent().text().trim().slice(0, 100),
      });
    });

    $("button, a").each((_, el) => {
      const text = $(el).text().trim();
      if (!/accept|reject|decline|agree|consent|cookie|allow all|deny/i.test(text)) return;
      const style = $(el).attr("style") || "";
      const hidden = $(el).attr("hidden") !== undefined || /display:\s*none|visibility:\s*hidden/i.test(style);
      signals.push({ type: "button", text: text.slice(0, 60), hidden });
    });

    const capped = signals.slice(0, 40);
    if (capped.length === 0) {
      return res.json({
        success: true,
        result: { patterns_found: [], summary: "No consent/cookie banner elements were found on this page — nothing to analyze." },
        signals_found: 0,
      });
    }

    const result = await analyzeDarkPatterns(capped);
    res.json({ success: true, result, signals_found: capped.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public, embeddable SVG badge showing a policy's latest risk score —
// no auth required, meant to be used as an <img src="..."> on any site.
router.get("/badge/:policyId", async (req, res) => {
  try {
    const history = await getScanHistory(req.params.policyId);
    const latest = history[history.length - 1];
    const score = latest?.risk_score || "UNSCANNED";
    const color = { LOW: "#4ade9c", MEDIUM: "#ffb454", HIGH: "#ff8c42", CRITICAL: "#ff4d4d" }[score] || "#888";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="20">
  <rect width="60" height="20" fill="#333"/>
  <rect x="60" width="90" height="20" fill="${color}"/>
  <text x="30" y="14" fill="#fff" font-family="Verdana" font-size="11" text-anchor="middle">DPDP</text>
  <text x="105" y="14" fill="#fff" font-family="Verdana" font-size="11" text-anchor="middle">${score}</text>
</svg>`;
    res.set("Content-Type", "image/svg+xml");
    res.set("Cache-Control", "no-cache");
    res.send(svg);
  } catch (err) {
    res.status(500).send("");
  }
});

module.exports = router;