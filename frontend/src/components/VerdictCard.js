import React, { useState } from "react";

const RISK_COLOR = { CRITICAL: "#f0847a", HIGH: "#e0912f", MEDIUM: "#d4b23c", LOW: "#3fb377" };
const RISK_BG = { CRITICAL: "#2b1210", HIGH: "#3a1f14", MEDIUM: "#1f1e10", LOW: "#0f2419" };
const SEV_KEYS = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
const STATUS_ICON = { pass: { icon: "✓", color: "#3fb377" }, fail: { icon: "✗", color: "#f0847a" }, partial: { icon: "~", color: "#d4b23c" } };

function computeScore(result) {
  if (result.checklist?.length) {
    const total = result.checklist.length;
    const pts = result.checklist.reduce((s, c) => s + (c.status === "pass" ? 1 : c.status === "partial" ? 0.5 : 0), 0);
    return Math.round((pts / total) * 100);
  }
  const map = { LOW: 90, MEDIUM: 68, HIGH: 42, CRITICAL: 18 };
  return map[result.risk_score] ?? 50;
}

export default function VerdictCard({ result, sourceLabel, scannedAt, onRescan }) {
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [copied, setCopied] = useState(null);
  const [shareCopied, setShareCopied] = useState(false);

  const score = computeScore(result);
  const riskColor = RISK_COLOR[result.risk_score] || RISK_COLOR.MEDIUM;
  const violations = result.violations || [];
  const counts = SEV_KEYS.reduce((acc, k) => ({ ...acc, [k]: violations.filter((v) => (v.severity || "").toUpperCase() === k).length }), {});
  const maxCount = Math.max(1, ...Object.values(counts));
  const filtered = filter === "ALL" ? violations : violations.filter((v) => (v.severity || "").toUpperCase() === filter);
  const compliantCount = result.checklist?.filter((c) => c.status === "pass").length ?? result.compliant_areas?.length ?? 0;
  const totalReviewed = result.checklist?.length || compliantCount + violations.length;

  const copyClause = (text, i) => {
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
  };

  const shareReport = () => {
    const text = `ConsentClear Scan Result: ${result.risk_score} RISK\n${result.risk_summary || ""}\nFine exposure: ${result.fine_exposure || "n/a"}\nViolations: ${violations.length}`;
    navigator.clipboard.writeText(text);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  return (
    <div>
      <div className="results-topline">
        <div className="results-input">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.5.5l2-2a5 5 0 00-7-7l-1 1" /><path d="M14 11a5 5 0 00-7.5-.5l-2 2a5 5 0 007 7l1-1" /></svg>
          {sourceLabel || "Scanned policy"}
        </div>
        <button className="rescan-btn" onClick={onRescan}>New scan</button>
        <div className="jur-pill">{result.jurisdiction || "DPDP Act 2023"}</div>
      </div>

      <div className="res-header">
        <div>
          <h2>Scan Results</h2>
          <div className="jur-line">Jurisdiction: <b>{result.jurisdiction || "DPDP Act 2023"}</b></div>
        </div>
        <div className="sev-filters">
          <button className={`sev-btn${filter === "ALL" ? " active" : ""}`} onClick={() => setFilter("ALL")}>ALL</button>
          {SEV_KEYS.map((k) => (
            <button key={k} className={`sev-btn${filter === k ? ` active-${k.toLowerCase()}` : ""}`} onClick={() => setFilter(k)}>{k}</button>
          ))}
        </div>
      </div>

      <div className="summary-card">
        <div className="score-ring" style={{ background: `conic-gradient(${riskColor} 0% ${score}%, #25282e ${score}% 100%)` }}>
          <div className="val"><b>{score}</b><span>/ 100</span></div>
        </div>
        <div className="summary-mid">
          <div className="summary-mid-top">
            <h3>Privacy Policy Analysis</h3>
            <div className="risk-badge" style={{ background: RISK_BG[result.risk_score] || RISK_BG.MEDIUM, color: riskColor }}>
              <span className="dot" />{result.risk_score}
            </div>
          </div>
          <p>{sourceLabel} · Scanned {scannedAt ? new Date(scannedAt).toLocaleString() : "just now"}</p>
        </div>
        <div className="summary-actions">
          <button className="sum-btn" onClick={() => window.print()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></svg>
            Export PDF
          </button>
          <button className="sum-btn" onClick={shareReport}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 13.5l6.8 3.9M15.4 6.6L8.6 10.5" /></svg>
            {shareCopied ? "Copied!" : "Share Report"}
          </button>
          <button className="sum-btn" onClick={onRescan}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.5 9a9 9 0 0114.6-3.4L23 10M1 14l4.9 4.4A9 9 0 0020.5 15" /></svg>
            Re-scan
          </button>
        </div>
      </div>

      <div className="metric-row">
        <div className="metric-card">
          <div className="metric-label">EST. FINE EXPOSURE</div>
          <div className="metric-val fine">{result.fine_exposure || "—"}</div>
          <div className="metric-sub">under {result.jurisdiction || "DPDP Act 2023"}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">VIOLATIONS FOUND</div>
          <div className="metric-val">{violations.length}</div>
          <div className="metric-sub">across {totalReviewed} clauses reviewed</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">COMPLIANT CLAUSES</div>
          <div className="metric-val">{compliantCount}</div>
          <div className="metric-sub">of {totalReviewed} total reviewed</div>
        </div>
      </div>

      <div className="sev-row">
        {SEV_KEYS.map((k) => (
          <div key={k} className={`sev-card ${k.toLowerCase()}`}>
            <div className="lbl">{k}</div>
            <div className="n">{counts[k]}</div>
            <div className="sev-bar" style={{ width: `${(counts[k] / maxCount) * 100}%` }} />
          </div>
        ))}
      </div>

      {violations.length > 0 && (
        <>
          <div className="viol-header">
            <h3>Violations</h3>
            <span>{filter === "ALL" ? `${violations.length} shown` : `filtered by ${filter} · ${filtered.length} shown`}</span>
          </div>

          {filtered.map((v, i) => {
            const sev = (v.severity || "MEDIUM").toLowerCase();
            const isOpen = expanded === i;
            return (
              <div key={i} className="viol-card">
                <div className="viol-top" onClick={() => setExpanded(isOpen ? null : i)}>
                  <div className={`viol-sev ${sev}`}><span className="dot" />{v.severity}</div>
                  <span className="viol-clause">{v.clause}</span>
                </div>
                <div className="viol-title" onClick={() => setExpanded(isOpen ? null : i)}>{v.issue}</div>
                {!isOpen && <div className="viol-desc">{v.fix?.slice(0, 120)}{v.fix?.length > 120 ? "…" : ""}</div>}
                <button className="viol-toggle" onClick={() => setExpanded(isOpen ? null : i)}>
                  {isOpen ? "Hide details" : "Show suggested rewrite"}
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isOpen ? "rotate(180deg)" : "none" }}><path d="M6 9l6 6 6-6" /></svg>
                </button>
                {isOpen && (
                  <div className="viol-body">
                    <div className="viol-box issue">
                      <div className="k" style={{ color: "#8b8f96" }}>ISSUE</div>
                      <div className="v">{v.issue}</div>
                    </div>
                    <div className="viol-box fix">
                      <div className="k" style={{ color: "#3fb377" }}>HOW TO FIX</div>
                      <div className="v">{v.fix}</div>
                    </div>
                    {v.rewritten_clause && (
                      <div className="diff-box">
                        <div className="diff-line added">{v.rewritten_clause}</div>
                      </div>
                    )}
                    {v.rewritten_clause && (
                      <button className="diff-copy" onClick={() => copyClause(v.rewritten_clause, i)}>
                        {copied === i ? "✓ Copied!" : "Copy rewritten clause"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {result.what_they_can_do?.length > 0 && (
        <div className="section-card">
          <div className="section-label">WHAT THEY CAN DO WITH YOUR DATA</div>
          {result.what_they_can_do.map((item, i) => (
            <div key={i} className="bullet-row"><div className="dot" /><span className="text">{item}</span></div>
          ))}
        </div>
      )}

      {result.checklist?.length > 0 && (
        <div className="section-card">
          <div className="section-label">COMPLIANCE CHECKLIST</div>
          <div className="checklist-grid">
            {result.checklist.map((c, i) => {
              const s = STATUS_ICON[c.status] || STATUS_ICON.partial;
              return (
                <div key={i} className="checklist-item">
                  <span className="ico" style={{ color: s.color }}>{s.icon}</span>
                  <div>
                    <div className="lbl">{c.item}</div>
                    <div className="note">{c.note}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {result.compliant_areas?.length > 0 && (
        <div className="section-card">
          <div className="section-label">WHAT THEY GOT RIGHT</div>
          {result.compliant_areas.map((item, i) => (
            <div key={i} className="bullet-row"><span className="dot ok" style={{ color: "#3fb377" }}>✓</span><span className="text">{item}</span></div>
          ))}
        </div>
      )}
    </div>
  );
}