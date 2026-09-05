import React, { useEffect, useState } from "react";
import api from "../api";

const CARDS = [
  { key: "scan", icon: "🔍", tag: "LIVE", title: "New scan", desc: "Paste a policy URL or upload a PDF. Get a clause-level DPDP verdict in 30 seconds.", stat: "Start now" },
  { key: "chat", icon: "💬", tag: "LIVE", title: "Chat with the policy", desc: "Ask plain questions like \u201ccan they sell my data?\u201d and get answers tied to the exact clause and section.", stat: "Needs a scan first" },
  { key: "monitoring", icon: "🔄", tag: "LIVE", title: "Continuous monitoring", desc: "Re-scans policies on a schedule and flags the moment a company quietly edits a clause.", stat: "View monitored" },
  { key: "history", icon: "📈", tag: "LIVE", title: "Compliance history", desc: "A timeline of every score change, so you can see whether compliance is trending up or down.", stat: "Browse all scans" },
  { key: "darkpattern", icon: "🚩", tag: "LIVE", title: "Dark pattern detector", desc: "Scans a page's cookie/consent banner markup for pre-ticked boxes and hidden reject options.", stat: "Enter any URL" },
  { key: "notice", icon: "📜", tag: "LIVE", title: "Mock regulator notice", desc: "Generates an illustrative DPDP Board-style notice from a scan's violations.", stat: "Needs a scan first" },
  { key: "badge", icon: "🛡️", tag: "LIVE", title: "DPDP verified badge", desc: "An embeddable, live-linked badge for your site showing the latest scan result.", stat: "Needs a scan first" },
];

export default function Dashboard({ onNavigate }) {
  const [policies, setPolicies] = useState([]);
  const [loadingPolicies, setLoadingPolicies] = useState(true);

  useEffect(() => {
    api.get("/api/my-policies")
      .then((res) => setPolicies(res.data.policies || []))
      .catch(() => setPolicies([]))
      .finally(() => setLoadingPolicies(false));
  }, []);

  const monitoredCount = policies.filter((p) => p.is_monitored).length;
  const lastScan = policies[0]?.last_scanned_at || policies[0]?.created_at;

  return (
    <div>
      <div className="eyebrow">DPDP COMPLIANCE WORKSPACE</div>
      <h1 className="hero">Your privacy policy, audited like a regulator would.</h1>
      <p className="hero-sub">Every scan, conversation, and alert lives here. Start with a new scan below.</p>

      <div className="stat-row">
        <div className="stat-cell">
          <div className="stat-num">{loadingPolicies ? "…" : policies.length}</div>
          <div className="stat-label">Policies scanned</div>
        </div>
        <div className="stat-cell">
          <div className="stat-num">{loadingPolicies ? "…" : monitoredCount}</div>
          <div className="stat-label">Policies monitored</div>
        </div>
        <div className="stat-cell">
          <div className="stat-num" style={{ fontSize: 16, paddingTop: 5 }}>
            {lastScan ? new Date(lastScan).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
          </div>
          <div className="stat-label">Last scan</div>
        </div>
      </div>

      <div className="card-grid">
        {CARDS.map((c) => (
          <button key={c.key} className="feature-card" onClick={() => onNavigate(c.key)}>
            <div className="fc-top">
              <div className="fc-icon">{c.icon}</div>
              <span className="fc-tag live">{c.tag}</span>
            </div>
            <div className="fc-title">{c.title}</div>
            <div className="fc-desc">{c.desc}</div>
            <div className="fc-foot">
              <span>{c.stat}</span>
              <div className="arrow">→</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}