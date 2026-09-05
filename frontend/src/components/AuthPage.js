import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        setInfo("Account created. Check your inbox to confirm your email, then log in.");
        setMode("login");
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div style={{ width: "100%", maxWidth: 380, padding: "0 24px" }}>
        <div className="auth-brand-row">
          <span className="brand"><span className="mark">R</span></span>
          <span className="name">ConsentClear</span>
        </div>

        <div className="auth-card">
          <h1>{mode === "login" ? "Log in" : "Create an account"}</h1>
          <div className="sub">{mode === "login" ? "Welcome back to your compliance workspace." : "Save scans, enable monitoring, and track history."}</div>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              className="auth-field"
              type="email"
              required
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="auth-field"
              type="password"
              required
              minLength={6}
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <div className="auth-error">{error}</div>}
            {info && <div className="auth-info">{info}</div>}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
            </button>
          </form>

          <div className="auth-switch">
            {mode === "login" ? (
              <>Don't have an account?{" "}
                <button onClick={() => { setMode("signup"); setError(null); setInfo(null); }}>Sign up</button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => { setMode("login"); setError(null); setInfo(null); }}>Log in</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}