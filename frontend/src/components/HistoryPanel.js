import React, { useEffect, useState } from "react";
import api from "../api";

const SCORE_COLOR = { CRITICAL: "#f0847a", HIGH: "#e0912f", MEDIUM: "#d4b23c", LOW: "#3fb377" };

export default function HistoryPanel({ policyId, initialTab = "all" }) {
  const [policies, setPolicies] = useState(null);
  const [policiesError, setPoliciesError] = useState(null);
  const [tab, setTab] = useState(initialTab);
  const [selected, setSelected] = useState(policyId || null);

  useEffect(() => {
    api.get("/api/my-policies")
      .then((res) => setPolicies(res.data.policies || []))
      .catch(() => setPoliciesError("Couldn't load your policies."));
  }, []);

  const filtered = (policies || []).filter((p) => (tab === "monitored" ? p.is_monitored : true));
  const selectedPolicy = (policies || []).find((p) => p.id === selected) || null;

  if (selected) {
    return <PolicyDetail policy={selectedPolicy} policyId={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div>
      <div className="page-head"><h2>{tab === "monitored" ? "🔄 Monitoring" : "📈 Compliance history"}</h2></div>

      <div className="hist-tabs">
        <button className={`tab${tab === "all" ? " active" : ""}`} onClick={() => setTab("all")}>All policies</button>
        <button className={`tab${tab === "monitored" ? " active" : ""}`} onClick={() => setTab("monitored")}>🔄 Monitored</button>
      </div>

      {policiesError && <div className="empty-note" style={{ color: "#f0847a" }}>{policiesError}</div>}
      {policies === null && !policiesError && <div className="empty-note">Loading…</div>}

      {policies !== null && filtered.length === 0 && (
        <div className="empty-note">
          {tab === "monitored"
            ? "No policies are being monitored yet. Turn on the monitor checkbox next time you scan a URL."
            : "No scans yet — run a scan and it'll show up here."}
        </div>
      )}

      {filtered.map((p) => (
        <div key={p.id} className="policy-row" onClick={() => setSelected(p.id)}>
          <div style={{ minWidth: 0 }}>
            <div className="policy-url">{p.url || "Uploaded PDF"}</div>
            <div className="policy-meta">
              <span>{p.jurisdiction}</span>
              <span>{p.scan_count} scan{p.scan_count === 1 ? "" : "s"}</span>
              {p.is_monitored && <span className="monitored">● monitored</span>}
              <span>last: {p.last_scanned_at ? new Date(p.last_scanned_at).toLocaleDateString() : "—"}</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            {p.latest_risk_score && (
              <span className="policy-score" style={{ color: SCORE_COLOR[p.latest_risk_score] || "#e8e9ea" }}>{p.latest_risk_score}</span>
            )}
            <span style={{ color: "#8b8f96" }}>→</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function PolicyDetail({ policy, policyId, onBack }) {
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
        .catch(() => {});
    }
  }, [policyId, policy?.is_monitored]);

  return (
    <div>
      <div className="page-head">
        <button className="back-btn" onClick={onBack}>← All policies</button>
        <h2 style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{policy?.url || "Compliance history"}</h2>
        {policy?.is_monitored && <span className="pill">🔄 monitored</span>}
      </div>

      <div className="section-label" style={{ marginBottom: 12 }}>SCORE TIMELINE</div>
      {error && <div className="empty-note" style={{ color: "#f0847a" }}>{error}</div>}
      {history?.length === 0 && <div className="empty-note">Only one scan so far — history will fill in as this policy gets re-checked.</div>}
      {history?.map((h) => (
        <div key={h.id} className="timeline-row">
          <div className="timeline-date">{new Date(h.created_at).toLocaleDateString()}</div>
          <div className="timeline-score" style={{ color: SCORE_COLOR[h.risk_score] || "#e8e9ea" }}>{h.risk_score}</div>
        </div>
      ))}

      {policy?.is_monitored && (
        <>
          <div className="section-label" style={{ margin: "32px 0 12px" }}>DRIFT ALERTS</div>
          {alerts === null && <div className="empty-note">Loading…</div>}
          {alerts?.length === 0 && <div className="empty-note">No changes detected yet — this policy is checked every 6 hours.</div>}
          {alerts?.map((a) => (
            <div key={a.id} className="alert-row">
              <div className="alert-msg">{a.message}</div>
              <div className="alert-date">{new Date(a.sent_at).toLocaleString()}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}