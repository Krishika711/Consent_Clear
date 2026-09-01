const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // service role key — backend only, never expose to frontend
);

function hashText(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

// Verifies the Supabase access token sent from the frontend and returns the
// user's id, or null if there's no token / it's invalid (anonymous scan).
async function getUserIdFromToken(authHeader) {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user.id;
}

// Saves one scan. If `policyId` is not given, creates a new policy row first
// (used for a fresh, unmonitored scan). Returns { policyId, scanId }.
async function saveScan({ policyId, url, jurisdiction, policyText, result, userId = null }) {
  const textHash = hashText(policyText);

  if (!policyId) {
    const { data: policy, error: policyErr } = await supabase
      .from("policies")
      .insert({ user_id: userId, url: url || null, jurisdiction, last_hash: textHash })
      .select()
      .single();
    if (policyErr) throw policyErr;
    policyId = policy.id;
  } else {
    await supabase.from("policies").update({ last_hash: textHash }).eq("id", policyId);
  }

  const { data: scan, error: scanErr } = await supabase
    .from("scans")
    .insert({
      policy_id: policyId,
      risk_score: result.risk_score,
      result_json: result,
      policy_text: policyText,
      text_hash: textHash,
    })
    .select()
    .single();
  if (scanErr) throw scanErr;

  return { policyId, scanId: scan.id };
}

async function getScan(scanId) {
  const { data, error } = await supabase.from("scans").select("*").eq("id", scanId).single();
  if (error) throw error;
  return data;
}

async function getMonitoredPolicies() {
  const { data, error } = await supabase.from("policies").select("*").eq("is_monitored", true);
  if (error) throw error;
  return data;
}

async function getScanHistory(policyId) {
  const { data, error } = await supabase
    .from("scans")
    .select("id, risk_score, created_at")
    .eq("policy_id", policyId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

module.exports = { supabase, hashText, getUserIdFromToken, saveScan, getScan, getMonitoredPolicies, getScanHistory };
