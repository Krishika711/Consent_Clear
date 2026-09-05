import React, { useState } from "react";
import api from "../api";

const SEV_COLOR = { HIGH: "#e8433a", MEDIUM: "#d4b23c", LOW: "#3fb377" };

export default function DarkPatternPanel() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = async () => {
    if (!url.trim()) return;
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await api.post("/api/dark-patterns", { url: url.trim() });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't scan that page.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-narrow">
      <div className="page-head"><h2>🚩 Dark pattern detector</h2></div>
      <p className="dp-intro">
        Scans a page's raw HTML for pre-ticked checkboxes and hidden/missing reject options in cookie or consent banners.
        Heuristic-based — it reads markup, not rendered styles, so it can miss patterns applied purely via CSS.
      </p>
      <div className="dp-input-row">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="https://company.com"
        />
        <button onClick={run} disabled={loading}>{loading ? "Scanning…" : "Scan"}</button>
      </div>

      {error && <div className="empty-note" style={{ color: "#f0847a", marginTop: 16 }}>{error}</div>}

      {result && (
        <div style={{ marginTop: 24 }}>
          <p className="dp-intro">{result.result.summary}</p>
          {result.result.patterns_found.length === 0 && <div className="dp-clean">No dark patterns detected from the available signals.</div>}
          {result.result.patterns_found.map((p, i) => (
            <div key={i} className="pattern-card">
              <div className="pattern-top">
                <span className="pattern-name">{p.pattern}</span>
                <span className="pattern-sev" style={{ color: SEV_COLOR[p.severity] || "#8b8f96" }}>{p.severity}</span>
              </div>
              <div className="pattern-evidence">{p.evidence}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}