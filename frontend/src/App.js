import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import "./styles/theme.css";
import AuthPage from "./components/AuthPage";
import LandingPage from "./components/LandingPage";
import Shell from "./components/Shell";
import Dashboard from "./components/Dashboard";
import InputSection from "./components/InputSection";
import VerdictCard from "./components/VerdictCard";
import Loader from "./components/Loader";
import ChatPanel from "./components/ChatPanel";
import HistoryPanel from "./components/HistoryPanel";
import NoticePanel from "./components/NoticePanel";
import DarkPatternPanel from "./components/DarkPatternPanel";
import BadgePanel from "./components/BadgePanel";
import RequiresScan from "./components/RequiresScan";

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = checking, null = logged out
  const [view, setView] = useState("dashboard");
  const [authGate, setAuthGate] = useState("landing"); // "landing" | "login" | "signup", only used while logged out

  const [result, setResult] = useState(null);
  const [scanId, setScanId] = useState(null);
  const [policyId, setPolicyId] = useState(null);
  const [sourceLabel, setSourceLabel] = useState(null);
  const [scannedAt, setScannedAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return <div style={{ minHeight: "100vh", background: "#0a0b0d" }} />;
  }
  if (!session) {
    if (authGate === "landing") {
      return (
        <LandingPage
          onLogin={() => setAuthGate("login")}
          onSignup={() => setAuthGate("signup")}
        />
      );
    }
    return <AuthPage initialMode={authGate} onBack={() => setAuthGate("landing")} />;
  }

  const handleResult = (data) => {
    setResult(data.result);
    setScanId(data.scan_id);
    setPolicyId(data.policy_id);
    setSourceLabel(data.source || null);
    setScannedAt(new Date().toISOString());
    setView("result");
  };

  const goToScan = () => { setResult(null); setError(null); setView("scan"); };
  const goToDashboard = () => setView("dashboard");

  const renderMain = () => {
    switch (view) {
      case "dashboard":
        return <Dashboard onNavigate={setView} />;

      case "chat":
        return scanId
          ? <ChatPanel scanId={scanId} />
          : <RequiresScan title="Chat with the policy" onGoScan={goToScan} />;

      case "history":
        return <HistoryPanel policyId={policyId} initialTab="all" />;

      case "monitoring":
        return <HistoryPanel initialTab="monitored" />;

      case "notice":
        return scanId
          ? <NoticePanel scanId={scanId} />
          : <RequiresScan title="Mock regulator notice" onGoScan={goToScan} />;

      case "badge":
        return policyId
          ? <BadgePanel policyId={policyId} />
          : <RequiresScan title="DPDP verified badge" onGoScan={goToScan} />;

      case "darkpattern":
        return <DarkPatternPanel />;

      case "scan":
      case "result":
      default:
        return (
          <>
            {!result && !loading && <InputSection onResult={handleResult} onLoading={setLoading} onError={setError} />}

            {error && !loading && (
              <div className="error-box">
                {error}
                <button className="retry" onClick={() => { setError(null); setResult(null); }}>try again</button>
              </div>
            )}

            {loading && <Loader />}

            {result && !loading && (
              <VerdictCard result={result} sourceLabel={sourceLabel} scannedAt={scannedAt} onRescan={goToScan} />
            )}
          </>
        );
    }
  };

  // Sidebar highlights "scan" for both the input screen and its results
  const activeNav = view === "result" ? "scan" : view;

  return (
    <Shell active={activeNav} onNavigate={setView} userEmail={session.user.email} showChatFab={!!scanId}>
      {renderMain()}
    </Shell>
  );
}