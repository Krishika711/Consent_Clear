import React, { useEffect, useState } from "react";
import api from "../api";

const SCORE_COLOR = { CRITICAL: "#ff4d4d", HIGH: "#ffb454", MEDIUM: "#ffb454", LOW: "#4ade9c" };

export default function HistoryPanel({ policyId, onBack }) {
  const [history, setHistory] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!policyId) return;
    api.get(`/api/history/${policyId}`)
      .then((res) => setHistory(res.data.history || []))
      .catch(() => setError("Couldn't load history for this policy."));
  }, [policyId]);

  return (
    <div style={{ minHeight: "100vh", background: "#0b0e14", color: "#e8eaf0", fontFamily: "'Space Grotesk', sans-serif" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 24px", borderBottom: "1px solid #232838" }}>
        <button onClick={onBack} style={{ background: "none", border: "1px solid #232838", borderRadius: 6, color: "#838aa0", fontSize: 13, padding: "6px 12px", cursor: "pointer" }}>
          ← Dashboard
        </button>
        <span style={{ fontWeight: 600 }}>Compliance history</span>
      </header>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 24px" }}>
        {!policyId && (
          <div style={{ color: "#838aa0", fontSize: 14 }}>
            Run a scan first — history builds up from there, especially once you enable monitoring on a policy.
          </div>
        )}
        {error && <div style={{ color: "#ff4d4d", fontSize: 14 }}>{error}</div>}
        {history?.length === 0 && (
          <div style={{ color: "#838aa0", fontSize: 14 }}>Only one scan so far — history will fill in as this policy gets re-checked.</div>
        )}
        {history?.map((h, i) => (
          <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: i < history.length - 1 ? "1px solid #1a1e29" : "none" }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#838aa0", width: 90 }}>
              {new Date(h.created_at).toLocaleDateString()}
            </div>
            <div style={{ color: SCORE_COLOR[h.risk_score] || "#e8eaf0", fontWeight: 700, fontSize: 14 }}>
              {h.risk_score}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
