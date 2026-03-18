import NarrativeHealth from "./NarrativeHealth";
import NarrativeImpact from "./NarrativeImpact";
import MarketSignals from "./MarketSignals";
import AlignmentScore from "./AlignmentScore";
import NarrativeVersionTimeline from "./NarrativeVersionTimeline";
import AIInsights from "./AIInsights";
import ChangeApprovalPanel from "./ChangeApprovalPanel";
import VersionComparison from "./VersionComparison";
import ConfidenceScoreCard from "./ConfidenceScoreCard";

export default function FeedbackIntelligence({
  narrativePeriod,
  narrativeHealth,
  performance,
  feedbackSignals,
  alignment,
  versions,
  aiContext,
  confidence,
  confidenceScore,
  reviewItems,
  approvedChanges,
  compareVersion,
  onChangeCompare,
  onOpenSection,
  onApproveChange,
  onDismissChange,
  onPublishVersion,
}) {
  return (
    <div style={{ display: "grid", gap: 22 }}>
      <NarrativeHealth metrics={narrativeHealth} />
      <NarrativeImpact narrativePeriod={narrativePeriod} performance={performance} />
      <ConfidenceScoreCard factors={confidence.factors} score={confidenceScore} decisionNotes={confidence.decisionNotes} />
      <ChangeApprovalPanel reviewItems={reviewItems} approvedChanges={approvedChanges} onOpenSection={onOpenSection} onApprove={onApproveChange} onDismiss={onDismissChange} />
      <VersionComparison currentVersion={versions[0]} compareVersion={compareVersion} versions={versions} onChangeCompare={onChangeCompare} />
      <MarketSignals signals={feedbackSignals} />
      <AlignmentScore alignment={alignment} />
      <NarrativeVersionTimeline versions={versions} />
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={onPublishVersion} style={{ border: "none", background: "#534AB7", color: "white", borderRadius: 14, padding: "12px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          Publish Narrative Version
        </button>
      </div>
      <AIInsights context={aiContext} />
    </div>
  );
}
