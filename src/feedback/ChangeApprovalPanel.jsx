const C = {
  card: "#FFFFFF",
  border: "#D6D3F7",
  text: "#26215C",
  muted: "#6B63B5",
  accent: "#534AB7",
};

export default function ChangeApprovalPanel({
  reviewItems = [],
  approvedChanges = {},
  onOpenSection,
  onApprove,
  onDismiss,
}) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 24, padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>Approval Workflow</div>
          <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.65, color: C.muted }}>Review suggested narrative changes, approve updates, and push them into the right workspace sections.</div>
        </div>
        <div style={{ padding: "10px 12px", borderRadius: 16, background: "#F7F4FF", border: `1px solid ${C.border}`, fontSize: 13, color: C.muted }}>
          {reviewItems.length} pending
        </div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {reviewItems.length === 0 && (
          <div style={{ padding: "16px 18px", borderRadius: 18, background: "#FCFBFF", border: `1px solid ${C.border}`, fontSize: 14, color: C.muted }}>
            No pending updates right now. The current narrative looks aligned.
          </div>
        )}
        {reviewItems.map(item => (
          <div key={item.id} style={{ padding: "16px 18px", borderRadius: 18, background: approvedChanges[item.id] ? "#F2FFF6" : "#FCFBFF", border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{item.title}</div>
                <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.65, color: C.muted }}>{item.body}</div>
                <div style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: C.accent }}>Impacted section: {item.targetLabel}</div>
              </div>
              <span style={{ padding: "6px 10px", borderRadius: 999, background: item.severity === "review" ? "#FFF7E8" : "#EEF8FF", color: item.severity === "review" ? "#D97706" : "#1D4ED8", fontSize: 11, fontWeight: 800 }}>
                {approvedChanges[item.id] ? "Approved" : item.severity === "review" ? "Review needed" : "Suggested"}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
              <button onClick={() => onOpenSection(item.target)} style={{ border: `1px solid ${C.border}`, background: "white", color: C.text, borderRadius: 10, padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Open section
              </button>
              <button onClick={() => onApprove(item)} style={{ border: "none", background: C.accent, color: "white", borderRadius: 10, padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Approve change
              </button>
              <button onClick={() => onDismiss(item.id)} style={{ border: `1px solid ${C.border}`, background: "#FCFBFF", color: C.muted, borderRadius: 10, padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
