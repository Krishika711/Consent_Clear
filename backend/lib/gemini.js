const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function getPrompt(jurisdiction) {
  const laws = {
    DPDP: "DPDP Act 2023 (India). Cite real sections like Section 7(b). Fine in INR.",
    GDPR: "GDPR (Europe). Cite real articles like Article 13(1)(c). Fine in EUR.",
    CCPA: "CCPA (California). Cite real sections like Section 1798.100. Fine in USD.",
  };
  return `You are a privacy law compliance expert analyzing under ${laws[jurisdiction] || laws.DPDP}

Analyze this privacy policy. Return ONLY a JSON object, nothing else, no markdown, no backticks:

{"risk_score":"HIGH","risk_summary":"brief summary","jurisdiction":"${jurisdiction}","what_they_can_do":["item1","item2","item3"],"violations":[{"clause":"Section X","issue":"description","severity":"HIGH","fix":"what to do","rewritten_clause":"rewritten text"}],"fine_exposure":"amount","compliant_areas":["item1"],"checklist":[{"item":"requirement","status":"pass","note":"explanation"}]}

Use risk_score: LOW, MEDIUM, HIGH, or CRITICAL only.
Use severity: LOW, MEDIUM, or HIGH only.
Use status: pass, fail, or partial only.
Include 3-5 checklist items.
RETURN ONLY THE JSON OBJECT.`;
}

function parseJSON(raw) {
  const cleaned = raw.trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Invalid JSON from Gemini: " + cleaned.slice(0, 200));
  }
}

// Analyze a privacy policy against a jurisdiction's law. Returns the same
// shaped object the frontend already expects (risk_score, violations, etc).
async function analyzeWithGemini(policyText, jurisdiction = "DPDP") {
  const model = genAI.getGenerativeModel({
    model: "gemini-3.6-flash",
    generationConfig: { temperature: 0.1, responseMimeType: "application/json" },
  });

  const prompt = `${getPrompt(jurisdiction)}\n\nPOLICY TEXT:\n${policyText}`;
  const result = await model.generateContent(prompt);
  const raw = result.response.text();
  return parseJSON(raw);
}

// Answer a follow-up question about an already-analyzed policy, grounded in
// the original policy text and the stored scan result. No vector store —
// the policy text is short enough (<=8000 chars) to pass in full each time.
async function chatWithPolicy(policyText, scanResult, question) {
  const model = genAI.getGenerativeModel({
    model: "gemini-3.6-flash",
    generationConfig: { temperature: 0.2 },
  });

  const prompt = `You are answering a user's question about a specific privacy policy that has already been analyzed for DPDP/GDPR/CCPA compliance.

POLICY TEXT:
${policyText}

PRIOR ANALYSIS (JSON):
${JSON.stringify(scanResult)}

USER QUESTION:
${question}

Answer in plain English, 2-4 sentences. Cite the specific clause or section from the policy text or analysis that supports your answer. If the policy is silent on the question, say so explicitly rather than guessing.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

module.exports = { analyzeWithGemini, chatWithPolicy };
