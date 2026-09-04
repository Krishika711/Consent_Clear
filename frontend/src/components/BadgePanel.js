import React, { useState } from "react";
import api from "../api";

export default function BadgePanel({ policyId, onBack }) {
  const [copied, setCopied] = useState(false);
  const backendBase = api.defaults.baseURL || window.location.origin;
  const badgeUrl = policyId ? `${backendBase}/api/badge/${policyId}` : null;
  const embedCode = badgeUrl ? `<img src="${badgeUrl}" alt="DPDP compliance badge" />` : "";

  const copy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0b0e14", color: "#e8eaf0", fontFamily: "'Space Grotesk', sans-serif" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 24px", borderBottom: "1px solid #232838" }}>
        <button onClick={onBack} style={{ background: "none", border: "1px solid #232838", borderRadius: 6, color: "#838aa0", fontSize: 13, padding: "6px 12px", cursor: "pointer" }}>
          ← Dashboard
        </button>
        <span style={{ fontWeight: 600 }}>DPDP verified badge</span>
      </header>

      <div style={{ maxWidth: 500, margin: "0 auto", padding: "32px 24px" }}>
        {!policyId && <div style={{ color: "#838aa0", fontSize: 14 }}>Run a scan first — the badge reflects that policy's latest risk score.</div>}
        {policyId && (
          <>
            <p style={{ color: "#838aa0", fontSize: 13, marginBottom: 18 }}>
              This badge always shows the latest scan result for this policy — embed it and it updates automatically as new scans come in.
            </p>
            <div style={{ background: "#12151d", border: "1px solid #232838", borderRadius: 10, padding: "24px", display: "flex", justifyContent: "center", marginBottom: 18 }}>
              <img src={badgeUrl} alt="DPDP compliance badge preview" />
            </div>
            <div style={{ background: "#0f1218", border: "1px solid #232838", borderRadius: 8, padding: "12px 14px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#e8eaf0", wordBreak: "break-all" }}>
              {embedCode}
            </div>
            <button onClick={copy} style={{ marginTop: 12, background: "none", border: "1px solid #232838", borderRadius: 6, color: "#838aa0", fontSize: 13, padding: "8px 16px", cursor: "pointer" }}>
              {copied ? "Copied!" : "Copy embed code"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
