import React, { useState } from "react";
import api from "../api";

const SEV_COLOR = { HIGH: "#ff4d4d", MEDIUM: "#ffb454", LOW: "#4ade9c" };

export default function DarkPatternPanel({ onBack }) {
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
    <div style={{ minHeight: "100vh", background: "#0b0e14", color: "#e8eaf0", fontFamily: "'Space Grotesk', sans-serif" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 24px", borderBottom: "1px solid #232838" }}>
        <button onClick={onBack} style={{ background: "none", border: "1px solid #232838", borderRadius: 6, color: "#838aa0", fontSize: 13, padding: "6px 12px", cursor: "pointer" }}>
          ← Dashboard
        </button>
        <span style={{ fontWeight: 600 }}>Dark pattern detector</span>
      </header>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 24px" }}>
        <p style={{ color: "#838aa0", fontSize: 13, marginBottom: 16 }}>
          Scans a page's raw HTML for pre-ticked checkboxes and hidden/missing reject options in cookie or consent banners. Heuristic-based — it reads markup, not rendered styles, so it can miss patterns applied purely via CSS.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder="https://company.com"
            style={{ flex: 1, background: "#12151d", border: "1px solid #232838", borderRadius: 8, padding: "11px 14px", color: "#e8eaf0", fontSize: 14, outline: "none" }}
          />
          <button onClick={run} disabled={loading} style={{ background: "#ff4d4d", border: "none", borderRadius: 8, padding: "0 20px", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
            {loading ? "Scanning…" : "Scan"}
          </button>
        </div>

        {error && <div style={{ color: "#ff4d4d", fontSize: 14, marginTop: 16 }}>{error}</div>}

        {result && (
          <div style={{ marginTop: 24 }}>
            <p style={{ color: "#838aa0", fontSize: 13, marginBottom: 14 }}>{result.result.summary}</p>
            {result.result.patterns_found.length === 0 && (
              <div style={{ color: "#4ade9c", fontSize: 14 }}>No dark patterns detected from the available signals.</div>
            )}
            {result.result.patterns_found.map((p, i) => (
              <div key={i} style={{ background: "#12151d", border: "1px solid #232838", borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{p.pattern}</span>
                  <span style={{ color: SEV_COLOR[p.severity] || "#888", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>{p.severity}</span>
                </div>
                <div style={{ color: "#838aa0", fontSize: 13 }}>{p.evidence}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
