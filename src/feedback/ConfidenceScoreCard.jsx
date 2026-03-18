const C = {
  card: "#FFFFFF",
  border: "#D6D3F7",
  text: "#26215C",
  muted: "#6B63B5",
  accent: "#534AB7",
  soft: "#F7F4FF",
};

export default function ConfidenceScoreCard({ factors = [], score = 0, decisionNotes = "" }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 24, padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "flex-start", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>Confidence Score</div>
          <div style={{ marginTop: 8, fontSize: 36, fontWeight: 800, color: C.text, lineHeight: 1 }}>{score.toFixed(1)} / 10</div>
          <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.65, color: C.muted }}>Weighted confidence across message clarity, proof, market understanding, and launch readiness.</div>
        </div>
        <div style={{ padding: "10px 12px", borderRadius: 16, background: C.soft, border: `1px solid ${C.border}`, fontSize: 13, color: C.muted }}>
          Demo-ready confidence snapshot
        </div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {factors.map(factor => {
          const normalized = Math.max(0, Math.min(10, (Number(factor.score) || 0) * 2));
          return (
            <div key={factor.id} style={{ display: "grid", gridTemplateColumns: "180px minmax(0, 1fr) 56px", gap: 12, alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{factor.title}</div>
                <div style={{ marginTop: 4, fontSize: 12, lineHeight: 1.5, color: C.muted }}>{factor.note}</div>
              </div>
              <div style={{ height: 10, borderRadius: 999, background: "#ECE9FF", overflow: "hidden" }}>
                <div style={{ width: `${normalized * 10}%`, height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #7F77DD 0%, #534AB7 100%)" }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.accent, textAlign: "right" }}>{normalized}/10</div>
            </div>
          );
        })}
      </div>

      {decisionNotes && (
        <div style={{ marginTop: 18, padding: "14px 16px", borderRadius: 16, background: "#FCFBFF", border: `1px solid ${C.border}`, fontSize: 13, lineHeight: 1.7, color: C.text }}>
          {decisionNotes}
        </div>
      )}
    </div>
  );
}
