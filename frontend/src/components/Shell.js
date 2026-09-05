import React from "react";
import { supabase } from "../lib/supabaseClient";

const ICONS = {
  dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
  scan: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>,
  history: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>,
  monitoring: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18" /><path d="M7 15l4-4 3 3 5-6" /></svg>,
  darkpattern: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21l6-6M3 15h6v6M21 3l-6 6M21 9V3h-6" /></svg>,
};

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard" },
  { key: "scan", label: "New Scan", icon: "scan" },
  { key: "history", label: "History", icon: "history" },
  { key: "monitoring", label: "Monitoring", icon: "monitoring" },
  { key: "darkpattern", label: "Dark Patterns", icon: "darkpattern" },
];

export default function Shell({ active, onNavigate, userEmail, children, showChatFab }) {
  const logout = () => supabase.auth.signOut();

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="topbar">
        <div className="brand"><span className="mark">R</span> RedFlag</div>
        <div className="topbar-right">
          <span>{userEmail}</span>
          <button className="logout" onClick={logout}>Log out</button>
        </div>
      </div>

      <div className="layout">
        <div className="sidebar">
          <div className="side-brand">
            <div className="icon">🛡️</div>
            <div className="titles">
              <div>ConsentClear</div>
              <div>PRIVACY SCANNER</div>
            </div>
          </div>

          <div className="nav-label">NAVIGATION</div>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`nav-item${active === item.key ? " active" : ""}`}
              onClick={() => onNavigate(item.key)}
            >
              {ICONS[item.icon]}
              {item.label}
            </button>
          ))}
        </div>

        <div className="main">
          {children}
        </div>
      </div>

      {showChatFab && active !== "chat" && (
        <button className="chat-fab" onClick={() => onNavigate("chat")} aria-label="Chat with the policy">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
        </button>
      )}
    </div>
  );
}