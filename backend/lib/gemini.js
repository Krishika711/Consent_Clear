const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Gemini occasionally returns a transient 503 ("currently experiencing high
// demand") when Google's servers are overloaded — it's not a bug in this
// code. Retry a couple of times with backoff before giving up.
async function withRetry(fn, retries = 2, delayMs = 1200) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const msg = err.message || "";
      const transient = msg.includes("503") || /overloaded|high demand/i.test(msg);
      if (attempt === retries || !transient) throw err;
      await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
    }
  }
}

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
  const result = await withRetry(() => model.generateContent(prompt));
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

  const result = await withRetry(() => model.generateContent(prompt));
  return result.response.text().trim();
}

// Generates an illustrative (clearly-labeled mock) DPDP Board-style notice
// from an existing scan's violations, so a founder can see what enforcement
// language might look like. This is NOT a real regulatory document.
async function generateRegulatorNotice(policyText, scanResult) {
  const model = genAI.getGenerativeModel({
    model: "gemini-3.6-flash",
    generationConfig: { temperature: 0.3 },
  });

  const prompt = `Draft a MOCK, illustrative DPDP Board-style non-compliance notice based on the violations below. This is for a founder to see what enforcement language could look like — it is NOT a real filing and must say so clearly.

VIOLATIONS:
${JSON.stringify(scanResult.violations || [], null, 2)}

FINE EXPOSURE: ${scanResult.fine_exposure || "unspecified"}

Format:
- Header line: "NOTICE OF NON-COMPLIANCE — ILLUSTRATIVE ONLY, NOT AN ACTUAL REGULATORY FILING"
- A short reference line ("Digital Personal Data Protection Board of India — simulated notice")
- A numbered list of the cited violations, each with its DPDP section
- A statement of potential financial exposure
- A mock response deadline (e.g. 30 days from a placeholder date)
- Closing line repeating that this is a simulated, illustrative document only
Keep the whole thing under 400 words.`;

  const result = await withRetry(() => model.generateContent(prompt));
  return result.response.text().trim();
}

// Heuristic dark-pattern analysis. Takes signals already extracted from a
// page's raw HTML (checkbox checked-state, button text/visibility) and asks
// Gemini to interpret them. Honest about finding nothing if signals are thin —
// it does not invent patterns that aren't supported by the evidence.
async function analyzeDarkPatterns(signals) {
  const model = genAI.getGenerativeModel({
    model: "gemini-3.6-flash",
    generationConfig: { temperature: 0.1, responseMimeType: "application/json" },
  });

  const prompt = `Analyze these raw HTML signals extracted from a website's consent/cookie banner for dark patterns.

SIGNALS (checkboxes and buttons/links found on the page, with their checked/hidden state and nearby text):
${JSON.stringify(signals, null, 2)}

Return ONLY this JSON shape:
{"patterns_found":[{"pattern":"name","evidence":"what specifically was found","severity":"LOW|MEDIUM|HIGH"}],"summary":"1-2 sentence summary"}

Look for: pre-ticked consent checkboxes, an "Accept All"-style control with no equally visible "Reject All" option, reject controls marked hidden/display:none, forced consent walls.
If the signals don't clearly support a pattern, don't invent one — an empty patterns_found array with an honest summary is the correct answer when evidence is thin.`;

  const result = await withRetry(() => model.generateContent(prompt));
  return parseJSON(result.response.text());
}

module.exports = { analyzeWithGemini, chatWithPolicy, generateRegulatorNotice, analyzeDarkPatterns };
