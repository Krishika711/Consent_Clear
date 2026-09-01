const cron = require("node-cron");
const axios = require("axios");
const cheerio = require("cheerio");
const { Resend } = require("resend");
const { hashText, saveScan, getMonitoredPolicies, supabase } = require("./supabase");
const { analyzeWithGemini } = require("./gemini");

const resend = new Resend(process.env.RESEND_API_KEY);

async function extractTextFromURL(url) {
  const { data } = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    timeout: 10000,
  });
  const $ = cheerio.load(data);
  $("script, style, nav, footer, header").remove();
  return $("body").text().replace(/\s+/g, " ").trim().slice(0, 8000);
}

async function sendDriftEmail(to, url, oldScore, newScore) {
  if (!to) return; // no user email on file yet — skip silently
  await resend.emails.send({
    from: "ConsentClear <alerts@yourdomain.com>",
    to,
    subject: `Policy change detected: ${url}`,
    html: `<p>ConsentClear detected a change in the privacy policy at <a href="${url}">${url}</a>.</p>
           <p>Risk score moved from <b>${oldScore || "N/A"}</b> to <b>${newScore}</b>.</p>
           <p>Log in to see the full diff and updated violations.</p>`,
  });
}

async function recheckOne(policy) {
  const text = await extractTextFromURL(policy.url);
  const newHash = hashText(text);
  if (newHash === policy.last_hash) return; // no change, nothing to do

  const result = await analyzeWithGemini(text, policy.jurisdiction);
  await saveScan({ policyId: policy.id, url: policy.url, jurisdiction: policy.jurisdiction, policyText: text, result });

  await supabase.from("alerts").insert({
    policy_id: policy.id,
    type: "drift",
    message: `Policy text changed. New risk score: ${result.risk_score}`,
  });

  // fetch the user's email via Supabase Auth admin API, if a user is attached
  let email = null;
  if (policy.user_id) {
    const { data } = await supabase.auth.admin.getUserById(policy.user_id);
    email = data?.user?.email || null;
  }
  await sendDriftEmail(email, policy.url, policy.last_score, result.risk_score);
}

async function runMonitoringPass() {
  const policies = await getMonitoredPolicies();
  console.log(`[monitor] checking ${policies.length} monitored polic${policies.length === 1 ? "y" : "ies"}`);
  for (const policy of policies) {
    try {
      await recheckOne(policy);
    } catch (err) {
      console.error(`[monitor] failed for policy ${policy.id}:`, err.message);
    }
  }
}

// Runs every 6 hours. Adjust the cron expression for your demo
// (e.g. "*/5 * * * *" for every 5 minutes while presenting).
function startMonitoring() {
  cron.schedule("0 */6 * * *", runMonitoringPass);
  console.log("[monitor] continuous monitoring cron scheduled (every 6h)");
}

module.exports = { startMonitoring, runMonitoringPass };
