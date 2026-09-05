import React, { useState, useRef } from "react";
import api from "../api";

const JURISDICTIONS = [
  { value: "DPDP", cc: "IN", label: "DPDP Act 2023", desc: "India" },
  { value: "GDPR", cc: "EU", label: "GDPR", desc: "Europe" },
  { value: "CCPA", cc: "US", label: "CCPA", desc: "California" },
];

const TRY_LINKS = [
  { label: "Zomato", url: "https://www.zomato.com/privacy" },
  { label: "Razorpay", url: "https://razorpay.com/privacy/" },
  { label: "CRED", url: "https://cred.club/privacy-policy" },
];

export default function InputSection({ onResult, onLoading, onError }) {
  const [mode, setMode] = useState("url");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [jurisdiction, setJurisdiction] = useState("DPDP");
  const [monitor, setMonitor] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef();

  const analyze = async () => {
    onError(null);
    onLoading(true);
    setBusy(true);
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
      onResult({ ...res.data, source: mode === "url" ? url.trim() : (file?.name || "Uploaded PDF") });
    } catch (err) {
      onError(err.response?.data?.error || err.message || "Something went wrong");
    } finally {
      onLoading(false);
      setBusy(false);
    }
  };

  return (
    <>
      <div className="scan-hero">
        <h1>Know what you're <span className="accent">actually agreeing to.</span></h1>
        <p>Paste a privacy policy URL or upload a PDF. Get a DPDP Act compliance verdict in 30 seconds.</p>
      </div>

      <div className="scan-box">
        <div className="juris-label">SELECT JURISDICTION</div>
        <div className="juris-row">
          {JURISDICTIONS.map((j) => (
            <button
              key={j.value}
              className={`juris-opt${jurisdiction === j.value ? " active" : ""}`}
              onClick={() => setJurisdiction(j.value)}
            >
              <div className="name"><span className="cc">{j.cc}</span>{j.label}</div>
              <div className="country">{j.desc}</div>
            </button>
          ))}
        </div>

        <div className="tab-row">
          <button className={`tab${mode === "url" ? " active" : ""}`} onClick={() => setMode("url")}>Paste URL</button>
          <button className={`tab${mode === "pdf" ? " active" : ""}`} onClick={() => setMode("pdf")}>Upload PDF</button>
        </div>

        {mode === "url" && (
          <>
            <div className="scan-input-row">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && analyze()}
                placeholder="https://company.com/privacy-policy"
              />
              <button className="scan-btn" onClick={analyze} disabled={busy}>{busy ? "Scanning…" : "Scan →"}</button>
            </div>
            <label className="monitor-row">
              <span className={`checkbox${monitor ? " checked" : ""}`}>{monitor ? "✓" : ""}</span>
              <input type="checkbox" checked={monitor} onChange={(e) => setMonitor(e.target.checked)} style={{ display: "none" }} />
              Monitor this policy — re-check it periodically and alert me if it changes
            </label>
          </>
        )}

        {mode === "pdf" && (
          <div>
            <div className="dropzone" onClick={() => fileRef.current.click()}>
              <div className="dz-icon">📄</div>
              <div className="dz-text">
                {file ? <span className="dz-file">{file.name}</span> : "Click to upload privacy policy PDF"}
              </div>
            </div>
            <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={(e) => setFile(e.target.files[0])} />
            {file && (
              <button className="scan-btn" style={{ width: "100%", padding: "12px 0", marginBottom: 16 }} onClick={analyze} disabled={busy}>
                {busy ? "Scanning…" : "Scan Policy →"}
              </button>
            )}
          </div>
        )}

        <div className="try-row">
          try: {TRY_LINKS.map((d) => (
            <button key={d.label} className="try-chip" onClick={() => { setMode("url"); setUrl(d.url); }}>
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}