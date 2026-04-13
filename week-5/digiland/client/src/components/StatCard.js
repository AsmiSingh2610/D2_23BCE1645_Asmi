// ── StatCard Component ────────────────────────────────────────
// Reusable summary stat tile for the dashboard
import React from "react";

const StatCard = ({ label, value, icon, accent = "var(--accent)" }) => (
  <div className="card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
    <div style={{
      width: 44, height: 44, borderRadius: 8,
      background: `${accent}1a`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 20, flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{value}</div>
      <div className="text-muted text-sm" style={{ marginTop: 4 }}>{label}</div>
    </div>
  </div>
);

export default StatCard;
