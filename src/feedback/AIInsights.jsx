import { useState } from "react";
import { generateNarrativeInsights } from "../openaiClient";

const C = {
  card: "#FFFFFF",
  border: "#D6D3F7",
  text: "#26215C",
  muted: "#6B63B5",
  accent: "#534AB7",
};

function fallbackInsights(context) {
  const topSignal = context.feedbackSignals?.[0]?.text || "Narrative clarity needs stronger validation.";
  const summary = `The current narrative is landing best when the value proposition is specific, but there is still friction around clarity and proof. The strongest signal right now is: ${topSignal}`;
  const alignmentSummary = "Product, sales, and market-facing signals are directionally aligned, but the project still needs sharper proof, cleaner differentiation, and tighter message consistency across assets.";
  const narrativeRisks = [
    "Core message may still feel too broad across segments.",
    "Proof points are not yet strong enough to remove buyer hesitation.",
    "Competitive framing may not be sharp enough in sales conversations.",
  ];
  const suggestedImprovements = [
    "Tighten the primary narrative into one clear promise.",
    "Add stronger proof and customer-backed evidence to key claims.",
    "Reduce ambiguity in segment-specific messaging.",
  ];
  const positioningImprovements = [
    "Make the target customer more explicit in the positioning statement.",
    "State the core benefit before describing product capabilities.",
    "Clarify why LOOP is different from alternatives in simpler language.",
  ];

  return { summary, alignmentSummary, narrativeRisks, suggestedImprovements, positioningImprovements };
}

export default function AIInsights({ context }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function generateInsights() {
    if (loading) return;
    setLoading(true);
    try {
      const data = await generateNarrativeInsights({
        productTruth: context.productTruth,
        capabilities: context.capabilities,
        narrative: context.narrative,
        feedbackSignals: context.feedbackSignals,
        performanceMetrics: context.performance,
      });
      setResult(data);
    } catch {
      setResult(fallbackInsights(context));
    } finally {
      setLoading(false);
    }
  }

  const insights = result || fallbackInsights(context);

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 24, padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>AI Narrative Insights</div>
          <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.65, color: C.muted }}>AI analysis across product truth, competition, narrative, assets, and feedback signals.</div>
        </div>
        <button
          onClick={generateInsights}
          style={{
            border: "none",
            background: C.accent,
            color: "white",
            borderRadius: 14,
            padding: "12px 16px",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {loading ? "Generating..." : "Generate Narrative Health Report"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
        <div style={{ padding: "18px 18px", borderRadius: 18, background: "#F7F4FF", border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Narrative Health</div>
          <div style={{ fontSize: 14, lineHeight: 1.7, color: C.text }}>{insights.summary}</div>
        </div>
        <div style={{ padding: "18px 18px", borderRadius: 18, background: "#F4FAFF", border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#1F6FEB", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Alignment Report</div>
          <div style={{ fontSize: 14, lineHeight: 1.7, color: C.text }}>{insights.alignmentSummary}</div>
        </div>
        <div style={{ padding: "18px 18px", borderRadius: 18, background: "#FFF8F8", border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#D14363", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Narrative Risks</div>
          {insights.narrativeRisks.map(risk => <div key={risk} style={{ fontSize: 14, lineHeight: 1.65, color: C.text, marginBottom: 6 }}>- {risk}</div>)}
        </div>
        <div style={{ padding: "18px 18px", borderRadius: 18, background: "#F7FCFF", border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#1F6FEB", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Suggested Improvements</div>
          {insights.suggestedImprovements.map(item => <div key={item} style={{ fontSize: 14, lineHeight: 1.65, color: C.text, marginBottom: 6 }}>- {item}</div>)}
        </div>
        <div style={{ padding: "18px 18px", borderRadius: 18, background: "#FFFBEF", border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#B7791F", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Positioning Improvements</div>
          {insights.positioningImprovements.map(item => <div key={item} style={{ fontSize: 14, lineHeight: 1.65, color: C.text, marginBottom: 6 }}>- {item}</div>)}
        </div>
      </div>
    </div>
  );
}
