import React, { useEffect, useState } from "react";
import api from "../api";

export default function NoticePanel({ scanId, onBack }) {
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!scanId) { setLoading(false); return; }
    api.post("/api/notice", { scan_id: scanId })
      .then((res) => setNotice(res.data.notice))
      .catch((err) => setError(err.response?.data?.error || "Couldn't generate the notice."))
      .finally(() => setLoading(false));
  }, [scanId]);

  return (
    <div style={{ minHeight: "100vh", background: "#0b0e14", color: "#e8eaf0", fontFamily: "'Space Grotesk', sans-serif" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 24px", borderBottom: "1px solid #232838" }}>
        <button onClick={onBack} style={{ background: "none", border: "1px solid #232838", borderRadius: 6, color: "#838aa0", fontSize: 13, padding: "6px 12px", cursor: "pointer" }}>
          ← Dashboard
        </button>
        <span style={{ fontWeight: 600 }}>Mock regulator notice</span>
      </header>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 24px" }}>
        {!scanId && <div style={{ color: "#838aa0", fontSize: 14 }}>Run a scan first — the notice is generated from that scan's violations.</div>}
        {loading && scanId && <div style={{ color: "#838aa0", fontSize: 14 }}>Drafting…</div>}
        {error && <div style={{ color: "#ff4d4d", fontSize: 14 }}>{error}</div>}
        {notice && (
          <pre style={{ background: "#12151d", border: "1px solid #232838", borderRadius: 10, padding: "22px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", color: "#e8eaf0" }}>
            {notice}
          </pre>
        )}
      </div>
    </div>
  );
}
