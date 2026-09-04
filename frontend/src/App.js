import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";
import InputSection from "./components/InputSection";
import VerdictCard from "./components/VerdictCard";
import Loader from "./components/Loader";
import ChatPanel from "./components/ChatPanel";
import HistoryPanel from "./components/HistoryPanel";
import NoticePanel from "./components/NoticePanel";
import DarkPatternPanel from "./components/DarkPatternPanel";
import BadgePanel from "./components/BadgePanel";

// Shared "you need a scan first" screen, reused by any panel that
// requires a scanId/policyId we don't have yet. Keeping this here
// (instead of silently rerouting in onNavigate) means clicking a
// dashboard card always opens the panel it says it opens.
function RequiresScan({ title, onBack, onGoScan }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0b0e14", color: "#e8eaf0", fontFamily: "'Space Grotesk', sans-serif" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 24px", borderBottom: "1px solid #232838" }}>
        <button onClick={onBack} style={{ background: "none", border: "1px solid #232838", borderRadius: 6, color: "#838aa0", fontSize: 13, padding: "6px 12px", cursor: "pointer" }}>
          ← Dashboard
        </button>
        <span style={{ fontWeight: 600 }}>{title}</span>
      </header>
      <div style={{ maxWidth: 460, margin: "120px auto 0", textAlign: "center", padding: "0 24px" }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>🔍</div>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 10 }}>Scan a policy first</h2>
        <p style={{ color: "#838aa0", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
          {title} needs a scan to work with. Run a scan and you'll be able to come back here.
        </p>
        <button
          onClick={onGoScan}
          style={{ background: "#ff4d4d", border: "none", borderRadius: 8, padding: "12px 24px", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
        >
          Go to new scan →
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = checking, null = logged out
  const [view, setView] = useState("dashboard"); // dashboard | scan | result | chat | history | notice | darkpattern | badge

  const [result, setResult] = useState(null);
  const [scanId, setScanId] = useState(null);
  const [policyId, setPolicyId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return <div style={{ minHeight: "100vh", background: "#0b0e14" }} />;
  }
  if (!session) {
    return <AuthPage />;
  }

  const handleResult = (data) => {
    setResult(data.result);
    setScanId(data.scan_id);
    setPolicyId(data.policy_id);
    setView("result");
  };

  const goToScan = () => { setResult(null); setError(null); setView("scan"); };
  const goToDashboard = () => setView("dashboard");

  if (view === "dashboard") {
    return (
      <Dashboard
        userEmail={session.user.email}
        onNavigate={(key) => {
          // Always go to the panel that was actually clicked. Panels
          // that need a scanId/policyId show their own "scan first"
          // prompt below instead of us silently redirecting here.
          if (key === "scan" || key === "monitor") goToScan();
          else setView(key);
        }}
      />
    );
  }

  if (view === "chat") {
    return scanId
      ? <ChatPanel scanId={scanId} onBack={goToDashboard} />
      : <RequiresScan title="Chat with the policy" onBack={goToDashboard} onGoScan={goToScan} />;
  }
  if (view === "history") {
    return policyId
      ? <HistoryPanel policyId={policyId} onBack={goToDashboard} />
      : <RequiresScan title="Compliance history" onBack={goToDashboard} onGoScan={goToScan} />;
  }
  if (view === "notice") {
    return scanId
      ? <NoticePanel scanId={scanId} onBack={goToDashboard} />
      : <RequiresScan title="Mock regulator notice" onBack={goToDashboard} onGoScan={goToScan} />;
  }
  if (view === "badge") {
    return policyId
      ? <BadgePanel policyId={policyId} onBack={goToDashboard} />
      : <RequiresScan title="DPDP verified badge" onBack={goToDashboard} onGoScan={goToScan} />;
  }
  if (view === "darkpattern") return <DarkPatternPanel onBack={goToDashboard} />;

  // view === "scan" or "result"
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a" }}>
      <div style={{ borderBottom: "1px solid #1a1a1a", padding: "20px 24px", display: "flex", alignItems: "center", gap: "10px" }}>
        <button onClick={goToDashboard} style={{ background: "none", border: "1px solid #1a1a1a", borderRadius: 6, color: "#888", fontSize: 12, padding: "6px 10px", cursor: "pointer", marginRight: 8 }}>
          ← Dashboard
        </button>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: result ? (result.risk_score === "CRITICAL" ? "#ef4444" : result.risk_score === "HIGH" ? "#f97316" : result.risk_score === "MEDIUM" ? "#eab308" : "#22c55e") : "#3b82f6" }} />
        <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: "-0.3px" }}>ConsentClear</span>
        <span style={{ color: "#555", fontSize: 13, marginLeft: 4 }}>DPDP Act 2023 Compliance Scanner</span>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px" }}>
        {!result && !loading && (
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-1px", lineHeight: 1.2, marginBottom: 12 }}>
              Know what you're<br />
              <span style={{ color: "#3b82f6" }}>actually agreeing to.</span>
            </h1>
            <p style={{ color: "#666", fontSize: 15, maxWidth: 440, margin: "0 auto" }}>
              Paste a privacy policy URL or upload a PDF. Get a DPDP Act compliance verdict in 30 seconds.
            </p>
          </div>
        )}

        {!result && !loading && (
          <InputSection onResult={handleResult} onLoading={setLoading} onError={setError} />
        )}

        {error && !loading && (
          <div style={{ background: "#1a0a0a", border: "1px solid #3a1a1a", borderRadius: 12, padding: "14px 18px", color: "#ef4444", fontSize: 14, marginTop: 16 }}>
            {error}
            <button onClick={() => { setError(null); setResult(null); }} style={{ marginLeft: 12, color: "#888", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>try again</button>
          </div>
        )}

        {loading && <Loader />}

        {result && !loading && (
          <>
            <VerdictCard result={result} />
            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              {scanId && (
                <button onClick={() => setView("chat")} style={{ flex: 1, minWidth: 140, background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 8, color: "#3b82f6", padding: "10px 16px", cursor: "pointer", fontSize: 14 }}>
                  💬 Chat
                </button>
              )}
              {policyId && (
                <button onClick={() => setView("history")} style={{ flex: 1, minWidth: 140, background: "#0f0f0f", border: "1px solid #1e1e1e", borderRadius: 8, color: "#888", padding: "10px 16px", cursor: "pointer", fontSize: 14 }}>
                  📈 History
                </button>
              )}
              {scanId && (
                <button onClick={() => setView("notice")} style={{ flex: 1, minWidth: 140, background: "#0f0f0f", border: "1px solid #1e1e1e", borderRadius: 8, color: "#888", padding: "10px 16px", cursor: "pointer", fontSize: 14 }}>
                  📜 Mock notice
                </button>
              )}
              {policyId && (
                <button onClick={() => setView("badge")} style={{ flex: 1, minWidth: 140, background: "#0f0f0f", border: "1px solid #1e1e1e", borderRadius: 8, color: "#888", padding: "10px 16px", cursor: "pointer", fontSize: 14 }}>
                  🛡️ Badge
                </button>
              )}
            </div>
            <button
              onClick={goToScan}
              style={{ marginTop: 10, background: "none", border: "1px solid #222", borderRadius: 8, color: "#666", padding: "10px 20px", cursor: "pointer", fontSize: 14, width: "100%" }}
            >
              scan another policy
            </button>
          </>
        )}
      </div>
    </div>
  );
}