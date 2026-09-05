import React from "react";

export default function RequiresScan({ title, onGoScan }) {
  return (
    <div className="requires-scan">
      <div className="icon">🔍</div>
      <h3>Scan a policy first</h3>
      <p>{title} needs a scan to work with. Run a scan and you'll be able to come back here.</p>
      <button onClick={onGoScan}>Go to new scan →</button>
    </div>
  );
}