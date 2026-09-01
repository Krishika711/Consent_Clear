import React, { useState } from "react";
import api from "../api";

export default function ChatPanel({ scanId, onBack }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const ask = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    const q = question.trim();
    setMessages((m) => [...m, { role: "user", text: q }]);
    setQuestion("");
    setLoading(true);
    try {
      const res = await api.post("/api/chat", { scan_id: scanId, question: q });
      setMessages((m) => [...m, { role: "assistant", text: res.data.answer }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", text: "Sorry, something went wrong answering that." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0b0e14", color: "#e8eaf0", fontFamily: "'Space Grotesk', sans-serif", display: "flex", flexDirection: "column" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 24px", borderBottom: "1px solid #232838" }}>
        <button onClick={onBack} style={{ background: "none", border: "1px solid #232838", borderRadius: 6, color: "#838aa0", fontSize: 13, padding: "6px 12px", cursor: "pointer" }}>
          ← Dashboard
        </button>
        <span style={{ fontWeight: 600 }}>Chat with the policy</span>
      </header>

      <div style={{ flex: 1, maxWidth: 700, margin: "0 auto", width: "100%", padding: "24px", display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
        {messages.length === 0 && (
          <div style={{ color: "#838aa0", fontSize: 14, textAlign: "center", marginTop: 60 }}>
            Ask anything about this policy — e.g. "can they sell my data?" or "how long do they keep my info?"
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "80%", background: m.role === "user" ? "#1a1e29" : "#12151d", border: "1px solid #232838", borderRadius: 10, padding: "10px 14px", fontSize: 14, lineHeight: 1.5 }}>
            {m.text}
          </div>
        ))}
        {loading && <div style={{ color: "#838aa0", fontSize: 13 }}>thinking…</div>}
      </div>

      <form onSubmit={ask} style={{ display: "flex", gap: 10, maxWidth: 700, margin: "0 auto", width: "100%", padding: "16px 24px 28px" }}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about this policy…"
          style={{ flex: 1, background: "#12151d", border: "1px solid #232838", borderRadius: 8, padding: "12px 14px", color: "#e8eaf0", fontSize: 14, outline: "none" }}
        />
        <button type="submit" disabled={loading} style={{ background: "#ff4d4d", border: "none", borderRadius: 8, padding: "0 20px", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
          Ask
        </button>
      </form>
    </div>
  );
}
