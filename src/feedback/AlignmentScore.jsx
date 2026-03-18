const C = {
  card: "#FFFFFF",
  border: "#D6D3F7",
  text: "#26215C",
  muted: "#6B63B5",
  accent: "#534AB7",
};

function scoreColor(score) {
  if (score >= 8) return "#16A34A";
  if (score >= 6) return "#F59E0B";
  return "#FB7185";
}

function heatColor(score) {
  if (score >= 8) return "rgba(22, 163, 74, 0.18)";
  if (score >= 6) return "rgba(245, 158, 11, 0.18)";
  return "rgba(251, 113, 133, 0.18)";
}

export default function AlignmentScore({ alignment }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 24, padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>Alignment Score</div>
        <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.65, color: C.muted }}>Heatmap view of internal and external alignment across teams and audiences.</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
        {[
          ["Internal Alignment", alignment.internal],
          ["External Alignment", alignment.external],
        ].map(([title, rows]) => (
          <div key={title} style={{ border: `1px solid ${C.border}`, borderRadius: 20, overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", background: "#F7F4FF", borderBottom: `1px solid ${C.border}`, fontSize: 14, fontWeight: 700, color: C.text }}>{title}</div>
            <div style={{ display: "grid" }}>
              {rows.map(row => (
                <div key={row.label} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 78px", padding: "14px 16px", borderBottom: `1px solid ${C.border}`, background: heatColor(row.score) }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{row.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: scoreColor(row.score), textAlign: "right" }}>{row.score}/10</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
