const C = {
  card: "#FFFFFF",
  border: "#D6D3F7",
  text: "#26215C",
  muted: "#6B63B5",
  soft: "#F7F4FF",
  accent: "#534AB7",
};

export default function PerformanceMetrics({ narrativePeriod, performance }) {
  const items = [
    ["Revenue Influenced", performance.revenue],
    ["Sales Wins", performance.wins],
    ["Campaign Engagement", performance.engagement],
    ["Asset Downloads", performance.downloads],
    ["Customer Signups", performance.signups],
  ];

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 24, padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 18, marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>Narrative Performance</div>
          <div style={{ marginTop: 8, fontSize: 16, fontWeight: 700, color: C.text }}>Narrative Impact</div>
        </div>
        <div style={{ padding: "10px 12px", borderRadius: 16, background: C.soft, border: `1px solid ${C.border}`, fontSize: 13, color: C.muted }}>
          {narrativePeriod.version} • {narrativePeriod.startDate} to {narrativePeriod.endDate}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14 }}>
        {items.map(([label, value], index) => (
          <div key={label} style={{ padding: "18px 18px", borderRadius: 18, border: `1px solid ${C.border}`, background: index % 2 === 0 ? "linear-gradient(135deg, #F7F4FF 0%, #FFF9FC 100%)" : "linear-gradient(135deg, #F1F7FF 0%, #FBFDFF 100%)" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
            <div style={{ marginTop: 10, fontSize: 30, fontWeight: 800, color: C.text, lineHeight: 1 }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
