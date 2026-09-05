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
    <div className="loader-wrap">
      <div className="spinner" />
      <div className="loader-step">{steps[step]}</div>
      <div className="loader-dots">
        {steps.map((_, i) => (
          <div key={i} className={`d${i <= step ? " on" : ""}`} />
        ))}
      </div>
    </div>
  );
}