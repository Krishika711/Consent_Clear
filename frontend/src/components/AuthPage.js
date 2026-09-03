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
        // onAuthStateChange in App.js picks this up automatically
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0b0e14", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk', sans-serif", color: "#e8eaf0" }}>
      <div style={{ width: "100%", maxWidth: 380, padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 32 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: "linear-gradient(135deg, #ff4d4d, #b32424)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🚩</div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>ConsentClear</span>
        </div>

        <div style={{ background: "#12151d", border: "1px solid #232838", borderRadius: 12, padding: "28px 26px" }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
            {mode === "login" ? "Log in" : "Create an account"}
          </h1>
          <p style={{ color: "#838aa0", fontSize: 13, marginBottom: 20 }}>
            {mode === "login" ? "Welcome back to your compliance workspace." : "Save scans, enable monitoring, and track history."}
          </p>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="email"
              required
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ background: "#0b0e14", border: "1px solid #232838", borderRadius: 8, padding: "10px 12px", color: "#e8eaf0", fontSize: 14, outline: "none" }}
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ background: "#0b0e14", border: "1px solid #232838", borderRadius: 8, padding: "10px 12px", color: "#e8eaf0", fontSize: 14, outline: "none" }}
            />

            {error && <div style={{ color: "#ff4d4d", fontSize: 13 }}>{error}</div>}
            {info && <div style={{ color: "#4ade9c", fontSize: 13 }}>{info}</div>}

            <button
              type="submit"
              disabled={loading}
              style={{ background: "#ff4d4d", border: "none", borderRadius: 8, padding: "11px 0", color: "#fff", fontWeight: 600, fontSize: 14, cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1, marginTop: 4 }}
            >
              {loading ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: "#838aa0" }}>
            {mode === "login" ? (
              <>Don't have an account?{" "}
                <button onClick={() => { setMode("signup"); setError(null); setInfo(null); }} style={{ background: "none", border: "none", color: "#ff4d4d", cursor: "pointer", fontSize: 13, padding: 0 }}>Sign up</button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => { setMode("login"); setError(null); setInfo(null); }} style={{ background: "none", border: "none", color: "#ff4d4d", cursor: "pointer", fontSize: 13, padding: 0 }}>Log in</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
