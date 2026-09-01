import React, { useState } from "react";

const SCORE_CONFIG = {
  CRITICAL: { color: "#ef4444", bg: "#1a0505", border: "#3a0f0f", label: "CRITICAL RISK" },
  HIGH:     { color: "#f97316", bg: "#1a0d05", border: "#3a1a0a", label: "HIGH RISK" },
  MEDIUM:   { color: "#eab308", bg: "#1a1505", border: "#3a2e0a", label: "MEDIUM RISK" },
  LOW:      { color: "#22c55e", bg: "#051a0a", border: "#0a3a15", label: "LOW RISK" },
};

const SEVERITY_COLOR = { HIGH: "#ef4444", MEDIUM: "#eab308", LOW: "#22c55e" };
const STATUS_CONFIG = {
  pass:    { color: "#22c55e", icon: "✓" },
  fail:    { color: "#ef4444", icon: "✗" },
  partial: { color: "#eab308", icon: "~" },
};

export default function VerdictCard({ result }) {
  const [expanded, setExpanded] = useState(null);
  const [plainEnglish, setPlainEnglish] = useState(false);
  const [copied, setCopied] = useState(null);
  const cfg = SCORE_CONFIG[result.risk_score] || SCORE_CONFIG.MEDIUM;

  const copyClause = (text, i) => {
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
  };

  const shareVerdict = () => {
    const text = `RedFlag Scan Result: ${result.risk_score} RISK\n${result.risk_summary}\nFine exposure: ${result.fine_exposure}\nViolations: ${result.violations?.length || 0}`;
    navigator.clipboard.writeText(text);
    alert("Verdict copied to clipboard!");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      {/* Risk score banner */}
      <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 16, padding: "24px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ color: cfg.color, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 }}>{cfg.label}</div>
            <div style={{ fontSize: 15, color: "#ccc", maxWidth: 480 }}>{result.risk_summary}</div>
          </div>
          <div style={{ fontSize: 48, fontWeight: 800, color: cfg.color, opacity: 0.9, letterSpacing: "-2px" }}>
            {result.risk_score}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button onClick={shareVerdict} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, padding: "7px 14px", color: "#aaa", fontSize: 12, cursor: "pointer" }}>
            📋 Copy verdict
          </button>
          <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, padding: "7px 14px", color: "#555", fontSize: 12 }}>
            {result.jurisdiction || "DPDP"} Act
          </div>
        </div>
      </div>

      {/* Fine exposure */}
      {result.fine_exposure && (
        <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 12, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#555", fontSize: 13 }}>estimated fine exposure</span>
          <span style={{ color: "#ef4444", fontWeight: 600, fontSize: 14 }}>{result.fine_exposure}</span>
        </div>
      )}

      {/* Plain English toggle + What they can do */}
      {result.what_they_can_do?.length > 0 && (
        <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ color: "#888", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em" }}>WHAT THEY CAN DO WITH YOUR DATA</div>
            <button
              onClick={() => setPlainEnglish(!plainEnglish)}
              style={{ background: plainEnglish ? "#1a2a1a" : "#1a1a1a", border: plainEnglish ? "1px solid #22c55e" : "1px solid #2a2a2a", borderRadius: 6, padding: "4px 10px", color: plainEnglish ? "#22c55e" : "#555", fontSize: 11, cursor: "pointer" }}
            >
              {plainEnglish ? "✓ Plain English" : "Plain English"}
            </button>
          </div>
          {result.what_they_can_do.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#333", marginTop: 6, flexShrink: 0 }} />
              <span style={{ color: "#bbb", fontSize: 14, lineHeight: 1.5 }}>
                {plainEnglish ? item : item}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Violations */}
      {result.violations?.length > 0 && (
        <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #1a1a1a" }}>
            <span style={{ color: "#888", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em" }}>
              VIOLATIONS FOUND — {result.violations.length}
            </span>
          </div>
          {result.violations.map((v, i) => (
            <div key={i} style={{ borderBottom: i < result.violations.length - 1 ? "1px solid #111" : "none" }}>
              <div
                onClick={() => setExpanded(expanded === i ? null : i)}
                style={{ padding: "14px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ background: SEVERITY_COLOR[v.severity] + "22", color: SEVERITY_COLOR[v.severity], fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4 }}>
                    {v.severity}
                  </span>
                  <span style={{ color: "#3b82f6", fontSize: 13, fontWeight: 500 }}>{v.clause}</span>
                  <span style={{ color: "#aaa", fontSize: 13 }}>{v.issue?.slice(0, 60)}{v.issue?.length > 60 ? "..." : ""}</span>
                </div>
                <span style={{ color: "#444", fontSize: 12 }}>{expanded === i ? "▲" : "▼"}</span>
              </div>
              {expanded === i && (
                <div style={{ padding: "0 20px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ background: "#080808", borderRadius: 8, padding: "12px 14px" }}>
                    <div style={{ color: "#555", fontSize: 11, marginBottom: 4 }}>ISSUE</div>
                    <div style={{ color: "#bbb", fontSize: 13, lineHeight: 1.5 }}>{v.issue}</div>
                  </div>
                  <div style={{ background: "#050d0a", border: "1px solid #0a2015", borderRadius: 8, padding: "12px 14px" }}>
                    <div style={{ color: "#22c55e", fontSize: 11, marginBottom: 4 }}>HOW TO FIX</div>
                    <div style={{ color: "#bbb", fontSize: 13, lineHeight: 1.5 }}>{v.fix}</div>
                  </div>
                  {v.rewritten_clause && (
                    <div style={{ background: "#080d14", border: "1px solid #0a1a30", borderRadius: 8, padding: "12px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div style={{ color: "#3b82f6", fontSize: 11 }}>REWRITTEN CLAUSE — COPY & PASTE</div>
                        <button
                          onClick={() => copyClause(v.rewritten_clause, i)}
                          style={{ background: copied === i ? "#0a2a0a" : "#1a1a2a", border: copied === i ? "1px solid #22c55e" : "1px solid #2a2a3a", borderRadius: 6, padding: "3px 10px", color: copied === i ? "#22c55e" : "#3b82f6", fontSize: 11, cursor: "pointer" }}
                        >
                          {copied === i ? "✓ Copied!" : "Copy"}
                        </button>
                      </div>
                      <div style={{ color: "#bbb", fontSize: 13, lineHeight: 1.6, fontStyle: "italic" }}>{v.rewritten_clause}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Checklist */}
      {result.checklist?.length > 0 && (
        <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ color: "#888", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 14 }}>COMPLIANCE CHECKLIST</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {result.checklist.map((c, i) => {
              const s = STATUS_CONFIG[c.status] || STATUS_CONFIG.partial;
              return (
                <div key={i} style={{ background: "#080808", borderRadius: 8, padding: "10px 12px", display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ color: s.color, fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{s.icon}</span>
                  <div>
                    <div style={{ color: "#bbb", fontSize: 12, fontWeight: 500 }}>{c.item}</div>
                    <div style={{ color: "#555", fontSize: 11, marginTop: 2 }}>{c.note}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Compliant areas */}
      {result.compliant_areas?.length > 0 && (
        <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ color: "#888", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 12 }}>WHAT THEY GOT RIGHT</div>
          {result.compliant_areas.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
              <div style={{ color: "#22c55e", fontSize: 12, marginTop: 2 }}>✓</div>
              <span style={{ color: "#bbb", fontSize: 14, lineHeight: 1.5 }}>{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
