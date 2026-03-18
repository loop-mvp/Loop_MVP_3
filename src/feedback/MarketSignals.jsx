const C = {
  card: "#FFFFFF",
  border: "#D6D3F7",
  text: "#26215C",
  muted: "#6B63B5",
  accent: "#534AB7",
};

export default function MarketSignals({ signals }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 24, padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>Market Signals</div>
        <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.65, color: C.muted }}>Top feedback signals extracted from sales notes, customer feedback, and campaign analytics.</div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {signals.slice(0, 5).map((signal, index) => (
          <div key={`${signal.text}-${index}`} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 120px 84px", gap: 12, alignItems: "center", padding: "16px 18px", borderRadius: 18, background: index % 2 ? "#FCFBFF" : "#F7F4FF", border: `1px solid ${C.border}` }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{signal.text}</div>
              <div style={{ marginTop: 4, fontSize: 13, color: C.muted }}>{signal.category}</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, textAlign: "center" }}>{signal.frequency}% frequency</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textAlign: "right" }}>Top {index + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
