import React, { useEffect, useState } from "react";
import api from "../api";

const SCORE_COLOR = { CRITICAL: "#ff4d4d", HIGH: "#ffb454", MEDIUM: "#ffb454", LOW: "#4ade9c" };

export default function HistoryPanel({ policyId, onBack }) {
  const [policies, setPolicies] = useState(null);
  const [policiesError, setPoliciesError] = useState(null);
  const [tab, setTab] = useState("all"); // all | monitored
  const [selected, setSelected] = useState(policyId || null);

  useEffect(() => {
    api.get("/api/my-policies")
      .then((res) => setPolicies(res.data.policies || []))
      .catch(() => setPoliciesError("Couldn't load your policies."));
  }, []);

  const filtered = (policies || []).filter((p) => (tab === "monitored" ? p.is_monitored : true));
  const selectedPolicy = (policies || []).find((p) => p.id === selected) || null;

  if (selected) {
    return (
      <PolicyDetail
        policy={selectedPolicy}
        policyId={selected}
        onBack={() => setSelected(null)}
        onDashboard={onBack}
      />
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0b0e14", color: "#e8eaf0", fontFamily: "'Space Grotesk', sans-serif" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 24px", borderBottom: "1px solid #232838" }}>
        <button onClick={onBack} style={{ background: "none", border: "1px solid #232838", borderRadius: 6, color: "#838aa0", fontSize: 13, padding: "6px 12px", cursor: "pointer" }}>
          ← Dashboard
        </button>
        <span style={{ fontWeight: 600 }}>Compliance history</span>
      </header>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "#12151d", border: "1px solid #232838", borderRadius: 10, padding: 4, width: "fit-content" }}>
          <TabButton active={tab === "all"} onClick={() => setTab("all")}>All policies</TabButton>
          <TabButton active={tab === "monitored"} onClick={() => setTab("monitored")}>🔄 Monitored</TabButton>
        </div>

        {policiesError && <div style={{ color: "#ff4d4d", fontSize: 14 }}>{policiesError}</div>}

        {policies === null && !policiesError && (
          <div style={{ color: "#838aa0", fontSize: 14 }}>Loading…</div>
        )}

        {policies !== null && filtered.length === 0 && (
          <div style={{ color: "#838aa0", fontSize: 14, lineHeight: 1.6 }}>
            {tab === "monitored"
              ? "No policies are being monitored yet. Turn on the monitor checkbox next time you scan a URL."
              : "No scans yet — run a scan and it'll show up here."}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelected(p.id)}
              style={{ background: "#12151d", border: "1px solid #232838", borderRadius: 10, padding: "16px 18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {p.url || "Uploaded PDF"}
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: "#838aa0", marginTop: 4, display: "flex", gap: 10 }}>
                  <span>{p.jurisdiction}</span>
                  <span>{p.scan_count} scan{p.scan_count === 1 ? "" : "s"}</span>
                  {p.is_monitored && <span style={{ color: "#4ade9c" }}>● monitored</span>}
                  <span>last: {p.last_scanned_at ? new Date(p.last_scanned_at).toLocaleDateString() : "—"}</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                {p.latest_risk_score && (
                  <span style={{ color: SCORE_COLOR[p.latest_risk_score] || "#e8eaf0", fontWeight: 700, fontSize: 13, fontFamily: "'IBM Plex Mono', monospace" }}>
                    {p.latest_risk_score}
                  </span>
                )}
                <span style={{ color: "#838aa0" }}>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PolicyDetail({ policy, policyId, onBack, onDashboard }) {
  const [history, setHistory] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/api/history/${policyId}`)
      .then((res) => setHistory(res.data.history || []))
      .catch(() => setError("Couldn't load history for this policy."));

    if (policy?.is_monitored) {
      api.get(`/api/alerts/${policyId}`)
        .then((res) => setAlerts(res.data.alerts || []))
        .catch(() => {}); // alerts are supplementary — don't block the timeline on this
    }
  }, [policyId, policy?.is_monitored]);

  return (
    <div style={{ minHeight: "100vh", background: "#0b0e14", color: "#e8eaf0", fontFamily: "'Space Grotesk', sans-serif" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 24px", borderBottom: "1px solid #232838" }}>
        <button onClick={onDashboard} style={{ background: "none", border: "1px solid #232838", borderRadius: 6, color: "#838aa0", fontSize: 13, padding: "6px 12px", cursor: "pointer" }}>
          ← Dashboard
        </button>
        <button onClick={onBack} style={{ background: "none", border: "1px solid #232838", borderRadius: 6, color: "#838aa0", fontSize: 13, padding: "6px 12px", cursor: "pointer" }}>
          ← All policies
        </button>
        <span style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {policy?.url || "Compliance history"}
        </span>
        {policy?.is_monitored && (
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#4ade9c", background: "rgba(74,222,156,0.12)", padding: "3px 8px", borderRadius: 20 }}>
            🔄 monitored
          </span>
        )}
      </header>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ fontSize: 13, color: "#838aa0", fontWeight: 600, letterSpacing: "0.05em", marginBottom: 12 }}>SCORE TIMELINE</div>
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

        {policy?.is_monitored && (
          <>
            <div style={{ fontSize: 13, color: "#838aa0", fontWeight: 600, letterSpacing: "0.05em", margin: "36px 0 12px" }}>DRIFT ALERTS</div>
            {alerts === null && <div style={{ color: "#838aa0", fontSize: 14 }}>Loading…</div>}
            {alerts?.length === 0 && (
              <div style={{ color: "#838aa0", fontSize: 14 }}>No changes detected yet — this policy is checked every 6 hours.</div>
            )}
            {alerts?.map((a, i) => (
              <div key={a.id} style={{ padding: "14px 0", borderBottom: i < alerts.length - 1 ? "1px solid #1a1e29" : "none" }}>
                <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{a.message}</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: "#838aa0", marginTop: 4 }}>
                  {new Date(a.sent_at).toLocaleString()}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 16px",
        borderRadius: 8,
        border: "none",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 500,
        background: active ? "#1a1e29" : "none",
        color: active ? "#e8eaf0" : "#838aa0",
      }}
    >
      {children}
    </button>
  );
}