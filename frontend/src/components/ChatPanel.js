import React, { useState } from "react";
import api from "../api";

export default function ChatPanel({ scanId }) {
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
    <div className="chat-page">
      <div className="page-head"><h2>💬 Chat with the policy</h2></div>

      <div className="chat-msgs">
        {messages.length === 0 && (
          <div className="chat-empty">Ask anything about this policy — e.g. "can they sell my data?" or "how long do they keep my info?"</div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.role}`}>{m.text}</div>
        ))}
        {loading && <div className="chat-thinking">thinking…</div>}
      </div>

      <form onSubmit={ask} className="chat-input-row">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about this policy…"
        />
        <button type="submit" disabled={loading}>Ask</button>
      </form>
    </div>
  );
}