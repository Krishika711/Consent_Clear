import React, { useState, useRef } from "react";
import api from "../api";

const JURISDICTIONS = [
  { value: "DPDP", label: "🇮🇳 DPDP Act 2023", desc: "India" },
  { value: "GDPR", label: "🇪🇺 GDPR", desc: "Europe" },
  { value: "CCPA", label: "🇺🇸 CCPA", desc: "California" },
];

export default function InputSection({ onResult, onLoading, onError }) {
  const [mode, setMode] = useState("url");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [jurisdiction, setJurisdiction] = useState("DPDP");
  const [monitor, setMonitor] = useState(false);
  const fileRef = useRef();

  const analyze = async () => {
    onError(null);
    onLoading(true);
    try {
      let res;
      if (mode === "url") {
        if (!url.trim()) throw new Error("Please enter a URL");
        res = await api.post("/api/analyze-url", { url: url.trim(), jurisdiction, monitor });
      } else {
        if (!file) throw new Error("Please select a PDF file");
        const form = new FormData();
        form.append("file", file);
        form.append("jurisdiction", jurisdiction);
        res = await api.post("/api/analyze-pdf", form);
      }
      onResult(res.data);
    } catch (err) {
      onError(err.response?.data?.error || err.message || "Something went wrong");
    } finally {
      onLoading(false);
    }
  };

  const tabStyle = (active) => ({
    padding: "8px 20px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    background: active ? "#1a1a1a" : "none",
    color: active ? "#f0f0f0" : "#555",
  });

  return (
    <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 16, padding: 24 }}>

      {/* Jurisdiction selector */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: "#555", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 10 }}>SELECT JURISDICTION</div>
        <div style={{ display: "flex", gap: 8 }}>
          {JURISDICTIONS.map((j) => (
            <button
              key={j.value}
              onClick={() => setJurisdiction(j.value)}
              style={{
                flex: 1,
                padding: "10px 8px",
                borderRadius: 10,
                border: jurisdiction === j.value ? "1px solid #3b82f6" : "1px solid #1e1e1e",
                background: jurisdiction === j.value ? "#0a1628" : "#080808",
                color: jurisdiction === j.value ? "#3b82f6" : "#555",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 500,
                textAlign: "center",
              }}
            >
              <div>{j.label}</div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{j.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* URL / PDF tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#080808", borderRadius: 10, padding: 4, width: "fit-content" }}>
        <button style={tabStyle(mode === "url")} onClick={() => setMode("url")}>Paste URL</button>
        <button style={tabStyle(mode === "pdf")} onClick={() => setMode("pdf")}>Upload PDF</button>
      </div>

      {mode === "url" && (
        <div>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && analyze()}
              placeholder="https://company.com/privacy-policy"
              style={{ flex: 1, background: "#080808", border: "1px solid #1e1e1e", borderRadius: 10, padding: "12px 16px", color: "#f0f0f0", fontSize: 14, outline: "none" }}
            />
            <button onClick={analyze} style={{ background: "#ef4444", border: "none", borderRadius: 10, padding: "12px 24px", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              Scan →
            </button>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, cursor: "pointer", color: "#888", fontSize: 13 }}>
            <input type="checkbox" checked={monitor} onChange={(e) => setMonitor(e.target.checked)} />
            Monitor this policy — re-check it periodically and alert me if it changes
          </label>
        </div>
      )}

      {mode === "pdf" && (
        <div>
          <div onClick={() => fileRef.current.click()} style={{ border: "2px dashed #1e1e1e", borderRadius: 12, padding: "32px 20px", textAlign: "center", cursor: "pointer", marginBottom: 12 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
            <div style={{ color: "#666", fontSize: 14 }}>
              {file ? <span style={{ color: "#ef4444" }}>{file.name}</span> : "Click to upload privacy policy PDF"}
            </div>
          </div>
          <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={(e) => setFile(e.target.files[0])} />
          {file && (
            <button onClick={analyze} style={{ width: "100%", background: "#ef4444", border: "none", borderRadius: 10, padding: "12px", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              Scan Policy →
            </button>
          )}
        </div>
      )}

      <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ color: "#444", fontSize: 12 }}>try:</span>
        {[
          { label: "Zomato", url: "https://www.zomato.com/privacy" },
          { label: "Razorpay", url: "https://razorpay.com/privacy/" },
          { label: "CRED", url: "https://cred.club/privacy-policy" },
        ].map((d) => (
          <button key={d.label} onClick={() => { setMode("url"); setUrl(d.url); }} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 6, padding: "4px 10px", color: "#555", fontSize: 12, cursor: "pointer" }}>
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
}
