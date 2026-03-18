const C = {
  card: "#FFFFFF",
  border: "#D6D3F7",
  text: "#26215C",
  muted: "#6B63B5",
  soft: "#F7F4FF",
  accent: "#534AB7",
};

function polarPoint(value, index, total, radius, center) {
  const angle = ((Math.PI * 2) / total) * index - Math.PI / 2;
  const scaledRadius = (value / 10) * radius;
  return {
    x: center + Math.cos(angle) * scaledRadius,
    y: center + Math.sin(angle) * scaledRadius,
  };
}

export default function NarrativeHealth({ metrics }) {
  const entries = [
    ["Positioning clarity", metrics.positioningClarity],
    ["Messaging alignment", metrics.messagingAlignment],
    ["Market adoption", metrics.marketAdoption],
    ["Story resonance", metrics.storyResonance],
  ];
  const score = entries.reduce((sum, [, value]) => sum + value, 0) / entries.length;
  const points = entries.map(([, value], index) => polarPoint(value, index, entries.length, 76, 96));
  const polygon = points.map(point => `${point.x},${point.y}`).join(" ");
  const ringPoints = [2.5, 5, 7.5, 10];

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 24, padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "flex-start", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>Narrative Health</div>
          <div style={{ marginTop: 8, fontSize: 36, fontWeight: 800, color: C.text, lineHeight: 1 }}>{score.toFixed(1)} / 10</div>
          <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.6, color: C.muted }}>Combined clarity score across positioning, messaging, adoption, and resonance.</div>
        </div>
        <div style={{ padding: "10px 12px", borderRadius: 16, background: C.soft, border: `1px solid ${C.border}`, fontSize: 13, color: C.muted }}>
          Auto-recalculated from narrative and feedback inputs
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px minmax(0, 1fr)", gap: 22, alignItems: "center" }}>
        <div style={{ display: "grid", placeItems: "center" }}>
          <svg width="192" height="192" viewBox="0 0 192 192">
            {ringPoints.map(ring => (
              <polygon
                key={ring}
                points={entries.map((_, index) => {
                  const point = polarPoint(ring, index, entries.length, 76, 96);
                  return `${point.x},${point.y}`;
                }).join(" ")}
                fill="none"
                stroke="#E9E6FF"
                strokeWidth="1"
              />
            ))}
            {entries.map((_, index) => {
              const outer = polarPoint(10, index, entries.length, 76, 96);
              return <line key={`axis-${index}`} x1="96" y1="96" x2={outer.x} y2={outer.y} stroke="#E9E6FF" strokeWidth="1" />;
            })}
            <polygon points={polygon} fill="rgba(83, 74, 183, 0.18)" stroke={C.accent} strokeWidth="2.5" />
            {points.map((point, index) => (
              <circle key={`point-${index}`} cx={point.x} cy={point.y} r="4.5" fill={C.accent} />
            ))}
          </svg>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {entries.map(([label, value]) => (
            <div key={label} style={{ display: "grid", gridTemplateColumns: "180px minmax(0, 1fr) 56px", gap: 12, alignItems: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{label}</div>
              <div style={{ height: 10, borderRadius: 999, background: "#ECE9FF", overflow: "hidden" }}>
                <div style={{ width: `${value * 10}%`, height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #7F77DD 0%, #534AB7 100%)" }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.accent, textAlign: "right" }}>{value}/10</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
