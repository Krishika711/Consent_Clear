import React, { useRef } from "react";
import "../styles/landing.css";
import Mascot from "./Mascot";

/**
 * Marketing landing page shown before login. This replaces the
 * uploaded static HTML's fake "Demo only" auth modal: the nav and
 * hero buttons call onLogin/onSignup, which the parent (App.js) uses
 * to show the real Supabase-backed AuthPage instead.
 */
export default function LandingPage({ onLogin, onSignup }) {
  const stageRef = useRef(null);
  const scrollToDemo = () => stageRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="landing-page">
      <div className="bg-field" />
      <div className="grid-floor" />

      <nav>
        <div className="brand"><Mascot size={30} /> ConsentClear</div>
        <div className="nav-links">
          <a href="#product">Product</a>
          <a href="#jurisdictions">Jurisdictions</a>
          <a href="#pricing">Pricing</a>
          <a href="#docs">Docs</a>
        </div>
        <div className="nav-actions">
          <button className="btn-ghost" onClick={onLogin}>Log in</button>
          <button className="btn-primary" onClick={onSignup}>Sign up free</button>
        </div>
      </nav>

      <div className="hero">
        <div className="hero-badge"><span className="dot" /> Built for DPDP Act 2023 · GDPR · CCPA</div>
        <h1 className="hero-title">Know what you're <span className="accent">actually agreeing to.</span></h1>
        <p className="hero-sub">ConsentClear reads privacy policies the way a regulator would — flagging every non-compliant clause, in plain language, in under 30 seconds.</p>
        <div className="hero-cta">
          <button className="btn-big-primary" onClick={onSignup}>Get started free →</button>
          <button className="btn-big-ghost" onClick={scrollToDemo}>Watch a scan</button>
        </div>
      </div>

      <div className="stage" ref={stageRef}>
        <div className="mock-wrap" style={{ position: "relative" }}>
          <Mascot size={64} className="mock-mascot" />
          <div className="mock-card">
            <div className="mock-topbar"><span className="mock-dot" /><span className="mock-dot" /><span className="mock-dot" /></div>
            <div className="mock-score-row">
              <div className="mock-ring"><b>88</b></div>
              <div>
                <div className="mock-title">razorpay.com/privacy</div>
                <div className="mock-sub">Scanned just now · DPDP Act 2023</div>
              </div>
            </div>
            <div className="mock-bars">
              <div className="mock-bar-card">
                <div className="mock-bar-label">CRITICAL</div>
                <div className="mock-bar-val" style={{ color: "#f0847a" }}>0</div>
                <div className="mock-bar-track"><div className="mock-bar-fill" style={{ width: "0%", background: "#f0847a" }} /></div>
              </div>
              <div className="mock-bar-card">
                <div className="mock-bar-label">HIGH</div>
                <div className="mock-bar-val" style={{ color: "#e0912f" }}>1</div>
                <div className="mock-bar-track"><div className="mock-bar-fill" style={{ width: "25%", background: "#e0912f" }} /></div>
              </div>
              <div className="mock-bar-card">
                <div className="mock-bar-label">COMPLIANT</div>
                <div className="mock-bar-val" style={{ color: "#3fd695" }}>34</div>
                <div className="mock-bar-track"><div className="mock-bar-fill" style={{ width: "94%", background: "#3fd695" }} /></div>
              </div>
            </div>
            <div className="float-chip chip-1"><span className="chip-dot" />Scan complete</div>
            <div className="float-chip chip-2"><span className="chip-dot" />1 clause needs review</div>
          </div>
        </div>
      </div>

      <div className="features">
        <div className="feat">
          <div className="feat-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4b8bf0" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg></div>
          <h3>Clause-level scanning</h3>
          <p>Every sentence checked against the exact section of the Act it falls under — not a vague risk score.</p>
        </div>
        <div className="feat">
          <div className="feat-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4b8bf0" strokeWidth="2"><path d="M3 3v18h18" /><path d="M7 15l4-4 3 3 5-6" /></svg></div>
          <h3>Continuous monitoring</h3>
          <p>Get alerted the moment a company quietly edits a policy you're tracking.</p>
        </div>
        <div className="feat">
          <div className="feat-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4b8bf0" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg></div>
          <h3>Chat with the policy</h3>
          <p>Ask "can they sell my data?" in plain words, get an answer tied to the exact clause.</p>
        </div>
      </div>

      <footer>© 2026 ConsentClear. Not legal advice.</footer>
    </div>
  );
}
