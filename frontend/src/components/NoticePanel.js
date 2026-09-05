import React, { useEffect, useState } from "react";
import api from "../api";

export default function NoticePanel({ scanId }) {
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.post("/api/notice", { scan_id: scanId })
      .then((res) => setNotice(res.data.notice))
      .catch((err) => setError(err.response?.data?.error || "Couldn't generate the notice."))
      .finally(() => setLoading(false));
  }, [scanId]);

  return (
    <div className="page-narrow">
      <div className="page-head"><h2>📜 Mock regulator notice</h2></div>
      {loading && <div className="empty-note">Drafting…</div>}
      {error && <div className="empty-note" style={{ color: "#f0847a" }}>{error}</div>}
      {notice && <pre className="notice-pre">{notice}</pre>}
    </div>
  );
}