const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
const cheerio = require("cheerio");
const pdf = require("pdf-parse");
const { analyzeWithGemini, chatWithPolicy } = require("../lib/gemini");
const { saveScan, getScan, getScanHistory, getUserIdFromToken, supabase } = require("../lib/supabase");

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

// Lists the logged-in user's policies (with their latest scan info) — feeds the dashboard
router.get("/my-policies", async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req.headers.authorization);
    if (!userId) return res.status(401).json({ error: "Login required" });

    const { data, error } = await supabase
      .from("policies")
      .select("id, url, jurisdiction, is_monitored, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;

    res.json({ success: true, policies: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
