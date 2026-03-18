import FeedbackIntelligence from "./FeedbackIntelligence";

export default function FeedbackDashboard({
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
  return <FeedbackIntelligence narrativePeriod={narrativePeriod} narrativeHealth={narrativeHealth} performance={performance} feedbackSignals={feedbackSignals} alignment={alignment} versions={versions} aiContext={aiContext} confidence={confidence} confidenceScore={confidenceScore} reviewItems={reviewItems} approvedChanges={approvedChanges} compareVersion={compareVersion} onChangeCompare={onChangeCompare} onOpenSection={onOpenSection} onApproveChange={onApproveChange} onDismissChange={onDismissChange} onPublishVersion={onPublishVersion} />;
}
