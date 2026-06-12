export function getAssetSectionKeyForTeam(team = "") {
  const normalized = String(team || "").toLowerCase().replace(/[^a-z]+/g, "");
  if (normalized === "productmarketing") return "productMarketing";
  if (normalized === "sales") return "sales";
  if (normalized === "marketing") return "marketing";
  if (normalized === "social") return "social";
  return "general";
}

export function buildGeneratedAssetRow(suggestion, generatedContent, initialScores, calculateAssetScore) {
  return {
    id: suggestion.id,
    assetName: suggestion.assetName,
    type: suggestion.assetType || suggestion.type,
    category: suggestion.category,
    kit: suggestion.kit,
    content: generatedContent,
    scores: initialScores,
    score: calculateAssetScore(initialScores),
    status: "In Review",
    feedbackSummary: `AI generated this asset from ${suggestion.sourceSection}. It is saved under ${suggestion.category} and ready for internal review.`,
    topIssues: [
      initialScores.differentiation <= initialScores.clarity && initialScores.differentiation <= initialScores.relevance
        ? "Differentiate the asset more clearly before approval."
        : "Review the asset for team-specific accuracy and proof.",
    ],
    suggestedImprovements: [
      "Tailor the draft to the exact audience and use case.",
      suggestion.category === "Sales" ? "Add stronger proof points and objection handling." : "Sharpen the launch hook and CTA.",
    ],
    sourceSection: suggestion.sourceSection,
    generatedBy: "AI Suggestion",
    createdAt: new Date().toISOString(),
  };
}

export function applyGeneratedAssetToSections(normalizedSections = {}, suggestion, generatedContent) {
  const sectionKey = getAssetSectionKeyForTeam(suggestion.team || suggestion.category);
  return {
    ...normalizedSections,
    [sectionKey]: normalizedSections?.[sectionKey] || `${suggestion.assetName}\n${generatedContent}`,
  };
}
