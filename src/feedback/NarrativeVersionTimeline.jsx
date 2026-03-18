const C = {
  card: "#FFFFFF",
  border: "#D6D3F7",
  text: "#26215C",
  muted: "#6B63B5",
  soft: "#F7F4FF",
  accent: "#534AB7",
};

function avg(rows = []) {
  if (!rows.length) return 0;
  return rows.reduce((sum, row) => sum + Number(row.score || 0), 0) / rows.length;
}

export default function NarrativeVersionTimeline({ versions = [] }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 24, padding: 24 }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>Narrative Versioning</div>
        <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.65, color: C.muted }}>
          Track how narrative versions shift across performance, signals, and alignment over time.
        </div>
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {versions.map((version, index) => {
          const internal = avg(version.alignment?.internal);
          const external = avg(version.alignment?.external);
          return (
            <div key={version.id || version.version || index} style={{ display: "grid", gridTemplateColumns: "40px minmax(0, 1fr)", gap: 14, alignItems: "stretch" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 16, height: 16, borderRadius: 999, background: index === 0 ? C.accent : "#C7C2FF", marginTop: 8 }} />
                {index !== versions.length - 1 && <div style={{ width: 2, flex: 1, background: "#E6E2FF", marginTop: 8 }} />}
              </div>
              <div style={{ border: `1px solid ${C.border}`, borderRadius: 20, padding: 18, background: index === 0 ? "linear-gradient(135deg, #F7F4FF 0%, #FFF9FC 100%)" : "white" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{version.version}</div>
                    <div style={{ marginTop: 6, fontSize: 13, color: C.muted }}>{version.startDate} to {version.endDate}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ padding: "6px 10px", borderRadius: 999, background: C.soft, border: `1px solid ${C.border}`, fontSize: 12, fontWeight: 700, color: C.accent }}>
                      Health {version.healthScore?.toFixed ? version.healthScore.toFixed(1) : version.healthScore}/10
                    </span>
                    <span style={{ padding: "6px 10px", borderRadius: 999, background: "#EEF8FF", border: "1px solid #BFDBFE", fontSize: 12, fontWeight: 700, color: "#1D4ED8" }}>
                      Signals {version.signals?.length || 0}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
                  <div style={{ padding: "12px 14px", borderRadius: 14, background: "#FCFBFF", border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>Revenue</div>
                    <div style={{ marginTop: 8, fontSize: 18, fontWeight: 800, color: C.text }}>{version.performance?.revenue}</div>
                  </div>
                  <div style={{ padding: "12px 14px", borderRadius: 14, background: "#FCFBFF", border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>Wins</div>
                    <div style={{ marginTop: 8, fontSize: 18, fontWeight: 800, color: C.text }}>{version.performance?.wins}</div>
                  </div>
                  <div style={{ padding: "12px 14px", borderRadius: 14, background: "#FCFBFF", border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>Internal Alignment</div>
                    <div style={{ marginTop: 8, fontSize: 18, fontWeight: 800, color: C.text }}>{internal.toFixed(1)}/10</div>
                  </div>
                  <div style={{ padding: "12px 14px", borderRadius: 14, background: "#FCFBFF", border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>External Alignment</div>
                    <div style={{ marginTop: 8, fontSize: 18, fontWeight: 800, color: C.text }}>{external.toFixed(1)}/10</div>
                  </div>
                </div>

                {!!version.signals?.length && (
                  <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {version.signals.slice(0, 3).map(signal => (
                      <span key={`${version.version}-${signal.text}`} style={{ padding: "7px 10px", borderRadius: 999, background: "#F6F3FF", border: `1px solid ${C.border}`, fontSize: 12, color: C.muted }}>
                        {signal.text}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
