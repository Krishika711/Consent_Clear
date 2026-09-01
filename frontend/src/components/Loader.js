import React, { useEffect, useState } from "react";

const steps = [
  "extracting policy text...",
  "identifying data collection clauses...",
  "cross-referencing DPDP Act 2023...",
  "calculating fine exposure...",
  "generating verdict...",
];

export default function Loader() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s < steps.length - 1 ? s + 1 : s));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ display: "inline-block", width: 36, height: 36, border: "2px solid #1a1a1a", borderTop: "2px solid #ef4444", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: 20 }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ color: "#555", fontSize: 14 }}>{steps[step]}</div>
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 16 }}>
        {steps.map((_, i) => (
          <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i <= step ? "#ef4444" : "#1a1a1a", transition: "background 0.3s" }} />
        ))}
      </div>
    </div>
  );
}
