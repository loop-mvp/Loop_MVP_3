const C = {
  card: "#FFFFFF",
  border: "#D6D3F7",
  text: "#26215C",
  muted: "#6B63B5",
  accent: "#534AB7",
};

function metricDelta(current, previous) {
  const currentNum = Number.parseFloat(String(current).replace(/[^0-9.-]/g, ""));
  const previousNum = Number.parseFloat(String(previous).replace(/[^0-9.-]/g, ""));
  if (Number.isNaN(currentNum) || Number.isNaN(previousNum)) return "Updated";
  const delta = currentNum - previousNum;
  return `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}`;
}

export default function VersionComparison({ currentVersion, compareVersion, versions = [], onChangeCompare }) {
  if (!currentVersion) return null;
  const compareOptions = versions.slice(1);

  const metrics = [
    ["Revenue", currentVersion.performance?.revenue, compareVersion?.performance?.revenue],
    ["Wins", currentVersion.performance?.wins, compareVersion?.performance?.wins],
    ["Health", currentVersion.healthScore, compareVersion?.healthScore],
    ["Signals", currentVersion.signals?.length || 0, compareVersion?.signals?.length || 0],
  ];

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 24, padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>Version Comparison</div>
          <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.65, color: C.muted }}>Compare the current narrative against the last published version to show before vs after movement.</div>
        </div>
        <select value={compareVersion?.id || ""} onChange={e => onChangeCompare(e.target.value)} style={{ border: `1px solid ${C.border}`, background: "#FCFBFF", color: C.text, borderRadius: 12, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", minWidth: 220 }}>
          <option value="">Select a published version</option>
          {compareOptions.map(version => (
            <option key={version.id} value={version.id}>{version.version}</option>
          ))}
        </select>
      </div>

      {!compareVersion ? (
        <div style={{ padding: "16px 18px", borderRadius: 18, background: "#FCFBFF", border: `1px solid ${C.border}`, fontSize: 14, color: C.muted }}>
          Publish the current narrative once to unlock before vs after comparison.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 }}>
          {metrics.map(([label, current, previous]) => (
            <div key={label} style={{ padding: "16px 18px", borderRadius: 18, background: "#FCFBFF", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
              <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
                <div style={{ fontSize: 13, color: C.muted }}>Current: <span style={{ color: C.text, fontWeight: 700 }}>{current}</span></div>
                <div style={{ fontSize: 13, color: C.muted }}>Previous: <span style={{ color: C.text, fontWeight: 700 }}>{previous}</span></div>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.accent }}>Delta: {metricDelta(current, previous)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
