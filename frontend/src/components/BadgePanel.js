import React, { useState } from "react";
import api from "../api";

export default function BadgePanel({ policyId }) {
  const [copied, setCopied] = useState(false);
  const backendBase = api.defaults.baseURL || window.location.origin;
  const badgeUrl = `${backendBase}/api/badge/${policyId}`;
  const embedCode = `<img src="${badgeUrl}" alt="DPDP compliance badge" />`;

  const copy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="page-narrow">
      <div className="page-head"><h2>🛡️ DPDP verified badge</h2></div>
      <p className="dp-intro">This badge always shows the latest scan result for this policy — embed it and it updates automatically as new scans come in.</p>
      <div className="badge-preview"><img src={badgeUrl} alt="DPDP compliance badge preview" /></div>
      <div className="embed-code">{embedCode}</div>
      <button className="copy-btn" onClick={copy}>{copied ? "Copied!" : "Copy embed code"}</button>
    </div>
  );
}