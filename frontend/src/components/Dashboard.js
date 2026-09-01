import React, { useEffect, useState } from "react";
import api from "../api";
import { supabase } from "../lib/supabaseClient";

const CARDS = [
  { key: "scan", icon: "🔍", tag: "LIVE", title: "New scan", desc: "Paste a policy URL or upload a PDF. Get a clause-level DPDP verdict in 30 seconds.", stat: "Start now", wide: true },
  { key: "chat", icon: "💬", tag: "LIVE", title: "Chat with the policy", desc: "Ask plain questions like \u201ccan they sell my data?\u201d and get answers tied to the exact clause and section.", stat: "Needs a scan first" },
  { key: "monitor", icon: "🔄", tag: "LIVE", title: "Continuous monitoring", desc: "Re-scans policies on a schedule and flags the moment a company quietly edits a clause.", stat: "" },
  { key: "history", icon: "📈", tag: "LIVE", title: "Compliance history", desc: "A timeline of every score change, so you can see whether compliance is trending up or down.", stat: "Needs a scan first" },
  { key: "darkpattern", icon: "🚩", tag: "SOON", title: "Dark pattern detector", desc: "Will scan live cookie banners and consent UIs for pre-ticked boxes and hidden reject buttons.", stat: "Coming soon", disabled: true },
  { key: "notice", icon: "📜", tag: "SOON", title: "Mock regulator notice", desc: "Will generate a realistic DPDP Board notice showing what your gaps could trigger.", stat: "Coming soon", disabled: true },
  { key: "badge", icon: "🛡️", tag: "SOON", title: "DPDP verified badge", desc: "An embeddable, live-linked trust badge for your site — like an SSL badge, but for privacy.", stat: "Coming soon", disabled: true },
];

const TAG_STYLE = {
  LIVE: { background: "rgba(74,222,156,0.12)", color: "#4ade9c" },
  NEW: { background: "rgba(255,180,84,0.12)", color: "#ffb454" },
  SOON: { background: "rgba(139,148,255,0.12)", color: "#8b94ff" },
};

export default function Dashboard({ onNavigate, userEmail }) {
  const [policies, setPolicies] = useState([]);
  const [loadingPolicies, setLoadingPolicies] = useState(true);

  useEffect(() => {
    api.get("/api/my-policies")
      .then((res) => setPolicies(res.data.policies || []))
      .catch(() => setPolicies([]))
      .finally(() => setLoadingPolicies(false));
  }, []);

  const monitoredCount = policies.filter((p) => p.is_monitored).length;

  const logout = () => supabase.auth.signOut();

  return (
    <div style={{ minHeight: "100vh", background: "#0b0e14", color: "#e8eaf0", fontFamily: "'Space Grotesk', sans-serif" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 40px", borderBottom: "1px solid #232838" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: 18 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: "linear-gradient(135deg, #ff4d4d, #b32424)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🚩</div>
          RedFlag
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#838aa0" }}>{userEmail}</span>
          <button onClick={logout} style={{ background: "none", border: "1px solid #232838", borderRadius: 6, color: "#838aa0", fontSize: 12, padding: "6px 12px", cursor: "pointer" }}>
            Log out
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1220, margin: "0 auto", padding: "48px 40px 100px" }}>
        <div style={{ marginBottom: 44, maxWidth: 640 }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, color: "#ff4d4d", marginBottom: 12 }}>DPDP COMPLIANCE WORKSPACE</div>
          <h1 style={{ fontSize: 34, fontWeight: 600, lineHeight: 1.2 }}>Your privacy policy, audited like a regulator would.</h1>
          <p style={{ color: "#838aa0", fontSize: 15, lineHeight: 1.6, marginTop: 12 }}>
            Every scan, conversation, and alert lives here. Start with a new scan below.
          </p>
        </div>

        <div style={{ display: "flex", gap: 28, marginBottom: 48, padding: "20px 24px", background: "#12151d", border: "1px solid #232838", borderRadius: 10, flexWrap: "wrap" }}>
          <Metric label="Policies scanned" value={loadingPolicies ? "…" : policies.length} />
          <Divider />
          <Metric label="Policies monitored" value={loadingPolicies ? "…" : monitoredCount} color="#4ade9c" />
          <Divider />
          <Metric label="Last scan" value={policies[0] ? new Date(policies[0].created_at).toLocaleDateString() : "—"} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {CARDS.map((c) => (
            <div
              key={c.key}
              onClick={() => !c.disabled && onNavigate(c.key)}
              style={{
                gridColumn: c.wide ? "span 2" : "span 1",
                position: "relative",
                background: "#12151d",
                border: "1px solid #232838",
                borderRadius: 12,
                padding: "26px 24px",
                cursor: c.disabled ? "default" : "pointer",
                opacity: c.disabled ? 0.55 : 1,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
                <div style={{ width: 42, height: 42, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, background: "#1a1e29", border: "1px solid #232838" }}>
                  {c.icon}
                </div>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, padding: "3px 8px", borderRadius: 20, ...TAG_STYLE[c.tag] }}>
                  {c.tag}
                </span>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>{c.title}</h3>
              <p style={{ fontSize: 13.5, color: "#838aa0", lineHeight: 1.55, marginBottom: 18, minHeight: 60 }}>{c.desc}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, borderTop: "1px solid #232838" }}>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#e8eaf0" }}>{c.stat}</span>
                {!c.disabled && (
                  <div style={{ width: 26, height: 26, borderRadius: "50%", border: "1px solid #232838", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#838aa0" }}>→</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, color = "#e8eaf0" }) {
  return (
    <div style={{ flex: 1, minWidth: 100 }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 26, fontWeight: 500, color }}>{value}</div>
      <div style={{ fontSize: 12.5, color: "#838aa0", marginTop: 2 }}>{label}</div>
    </div>
  );
}

function Divider() {
  return <div style={{ width: 1, background: "#232838" }} />;
}
