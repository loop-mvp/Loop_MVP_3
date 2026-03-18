const C = {
  card: "#FFFFFF",
  border: "#D6D3F7",
  text: "#26215C",
  muted: "#6B63B5",
  accent: "#534AB7",
};

export default function NarrativeIntelligence({
  narrativeHealthScore,
  confidenceScore,
  currentVersion,
  previousVersion,
  reviewItems = [],
  feedbackSignals = [],
}) {
  const readiness = confidenceScore >= 8 ? "Ready to scale" : confidenceScore >= 6 ? "Close, needs refinement" : "Needs more work";
  const topRisks = reviewItems.slice(0, 3);
  const topShifts = feedbackSignals.slice(0, 3);

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 24, padding: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>Executive Summary</div>
        <div style={{ marginTop: 10, fontSize: 28, fontWeight: 800, lineHeight: 1.08, color: C.text }}>Narrative is {readiness.toLowerCase()}.</div>
        <div style={{ marginTop: 12, maxWidth: 860, fontSize: 15, lineHeight: 1.75, color: C.muted }}>
          Loop is currently tracking a narrative health score of {narrativeHealthScore.toFixed(1)}/10 and a confidence score of {confidenceScore.toFixed(1)}/10. The current version is {currentVersion?.version}, and the highest-risk areas still needing attention are concentrated in the review queue and proof clarity.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {[
          ["Narrative Health", `${narrativeHealthScore.toFixed(1)}/10`],
          ["Confidence", `${confidenceScore.toFixed(1)}/10`],
          ["Current Version", currentVersion?.version || "Draft"],
          ["Readiness", readiness],
        ].map(([label, value]) => (
          <div key={label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
            <div style={{ marginTop: 10, fontSize: 24, fontWeight: 800, color: C.text }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 18 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 24, padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>What Changed and Why It Matters</div>
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ padding: "14px 16px", borderRadius: 16, background: "#FCFBFF", border: `1px solid ${C.border}`, fontSize: 14, lineHeight: 1.7, color: C.text }}>
              Current narrative version: <strong>{currentVersion?.version || "Draft"}</strong>. Previous published benchmark: <strong>{previousVersion?.version || "None yet"}</strong>.
            </div>
            <div style={{ padding: "14px 16px", borderRadius: 16, background: "#FCFBFF", border: `1px solid ${C.border}`, fontSize: 14, lineHeight: 1.7, color: C.text }}>
              If current risks are resolved, the clearest upside is better messaging consistency, sharper positioning, and stronger launch readiness.
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 18 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 24, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Top Narrative Risks</div>
            {topRisks.length === 0 ? (
              <div style={{ fontSize: 14, color: C.muted }}>No active review risks right now.</div>
            ) : topRisks.map(item => (
              <div key={item.id} style={{ marginBottom: 10, fontSize: 14, lineHeight: 1.65, color: C.text }}>
                • {item.title}
              </div>
            ))}
          </div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 24, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Top Market Shifts</div>
            {topShifts.map(signal => (
              <div key={signal.text} style={{ marginBottom: 10, fontSize: 14, lineHeight: 1.65, color: C.text }}>
                • {signal.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
