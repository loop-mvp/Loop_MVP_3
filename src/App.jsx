import { createContext, useContext, useEffect, useRef, useState } from "react";
import FeedbackDashboard from "./feedback/FeedbackDashboard";
import NarrativeHealth from "./feedback/NarrativeHealth";
import MarketSignals from "./feedback/MarketSignals";
import FeedbackIntelligence from "./feedback/FeedbackIntelligence";
import NarrativeImpact from "./feedback/NarrativeImpact";
import AlignmentScore from "./feedback/AlignmentScore";
import ConfidenceScoreCard from "./feedback/ConfidenceScoreCard";
import NarrativeIntelligence from "./feedback/NarrativeIntelligence";
import AIInsights from "./feedback/AIInsights";
import { generateOpenAiText } from "./openaiClient";
import { deleteLoopProject as deleteRemoteLoopProject, isSupabaseConfigured, listLoopProjects, saveLoopProject } from "./projectStore";

const LOOP_STORAGE_KEY = "loop-mvp-local-state-v1";

const P = {
  50: "#EEEDFE", 100: "#CECBF6", 200: "#AFA9EC",
  400: "#7F77DD", 600: "#534AB7", 800: "#3C3489", 900: "#26215C",
};
const S = {
  bg: "#F4F3FF", sidebar: "#EBE9FC", card: "#FFFFFF",
  border: "#D6D3F7", text: "#26215C", muted: "#6B63B5", light: "#AFA9EC",
};
const WorkspaceAssetActionContext = createContext({ onGenerateAssetSuggestion: null });

const DEFAULT_CAP_LAYOUT = {
  features: { x: 0, y: 0, w: 48, h: 250 },
  integrations: { x: 52, y: 0, w: 48, h: 250 },
  featureBenefits: { x: 0, y: 268, w: 58, h: 470 },
  summary: { x: 62, y: 286, w: 38, h: 120 },
};

const DEFAULT_PRODUCT_LAYOUT = {
  problem: { x: 0, y: 0, w: 100, h: 220 },
  problemStatement: { x: 0, y: 238, w: 48, h: 180 },
  solution: { x: 52, y: 238, w: 48, h: 220 },
  audience: { x: 0, y: 436, w: 48, h: 220 },
  diff: { x: 52, y: 476, w: 48, h: 180 },
};

const DEFAULT_COMP_LAYOUT = {
  competitors: { x: 0, y: 0, w: 34, h: 180 },
  comparison: { x: 38, y: 0, w: 62, h: 330 },
  differentiators: { x: 0, y: 198, w: 48, h: 180 },
  proofPoints: { x: 52, y: 348, w: 48, h: 170 },
  battleCard: { x: 0, y: 396, w: 48, h: 150 },
};

const DEFAULT_PRODUCT_TRUTH_LAYOUT = {
  problem: { x: 0, y: 0, w: 100, h: 190 },
  problemStatement: { x: 0, y: 208, w: 38, h: 170 },
  solution: { x: 42, y: 208, w: 58, h: 220 },
  audience: { x: 0, y: 396, w: 38, h: 180 },
  diff: { x: 42, y: 446, w: 58, h: 180 },
  features: { x: 0, y: 594, w: 36, h: 170 },
  featureBenefits: { x: 40, y: 644, w: 60, h: 340 },
  competitors: { x: 0, y: 782, w: 36, h: 160 },
  comparison: { x: 0, y: 1002, w: 100, h: 300 },
  differentiators: { x: 0, y: 1320, w: 48, h: 180 },
  proofPoints: { x: 52, y: 1320, w: 48, h: 180 },
  integrations: { x: 0, y: 1518, w: 36, h: 160 },
  summary: { x: 40, y: 1518, w: 28, h: 120 },
  battleCard: { x: 72, y: 1518, w: 28, h: 180 },
};

const DEFAULT_POSITIONING_LAYOUT = {
  statement: { x: 0, y: 0, w: 62, h: 220 },
  valueProp: { x: 66, y: 0, w: 34, h: 190 },
  tagline: { x: 0, y: 238, w: 58, h: 250 },
  keyValue: { x: 62, y: 208, w: 38, h: 170 },
};

const DEFAULT_MESSAGING_LAYOUT = {
  headline: { x: 0, y: 0, w: 44, h: 170 },
  pillars: { x: 48, y: 0, w: 52, h: 230 },
  elevator: { x: 0, y: 188, w: 44, h: 170 },
  framework: { x: 48, y: 248, w: 52, h: 190 },
};

const DEFAULT_AUDIENCE_LAYOUT = {
  primary: { x: 0, y: 0, w: 58, h: 240 },
 secondary: { x: 62, y: 0, w: 38, h: 170 },
  persona: { x: 0, y: 258, w: 100, h: 190 },
};

const DEFAULT_STRATEGY_LAYOUT = {
  goal: { x: 0, y: 0, w: 34, h: 160 },
  icp: { x: 38, y: 0, w: 30, h: 180 },
  channels: { x: 72, y: 0, w: 28, h: 180 },
  brief: { x: 0, y: 198, w: 100, h: 190 },
};

const DEFAULT_STORY_LAYOUT = {
  origin: { x: 0, y: 0, w: 38, h: 170 },
  customer: { x: 42, y: 0, w: 58, h: 220 },
  demo: { x: 0, y: 188, w: 38, h: 170 },
  arc: { x: 42, y: 238, w: 58, h: 210 },
};

const DEFAULT_PRODUCT_OVERVIEW_LAYOUT = {
  category: { x: 0, y: 0, w: 34, h: 170 },
  doesWhat: { x: 38, y: 0, w: 62, h: 220 },
  builtFor: { x: 0, y: 188, w: 42, h: 170 },
};

const DEFAULT_PROBLEM_STATEMENT_LAYOUT = {
  coreProblem: { x: 0, y: 0, w: 58, h: 230 },
  impact: { x: 62, y: 0, w: 38, h: 190 },
  currentGaps: { x: 0, y: 248, w: 100, h: 210 },
};

function makeSingleTileLayout(id, height = 220) {
  return {
    [id]: { x: 0, y: 0, w: 100, h: height },
  };
}

const DEFAULT_SOLUTION_SECTION_LAYOUT = {
  solutionSummary: { x: 0, y: 0, w: 58, h: 220 },
  howItWorks: { x: 62, y: 0, w: 38, h: 190 },
  whyNow: { x: 0, y: 238, w: 46, h: 160 },
};

const DEFAULT_AUDIENCE_TRUTH_LAYOUT = {
  primaryAudience: { x: 0, y: 0, w: 44, h: 170 },
  secondaryAudience: { x: 48, y: 0, w: 52, h: 160 },
  painGoals: { x: 0, y: 188, w: 100, h: 210 },
};

const DEFAULT_DIFFERENTIATION_LAYOUT = {
  whyWeWin: { x: 0, y: 0, w: 42, h: 170 },
  keyDiffs: { x: 46, y: 0, w: 54, h: 190 },
  altShortfalls: { x: 0, y: 188, w: 100, h: 210 },
};

const DEFAULT_FEATURES_LAYOUT = {
  topFeatures: { x: 0, y: 0, w: 56, h: 200 },
  featurePriorities: { x: 60, y: 0, w: 40, h: 180 },
};

const DEFAULT_CAPABILITIES_SECTION_LAYOUT = {
  featureBenefits: { x: 0, y: 0, w: 62, h: 320 },
  summary: { x: 66, y: 0, w: 34, h: 130 },
};

const DEFAULT_COMPETITORS_SECTION_LAYOUT = {
  competitors: { x: 0, y: 0, w: 54, h: 190 },
  winLose: { x: 58, y: 0, w: 42, h: 190 },
};

const DEFAULT_COMPETITION_COMPARISON_LAYOUT = {
  comparison: { x: 0, y: 0, w: 58, h: 220 },
  whyWeWin: { x: 62, y: 0, w: 38, h: 210 },
};

const DEFAULT_COMPETITION_SALES_LAYOUT = {
  battleCard: { x: 0, y: 0, w: 54, h: 220 },
  objections: { x: 58, y: 0, w: 42, h: 220 },
};

const DEFAULT_ASSETS_LAYOUT = {
  notes: { x: 0, y: 0, w: 42, h: 170 },
  linkedin: { x: 46, y: 0, w: 54, h: 170 },
  email: { x: 0, y: 188, w: 48, h: 170 },
  press: { x: 52, y: 188, w: 48, h: 170 },
};

const CAP_TILE_LIMITS = {
  features: { minW: 28, minH: 180 },
  integrations: { minW: 28, minH: 180 },
  featureBenefits: { minW: 36, minH: 320 },
  summary: { minW: 28, minH: 96 },
};

const PRODUCT_TRUTH_TILE_LIMITS = {
  ...CAP_TILE_LIMITS,
  problem: { minW: 60, minH: 160 },
  solution: { minW: 42, minH: 180 },
  comparison: { minW: 60, minH: 240 },
  battleCard: { minW: 28, minH: 140 },
};

const DEFAULT_TILE_LIMITS = {
  minW: 28,
  minH: 120,
};

function boundedNarrativeScore(text, base = 3) {
  const length = text?.trim().length || 0;
  return Math.max(1, Math.min(10, base + Math.round(length / 60)));
}

function average(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function countFilledTextFields(values) {
  return (values || []).reduce((count, value) => count + (String(value || "").trim() ? 1 : 0), 0);
}

function addDays(dateString, days) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function nextVersionLabel(version) {
  const match = String(version || "v1.0").match(/(\d+)(?:\.(\d+))?/);
  if (!match) return "v2.0";
  const major = Number(match[1] || 1);
  const minor = Number(match[2] || 0);
  return `v${major}.${minor + 1}`;
}

const REVIEW_TEAMS = ["Sales", "Product", "PMM"];

function makeEmptyReviewRouting() {
  return {
    selectedTeam: "Sales",
    assignments: {
      Sales: [],
      Product: [],
      PMM: [],
    },
    lastAssignedAt: "",
    sentAt: "",
  };
}

function getReviewTeamForSection(section) {
  if (["problem", "solution"].includes(section.id)) return "Product";
  if (["positioning", "messaging", "elevator"].includes(section.id)) return "Sales";
  return "PMM";
}

function buildReviewableSections(source = {}) {
  const snapshot = hydrateDraftSnapshot(source);
  const sections = [
    { id: "problem", workspace: "Product Truth", label: "Problem", content: snapshot.pd?.problem || snapshot.pd?.problemStatement || "" },
    { id: "solution", workspace: "Product Truth", label: "Solution", content: snapshot.pd?.solution || "" },
    { id: "primaryAudience", workspace: "Product Truth", label: "Primary Audience", content: snapshot.pd?.audience || snapshot.strat?.icp || "" },
    { id: "differentiation", workspace: "Product Truth", label: "Differentiation", content: snapshot.pd?.diff || snapshot.comp?.differentiators || "" },
    { id: "positioning", workspace: "Core Narrative", label: "Positioning Statement", content: snapshot.pos?.statement || "" },
    { id: "valueProposition", workspace: "Core Narrative", label: "Value Proposition", content: snapshot.pos?.valueProp || "" },
    { id: "messaging", workspace: "Core Narrative", label: "Messaging", content: snapshot.msg?.pillars || "" },
    { id: "headline", workspace: "Core Narrative", label: "Headline Message", content: snapshot.msg?.headline || "" },
    { id: "elevator", workspace: "Core Narrative", label: "Elevator Pitch", content: snapshot.msg?.elevator || "" },
    { id: "gtmStrategy", workspace: "GTM", label: "GTM Strategy", content: snapshot.strat?.goal || "" },
    { id: "keyChannels", workspace: "GTM", label: "Key Channels", content: snapshot.strat?.channels || "" },
    { id: "launchStrategy", workspace: "GTM", label: "Launch Strategy", content: snapshot.strat?.hooks || "" },
  ];

  return sections.map(section => ({
    ...section,
    content: String(section.content || "").trim(),
    suggestedTeam: getReviewTeamForSection(section),
  }));
}

function normalizeResourceCategoryLabel(workspace = "") {
  if (workspace === "Product Truth") return "Product";
  if (workspace === "Core Narrative") return "Narrative";
  return workspace || "General";
}

function slugifyValue(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildWorkspaceAssetSuggestion(suggestion, sourceSection = "Workspace") {
  const title = String(suggestion?.title || "Generated Asset").replace(/^\+\s*/, "").trim();
  const lowerTitle = title.toLowerCase();
  const lowerSource = String(sourceSection || "").toLowerCase();

  let category = "Marketing";
  let type = "Messaging";
  let kit = "Marketing Kit";

  if (
    lowerTitle.includes("sales") ||
    lowerTitle.includes("battlecard") ||
    lowerTitle.includes("talk track") ||
    lowerTitle.includes("one-pager") ||
    lowerTitle.includes("one pager") ||
    lowerTitle.includes("deck") ||
    lowerTitle.includes("faq") ||
    lowerTitle.includes("persona brief")
  ) {
    category = "Sales";
    type = lowerTitle.includes("deck") ? "Sales" : "Enablement";
    kit = "Sales Kit";
  } else if (
    lowerTitle.includes("campaign") ||
    lowerTitle.includes("email") ||
    lowerTitle.includes("announcement") ||
    lowerTitle.includes("launch") ||
    lowerTitle.includes("homepage")
  ) {
    category = "Marketing";
    type = lowerTitle.includes("campaign") ? "Campaign" : "Messaging";
    kit = "Marketing Kit";
  } else if (lowerSource.includes("gtm")) {
    category = "Marketing";
    type = "Campaign";
    kit = "Marketing Kit";
  } else if (lowerSource.includes("product")) {
    category = "Sales";
    type = "Enablement";
    kit = "Sales Kit";
  }

  return {
    id: `workspace-${slugifyValue(sourceSection)}-${slugifyValue(title)}`,
    assetName: title,
    type,
    category,
    kit,
    sourceSection,
    description: suggestion?.description || `AI-generated asset created from ${sourceSection}.`,
    why: `Generated from the ${sourceSection} workspace so the asset stays tied to the active narrative context.`,
    priority: 1,
  };
}

function normalizeReviewRouting(reviewRouting = {}, reviewSections = []) {
  const validIds = new Set(reviewSections.map(section => section.id));
  const fallback = makeEmptyReviewRouting();
  const assignments = Object.fromEntries(
    REVIEW_TEAMS.map(team => [
      team,
      Array.from(new Set((reviewRouting.assignments?.[team] || []).filter(id => validIds.has(id)))),
    ])
  );

  return {
    selectedTeam: REVIEW_TEAMS.includes(reviewRouting.selectedTeam) ? reviewRouting.selectedTeam : fallback.selectedTeam,
    assignments,
    lastAssignedAt: reviewRouting.lastAssignedAt || "",
    sentAt: reviewRouting.sentAt || "",
  };
}

function clampReviewScore(value) {
  if (value === "" || value === null || typeof value === "undefined") return 0;
  const numericValue = Number.parseInt(value, 10);
  if (Number.isNaN(numericValue)) return 0;
  return Math.max(0, Math.min(10, numericValue));
}

function makeDefaultSectionReview(section, reviewerTeam = "Sales") {
  return {
    sectionId: section.id,
    workspace: section.workspace,
    sectionName: section.label,
    content: section.content || "",
    reviewerTeam,
    scores: {
      clarity: 0,
      relevance: 0,
      differentiation: 0,
      value: 0,
    },
    status: "in_review",
    decision: "",
    comment: "",
    updatedAt: "",
  };
}

function normalizeSectionReviews(sectionReviews = {}, reviewRouting = makeEmptyReviewRouting(), reviewSections = []) {
  const assignedTeamBySectionId = {};
  REVIEW_TEAMS.forEach(team => {
    (reviewRouting.assignments?.[team] || []).forEach(sectionId => {
      assignedTeamBySectionId[sectionId] = team;
    });
  });

  return reviewSections.reduce((acc, section) => {
    const reviewerTeam = assignedTeamBySectionId[section.id];
    if (!reviewerTeam) return acc;

    const existing = sectionReviews?.[section.id] || {};
    acc[section.id] = {
      ...makeDefaultSectionReview(section, reviewerTeam),
      ...existing,
      sectionId: section.id,
      workspace: section.workspace,
      sectionName: section.label,
      content: section.content || "",
      reviewerTeam,
      scores: {
        clarity: clampReviewScore(existing?.scores?.clarity),
        relevance: clampReviewScore(existing?.scores?.relevance),
        differentiation: clampReviewScore(existing?.scores?.differentiation),
        value: clampReviewScore(existing?.scores?.value),
      },
      status: existing?.status === "approved" ? "approved" : "in_review",
      decision: existing?.decision || "",
      comment: existing?.comment || "",
      updatedAt: existing?.updatedAt || "",
    };

    return acc;
  }, {});
}

function summarizeSectionReviewState(sectionReviews = {}, reviewRouting = makeEmptyReviewRouting()) {
  const assignedSectionIds = REVIEW_TEAMS.flatMap(team => reviewRouting.assignments?.[team] || []);
  const activeReviews = assignedSectionIds.map(sectionId => sectionReviews?.[sectionId]).filter(Boolean);
  const approvedCount = activeReviews.filter(review => review.status === "approved").length;
  const improveCount = activeReviews.filter(review => review.decision === "improve").length;

  if (!activeReviews.length) {
    return {
      totalCount: 0,
      approvedCount: 0,
      improveCount: 0,
      pendingCount: 0,
      status: "Requested",
    };
  }

  if (approvedCount === activeReviews.length) {
    return {
      totalCount: activeReviews.length,
      approvedCount,
      improveCount,
      pendingCount: 0,
      status: "Approved",
    };
  }

  const pendingCount = activeReviews.length - approvedCount;
  return {
      totalCount: activeReviews.length,
      approvedCount,
      improveCount,
      pendingCount,
      status: improveCount > 0 || pendingCount > 0 ? "In Review" : "Requested",
    };
}

function buildPmmActionQueue(sectionReviews = {}, reviewSections = []) {
  return Object.values(sectionReviews || {})
    .filter(review => review.decision === "improve")
    .map(review => {
      const section = reviewSections.find(item => item.id === review.sectionId);
      return {
        id: `action-${review.sectionId}`,
        sectionId: review.sectionId,
        sectionName: review.sectionName,
        workspace: review.workspace || section?.workspace || "",
        owner: "PMM",
        reason: review.comment || `${review.reviewerTeam} requested an update for this section.`,
        updatedAt: review.updatedAt || "",
      };
    });
}

function buildReviewAnalytics(sectionReviews = {}, assignedSections = []) {
  const reviews = assignedSections
    .map(section => sectionReviews?.[section.sectionId])
    .filter(Boolean);

  const averageScore = parameter => Number(average(reviews.map(review => clampReviewScore(review.scores?.[parameter]))).toFixed(1));

  return {
    totals: {
      routed: assignedSections.length,
      approved: reviews.filter(review => review.status === "approved").length,
      improve: reviews.filter(review => review.decision === "improve").length,
      pending: reviews.filter(review => review.status !== "approved").length,
    },
    scores: {
      clarity: averageScore("clarity"),
      relevance: averageScore("relevance"),
      differentiation: averageScore("differentiation"),
      value: averageScore("value"),
    },
    byTeam: REVIEW_TEAMS.map(team => ({
      team,
      count: assignedSections.filter(section => section.reviewerTeam === team).length,
    })),
  };
}

function calculateAssetScore(scores = {}) {
  const total = (
    Number(scores.clarity || 0) +
    Number(scores.relevance || 0) +
    Number(scores.differentiation || 0)
  ) / 3;
  return Math.max(0, Math.min(100, Math.round(total * 10)));
}

function inferAssetStatus(content = "", score = 0) {
  if (!String(content || "").trim()) return "Draft";
  if (score >= 75) return "Approved";
  if (score >= 60) return "In Review";
  return "Needs Work";
}

function buildAssetSuggestionCatalog(source = {}) {
  const {
    pd = {},
    msg = {},
    strat = {},
    aiDraft = {},
  } = source;
  const generatedAssets = aiDraft.assets || {};

  return [
    {
      id: "homepageCopy",
      assetName: "Homepage Copy",
      type: "Messaging",
      category: "Marketing",
      content: generatedAssets.headline || msg.headline || "",
      scores: { clarity: 6.8, relevance: 6.5, differentiation: 6.1 },
    },
    {
      id: "salesDeck",
      assetName: "Sales Deck",
      type: "Sales",
      category: "Sales",
      content: `${pd.name || "Loop"} for ${pd.audience || "go-to-market teams"}: ${msg.headline || generatedAssets.headline || pd.solution || ""}`.trim(),
      scores: { clarity: 7.2, relevance: 7.4, differentiation: 6.8 },
    },
    {
      id: "pitchScript",
      assetName: "Pitch Script",
      type: "Sales",
      category: "Sales",
      content: generatedAssets.elevatorPitch || msg.elevator || "",
      scores: { clarity: 7.1, relevance: 7.0, differentiation: 6.6 },
    },
    {
      id: "onePager",
      assetName: "One Pager",
      type: "Enablement",
      category: "Sales",
      content: `${pd.problem || ""}\n\n${pd.solution || ""}\n\n${pd.diff || ""}`.trim(),
      scores: { clarity: 6.7, relevance: 6.8, differentiation: 6.4 },
    },
    {
      id: "emailCampaign",
      assetName: "Email Campaign",
      type: "Campaign",
      category: "Marketing",
      content: generatedAssets.emailPitch || "",
      scores: { clarity: 6.0, relevance: 6.2, differentiation: 5.8 },
    },
    {
      id: "launchBrief",
      assetName: "Launch Brief",
      type: "Launch",
      category: "Marketing",
      content: `${strat.goal || ""}\n\n${strat.channels || ""}\n\n${strat.hooks || ""}`.trim(),
      scores: { clarity: 6.4, relevance: 6.7, differentiation: 6.0 },
    },
  ];
}

function normalizeAssetsState(assets = {}) {
  const existingRows = Array.isArray(assets.rows) ? assets.rows : [];
  const rows = existingRows.map(existing => {
    const scores = {
      clarity: Number(existing.scores?.clarity ?? 0),
      relevance: Number(existing.scores?.relevance ?? 0),
      differentiation: Number(existing.scores?.differentiation ?? 0),
    };
    const content = existing.content || "";
    const score = existing.score || calculateAssetScore(scores);
    const status = existing.status || inferAssetStatus(content, score);
    const primaryIssue =
      scores.differentiation <= scores.clarity && scores.differentiation <= scores.relevance
        ? "Differentiate the asset more clearly."
        : scores.clarity <= scores.relevance
          ? "Tighten the message so the asset is easier to scan."
          : "Make the asset more relevant to the intended audience.";

    return {
      ...existing,
      assetName: existing.assetName || "Generated Asset",
      type: existing.type || "Messaging",
      category: existing.category || "Marketing",
      kit: existing.kit || (existing.category === "Sales" ? "Sales Kit" : "Marketing Kit"),
      content,
      scores,
      score,
      status,
      feedbackSummary: existing.feedbackSummary || `${status} for ${String(existing.category || "marketing").toLowerCase()} use.`,
      topIssues: Array.isArray(existing.topIssues) && existing.topIssues.length ? existing.topIssues : [primaryIssue],
      suggestedImprovements: Array.isArray(existing.suggestedImprovements) && existing.suggestedImprovements.length
        ? existing.suggestedImprovements
        : [
            (existing.category || "Marketing") === "Sales" ? "Add clearer proof points for sellers." : "Sharpen the narrative hook for launch use.",
            primaryIssue,
          ],
    };
  });

  return {
    ...assets,
    notes: assets.notes || "",
    rows,
  };
}

async function generateSuggestedAssetContent(suggestion, source = {}) {
  const { pd = {}, msg = {}, strat = {}, aiDraft = {} } = source;
  const prompt = `You are creating a launch-ready ${suggestion.assetName} for Loop.
Return plain text only. No markdown fences.

Asset Type: ${suggestion.type}
Category: ${suggestion.category}
Source Section: ${suggestion.sourceSection}
Product: ${pd.name || "Unnamed product"}
Description: ${pd.description || ""}
Problem: ${pd.problem || ""}
Solution: ${pd.solution || ""}
Audience: ${pd.audience || ""}
Differentiation: ${pd.diff || ""}
Headline: ${msg.headline || aiDraft.assets?.headline || ""}
Messaging: ${msg.pillars || ""}
Elevator Pitch: ${msg.elevator || aiDraft.assets?.elevatorPitch || ""}
GTM Strategy: ${strat.goal || ""}
Channels: ${strat.channels || ""}
Launch Strategy: ${strat.hooks || ""}

Write a polished first draft for this asset. Keep it useful, concise, and specific to the product context.`;

  const fallback = `${suggestion.assetName}\n\n${pd.name || "This product"} helps ${pd.audience || "the target audience"} solve ${pd.problem || "a clear problem"} with ${pd.solution || "a stronger solution"}. Use this asset as a starter draft and refine it before approval.`;

  try {
    const text = await generateOpenAiText(prompt);
    return String(text || "").trim() || fallback;
  } catch {
    return fallback;
  }
}

async function generateAssetUpdateBrief(asset, source = {}) {
  const { pd = {}, msg = {}, strat = {} } = source;
  const fallback = {
    feedbackSummary: `${asset.assetName} needs another revision before approval.`,
    topIssues: ["Clarify the asset and tie it more closely to buyer value."],
    suggestedImprovements: [
      "Tighten the lead message and make the audience more explicit.",
      "Add clearer proof points or differentiation before approval.",
    ],
  };

  try {
    const prompt = `You are reviewing a launch asset inside Loop.
Return ONLY valid JSON with this exact shape:
{
  "feedbackSummary": "string",
  "topIssues": ["string"],
  "suggestedImprovements": ["string"]
}

Asset Name: ${asset.assetName}
Type: ${asset.type}
Category: ${asset.category}
Product: ${pd.name || ""}
Audience: ${pd.audience || ""}
Differentiation: ${pd.diff || ""}
Headline: ${msg.headline || ""}
Messaging: ${msg.pillars || ""}
GTM Strategy: ${strat.goal || ""}

Current Asset:
${asset.content || ""}

Current Scores:
Clarity: ${asset.scores?.clarity || 0}
Relevance: ${asset.scores?.relevance || 0}
Differentiation: ${asset.scores?.differentiation || 0}`;
    const text = await generateOpenAiText(prompt);
    const parsed = parseJsonResponse(text, fallback);
    return {
      feedbackSummary: parsed.feedbackSummary || fallback.feedbackSummary,
      topIssues: Array.isArray(parsed.topIssues) && parsed.topIssues.length ? parsed.topIssues : fallback.topIssues,
      suggestedImprovements: Array.isArray(parsed.suggestedImprovements) && parsed.suggestedImprovements.length ? parsed.suggestedImprovements : fallback.suggestedImprovements,
    };
  } catch {
    return fallback;
  }
}

function scoreGeneratedAsset(content = "", source = {}) {
  const { pd = {}, strat = {} } = source;
  const text = String(content || "").toLowerCase();
  const productName = String(pd.name || "").toLowerCase();
  const audience = String(pd.audience || "").toLowerCase();
  const differentiation = String(pd.diff || "").toLowerCase();
  const channels = String(strat.channels || "").toLowerCase();

  const clarity =
    Math.min(9, 5.5 + (text.length > 220 ? 1 : 0) + (text.includes(":") || text.includes("-") ? 0.6 : 0) + (text.split("\n").length > 2 ? 0.6 : 0));
  const relevance =
    Math.min(9, 5.8 + (productName && text.includes(productName) ? 0.8 : 0) + (audience && text.includes(audience) ? 0.8 : 0) + (channels && text.includes(channels.split(",")[0].trim()) ? 0.4 : 0));
  const differentiationScore =
    Math.min(9, 5.2 + (differentiation && text.includes(differentiation.split(" ")[0]) ? 1.2 : 0) + (text.includes("why") || text.includes("because") ? 0.4 : 0) + (text.includes("proof") || text.includes("evidence") ? 0.6 : 0));

  return {
    clarity: Number(clarity.toFixed(1)),
    relevance: Number(relevance.toFixed(1)),
    differentiation: Number(differentiationScore.toFixed(1)),
  };
}

function compareProjectVersions(leftVersion, rightVersion) {
  const leftMatch = String(leftVersion || "v1.0").match(/(\d+)(?:\.(\d+))?/);
  const rightMatch = String(rightVersion || "v1.0").match(/(\d+)(?:\.(\d+))?/);
  const leftMajor = Number(leftMatch?.[1] || 0);
  const leftMinor = Number(leftMatch?.[2] || 0);
  const rightMajor = Number(rightMatch?.[1] || 0);
  const rightMinor = Number(rightMatch?.[2] || 0);
  if (leftMajor !== rightMajor) return leftMajor - rightMajor;
  return leftMinor - rightMinor;
}

function mergeProjectsById(currentProjects, incomingProjects) {
  const projectMap = new Map(currentProjects.map(project => [project.id, project]));
  incomingProjects.forEach(project => {
    const existing = projectMap.get(project.id);
    if (!existing) {
      projectMap.set(project.id, project);
      return;
    }

    const existingSnapshot = existing.snapshot || {};
    const incomingSnapshot = project.snapshot || {};
    const existingScore = countProjectSnapshotContent(existingSnapshot);
    const incomingScore = countProjectSnapshotContent(incomingSnapshot);
    const snapshot = mergeSnapshotPreservingContent(existingSnapshot, incomingSnapshot);

    projectMap.set(project.id, {
      ...existing,
      ...project,
      name: (project.name || "").trim() ? project.name : existing.name,
      description: (project.description || "").trim() ? project.description : existing.description,
      status: incomingScore >= existingScore ? project.status : existing.status,
      snapshot,
    });
  });
  return Array.from(projectMap.values()).sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
}

function countProjectSnapshotContent(snapshot = {}) {
  return countFilledTextFields([
    snapshot.pd?.whatItDoes,
    snapshot.pd?.problem,
    snapshot.pd?.problemStatement,
    snapshot.pd?.solution,
    snapshot.pd?.audience,
    snapshot.pd?.diff,
    snapshot.pos?.statement,
    snapshot.pos?.valueProp,
    snapshot.msg?.pillars,
    snapshot.msg?.headline,
    snapshot.msg?.elevator,
    snapshot.strat?.goal,
    snapshot.strat?.channels,
    snapshot.strat?.hooks,
    snapshot.aiDraft?.productTruth?.problem,
    snapshot.aiDraft?.productTruth?.solution,
    snapshot.aiDraft?.productTruth?.icp,
    snapshot.aiDraft?.narrative?.positioning,
    snapshot.aiDraft?.narrative?.valueProposition,
    snapshot.aiDraft?.narrative?.messaging,
    normalizeDraftText(snapshot.aiDraft?.narrative?.topMessages),
    snapshot.aiDraft?.gtm?.strategy,
    snapshot.aiDraft?.gtm?.channels,
    snapshot.aiDraft?.gtm?.launchApproach,
    snapshot.aiDraft?.assets?.headline,
    snapshot.aiDraft?.assets?.elevatorPitch,
    snapshot.aiDraft?.assets?.emailPitch,
    snapshot.aiDraft?.assets?.messagingAsset,
    snapshot.assets?.notes,
  ]);
}

function preferNonEmpty(currentValue, existingValue) {
  return String(currentValue || "").trim() ? currentValue : existingValue;
}

function mergeSnapshotPreservingContent(existingSnapshot = {}, incomingSnapshot = {}) {
  const hydratedExisting = hydrateDraftSnapshot(existingSnapshot);
  const hydratedIncoming = hydrateDraftSnapshot(incomingSnapshot);

  if (countProjectSnapshotContent(hydratedIncoming) >= countProjectSnapshotContent(hydratedExisting)) {
    return hydratedIncoming;
  }

  return {
    ...hydratedIncoming,
    pd: {
      ...hydratedExisting.pd,
      ...hydratedIncoming.pd,
      name: preferNonEmpty(hydratedIncoming.pd?.name, hydratedExisting.pd?.name),
      description: preferNonEmpty(hydratedIncoming.pd?.description, hydratedExisting.pd?.description),
      whatItDoes: preferNonEmpty(hydratedIncoming.pd?.whatItDoes, hydratedExisting.pd?.whatItDoes),
      builtFor: preferNonEmpty(hydratedIncoming.pd?.builtFor, hydratedExisting.pd?.builtFor),
      problem: preferNonEmpty(hydratedIncoming.pd?.problem, hydratedExisting.pd?.problem),
      problemStatement: preferNonEmpty(hydratedIncoming.pd?.problemStatement, hydratedExisting.pd?.problemStatement),
      problemImpact: preferNonEmpty(hydratedIncoming.pd?.problemImpact, hydratedExisting.pd?.problemImpact),
      currentSolutionGaps: preferNonEmpty(hydratedIncoming.pd?.currentSolutionGaps, hydratedExisting.pd?.currentSolutionGaps),
      solution: preferNonEmpty(hydratedIncoming.pd?.solution, hydratedExisting.pd?.solution),
      solutionMechanism: preferNonEmpty(hydratedIncoming.pd?.solutionMechanism, hydratedExisting.pd?.solutionMechanism),
      whyNow: preferNonEmpty(hydratedIncoming.pd?.whyNow, hydratedExisting.pd?.whyNow),
      audience: preferNonEmpty(hydratedIncoming.pd?.audience, hydratedExisting.pd?.audience),
      diff: preferNonEmpty(hydratedIncoming.pd?.diff, hydratedExisting.pd?.diff),
    },
    comp: {
      ...hydratedExisting.comp,
      ...hydratedIncoming.comp,
      differentiators: preferNonEmpty(hydratedIncoming.comp?.differentiators, hydratedExisting.comp?.differentiators),
      alternativeGaps: preferNonEmpty(hydratedIncoming.comp?.alternativeGaps, hydratedExisting.comp?.alternativeGaps),
      proofPoints: preferNonEmpty(hydratedIncoming.comp?.proofPoints, hydratedExisting.comp?.proofPoints),
    },
    pos: {
      ...hydratedExisting.pos,
      ...hydratedIncoming.pos,
      statement: preferNonEmpty(hydratedIncoming.pos?.statement, hydratedExisting.pos?.statement),
      valueProp: preferNonEmpty(hydratedIncoming.pos?.valueProp, hydratedExisting.pos?.valueProp),
    },
    msg: {
      ...hydratedExisting.msg,
      ...hydratedIncoming.msg,
      pillars: preferNonEmpty(hydratedIncoming.msg?.pillars, hydratedExisting.msg?.pillars),
      headline: preferNonEmpty(hydratedIncoming.msg?.headline, hydratedExisting.msg?.headline),
      elevator: preferNonEmpty(hydratedIncoming.msg?.elevator, hydratedExisting.msg?.elevator),
    },
    strat: {
      ...hydratedExisting.strat,
      ...hydratedIncoming.strat,
      icp: preferNonEmpty(hydratedIncoming.strat?.icp, hydratedExisting.strat?.icp),
      goal: preferNonEmpty(hydratedIncoming.strat?.goal, hydratedExisting.strat?.goal),
      channels: preferNonEmpty(hydratedIncoming.strat?.channels, hydratedExisting.strat?.channels),
      hooks: preferNonEmpty(hydratedIncoming.strat?.hooks, hydratedExisting.strat?.hooks),
    },
    assets: {
      ...hydratedExisting.assets,
      ...hydratedIncoming.assets,
      notes: preferNonEmpty(hydratedIncoming.assets?.notes, hydratedExisting.assets?.notes),
    },
    aiDraft: {
      ...hydratedExisting.aiDraft,
      ...hydratedIncoming.aiDraft,
      context: {
        ...hydratedExisting.aiDraft?.context,
        ...hydratedIncoming.aiDraft?.context,
      },
      productTruth: {
        ...hydratedExisting.aiDraft?.productTruth,
        ...hydratedIncoming.aiDraft?.productTruth,
        problem: preferNonEmpty(hydratedIncoming.aiDraft?.productTruth?.problem, hydratedExisting.aiDraft?.productTruth?.problem),
        icp: preferNonEmpty(hydratedIncoming.aiDraft?.productTruth?.icp, hydratedExisting.aiDraft?.productTruth?.icp),
        value: preferNonEmpty(hydratedIncoming.aiDraft?.productTruth?.value, hydratedExisting.aiDraft?.productTruth?.value),
        solution: preferNonEmpty(hydratedIncoming.aiDraft?.productTruth?.solution, hydratedExisting.aiDraft?.productTruth?.solution),
        differentiation: preferNonEmpty(hydratedIncoming.aiDraft?.productTruth?.differentiation, hydratedExisting.aiDraft?.productTruth?.differentiation),
      },
      narrative: {
        ...hydratedExisting.aiDraft?.narrative,
        ...hydratedIncoming.aiDraft?.narrative,
        positioning: preferNonEmpty(hydratedIncoming.aiDraft?.narrative?.positioning, hydratedExisting.aiDraft?.narrative?.positioning),
        messaging: preferNonEmpty(hydratedIncoming.aiDraft?.narrative?.messaging, hydratedExisting.aiDraft?.narrative?.messaging),
        valueProposition: preferNonEmpty(hydratedIncoming.aiDraft?.narrative?.valueProposition, hydratedExisting.aiDraft?.narrative?.valueProposition),
        topMessages: (hydratedIncoming.aiDraft?.narrative?.topMessages || []).length ? hydratedIncoming.aiDraft.narrative.topMessages : (hydratedExisting.aiDraft?.narrative?.topMessages || []),
      },
      gtm: {
        ...hydratedExisting.aiDraft?.gtm,
        ...hydratedIncoming.aiDraft?.gtm,
        channels: preferNonEmpty(hydratedIncoming.aiDraft?.gtm?.channels, hydratedExisting.aiDraft?.gtm?.channels),
        hooks: preferNonEmpty(hydratedIncoming.aiDraft?.gtm?.hooks, hydratedExisting.aiDraft?.gtm?.hooks),
        strategy: preferNonEmpty(hydratedIncoming.aiDraft?.gtm?.strategy, hydratedExisting.aiDraft?.gtm?.strategy),
        launchApproach: preferNonEmpty(hydratedIncoming.aiDraft?.gtm?.launchApproach, hydratedExisting.aiDraft?.gtm?.launchApproach),
      },
      assets: {
        ...hydratedExisting.aiDraft?.assets,
        ...hydratedIncoming.aiDraft?.assets,
        headline: preferNonEmpty(hydratedIncoming.aiDraft?.assets?.headline, hydratedExisting.aiDraft?.assets?.headline),
        elevatorPitch: preferNonEmpty(hydratedIncoming.aiDraft?.assets?.elevatorPitch, hydratedExisting.aiDraft?.assets?.elevatorPitch),
        emailPitch: preferNonEmpty(hydratedIncoming.aiDraft?.assets?.emailPitch, hydratedExisting.aiDraft?.assets?.emailPitch),
        messagingAsset: preferNonEmpty(hydratedIncoming.aiDraft?.assets?.messagingAsset, hydratedExisting.aiDraft?.assets?.messagingAsset),
      },
      sourceSummary: preferNonEmpty(hydratedIncoming.aiDraft?.sourceSummary, hydratedExisting.aiDraft?.sourceSummary),
    },
    workflowStage: hydratedIncoming.workflowStage || hydratedExisting.workflowStage,
    active: hydratedIncoming.active || hydratedExisting.active,
    feedbackCaptured: hydratedIncoming.feedbackCaptured || hydratedExisting.feedbackCaptured,
    launchComplete: hydratedIncoming.launchComplete || hydratedExisting.launchComplete,
  };
}

const BROKEN_PROJECT_NAMES = new Set(["Samsung Fold"]);

function shouldQuarantineProject(project) {
  const name = String(project?.snapshot?.pd?.name || project?.name || "").trim();
  return BROKEN_PROJECT_NAMES.has(name);
}

function sanitizeProjects(projects) {
  return (projects || []).filter(project => project && !shouldQuarantineProject(project));
}

function groupProjectsIntoFamilies(projects = []) {
  const projectMap = new Map((projects || []).map(project => [project.id, project]));

  const resolveRootId = project => {
    let current = project;
    const seen = new Set();
    while (current?.snapshot?.pd?.previousVersionId && projectMap.has(current.snapshot.pd.previousVersionId) && !seen.has(current.snapshot.pd.previousVersionId)) {
      seen.add(current.snapshot.pd.previousVersionId);
      current = projectMap.get(current.snapshot.pd.previousVersionId);
    }
    return current?.id || project.id;
  };

  const familyMap = new Map();
  (projects || []).forEach(project => {
    const rootId = resolveRootId(project);
    const existing = familyMap.get(rootId) || [];
    familyMap.set(rootId, [...existing, project]);
  });

  return Array.from(familyMap.entries())
    .map(([rootId, versions]) => {
      const sortedVersions = [...versions].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
      const rootProject = projectMap.get(rootId) || sortedVersions[sortedVersions.length - 1] || sortedVersions[0];
      const displayVersions = [...sortedVersions].sort((a, b) => {
        if (a.id === rootProject?.id) return -1;
        if (b.id === rootProject?.id) return 1;
        const versionCompare = compareProjectVersions(a.version || a.snapshot?.pd?.version, b.version || b.snapshot?.pd?.version);
        if (versionCompare !== 0) return versionCompare;
        return new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0);
      });
      return {
        id: rootId,
        rootProject,
        versions: displayVersions,
        latestVersion: sortedVersions[0],
        createdAt: [...versions].reduce((earliest, project) => {
          const stamp = new Date(project.updatedAt || 0).getTime();
          return !earliest || stamp < earliest ? stamp : earliest;
        }, 0),
        updatedAt: new Date(sortedVersions[0]?.updatedAt || 0).getTime(),
      };
    })
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

function getProjectLifecycle(project = {}) {
  const snapshot = project.snapshot || project || {};
  const stage = snapshot.workflowStage || "";
  const pdStatus = snapshot.pd?.status || project.status || "";
  const isClosed = !!snapshot.feedbackCaptured || stage === "complete";
  const isLive = !isClosed && (
    !!snapshot.launchComplete ||
    stage === "feedback" ||
    pdStatus === "live" ||
    String(pdStatus).toLowerCase() === "live"
  );

  if (isClosed) {
    return { key: "closed", label: "Closed" };
  }
  if (isLive) {
    return { key: "live", label: "Live" };
  }
  return { key: "progress", label: "In Progress" };
}

function makeEmptyAiDraft() {
  return {
    context: {
      productCategory: "",
      targetAudience: "",
      coreUseCase: "",
      marketType: "",
      assumptions: [],
    },
    productTruth: { problem: "", icp: "", value: "", solution: "", differentiation: "" },
    narrative: { positioning: "", messaging: "", valueProposition: "", topMessages: [] },
    gtm: { channels: "", hooks: "", strategy: "", launchApproach: "" },
    assets: { headline: "", elevatorPitch: "", emailPitch: "", messagingAsset: "" },
    sourceSummary: "",
  };
}

function makeDefaultConfidenceState() {
  return {
    factors: [
      { id: "message", title: "Message Confidence", score: "4", note: "How confident are we that the story is clear and persuasive?" },
      { id: "proof", title: "Proof Confidence", score: "3", note: "Do we have enough evidence to support the claims we are making?" },
      { id: "market", title: "Market Confidence", score: "3", note: "How strong is our understanding of what the market actually cares about?" },
      { id: "launch", title: "Launch Confidence", score: "4", note: "How ready are we to use this narrative in a launch or GTM motion?" },
    ],
    decisionNotes: "",
  };
}

function normalizeConfidenceState(confidence = {}) {
  const fallback = makeDefaultConfidenceState();
  return {
    ...fallback,
    ...confidence,
    factors: Array.isArray(confidence?.factors) && confidence.factors.length ? confidence.factors : fallback.factors,
    decisionNotes: confidence?.decisionNotes || "",
  };
}

function makeDefaultAnalyticsState() {
  return {
    narrativePeriod: {
      id: "narrative-period-1",
      version: "v1.0",
      startDate: "2026-03-01",
      endDate: "2026-06-30",
    },
    performance: {
      revenue: "$480k",
      wins: 17,
      downloads: 120,
      engagement: "6.2%",
      signups: 42,
      conversions: 42,
    },
    metrics: [
      { id: "coverage", label: "Coverage", value: "78%", note: "Sections with usable feedback", tint: "linear-gradient(135deg, #F6F3FF 0%, #FFF8FC 100%)" },
      { id: "velocity", label: "Velocity", value: "12", note: "New feedback items this week", tint: "linear-gradient(135deg, #EEF8FF 0%, #F7FCFF 100%)" },
      { id: "clarity", label: "Clarity", value: "3.9", note: "Average message clarity score", tint: "linear-gradient(135deg, #FDF6EA 0%, #FFFDF7 100%)" },
    ],
    signals: [
      { id: "sales-calls", title: "Sales Call Signal", stage: "Emerging", note: "Capture repeated objections, high-conviction moments, and language prospects naturally use." },
      { id: "customer-feedback", title: "Customer Feedback Signal", stage: "Active", note: "Summarize the strongest customer reactions, surprises, and confusion points from interviews or demos." },
      { id: "market-patterns", title: "Market Pattern Signal", stage: "Watching", note: "Track how often similar competitors or buyers describe the same problem and category." },
    ],
    versions: [
      {
        id: "narrative-v1",
        version: "Narrative v1",
        startDate: "2026-01-01",
        endDate: "2026-03-31",
        performance: { revenue: "$320k", wins: 11, downloads: 74, engagement: "4.8%", conversions: 26 },
        signals: [
          { text: "Messaging too broad for sales calls" },
          { text: "Prospects ask for clearer proof points" },
        ],
        alignment: {
          internal: [{ score: 6.2 }, { score: 5.8 }, { score: 6.4 }],
          external: [{ score: 5.9 }, { score: 5.4 }, { score: 6.1 }],
        },
        healthScore: 6.1,
      },
    ],
  };
}

function normalizeAnalyticsState(analytics = {}) {
  const fallback = makeDefaultAnalyticsState();
  return {
    ...fallback,
    ...analytics,
    narrativePeriod: {
      ...fallback.narrativePeriod,
      ...(analytics?.narrativePeriod || {}),
    },
    performance: {
      ...fallback.performance,
      ...(analytics?.performance || {}),
    },
    metrics: Array.isArray(analytics?.metrics) && analytics.metrics.length ? analytics.metrics : fallback.metrics,
    signals: Array.isArray(analytics?.signals) && analytics.signals.length ? analytics.signals : fallback.signals,
    versions: Array.isArray(analytics?.versions) ? analytics.versions : fallback.versions,
  };
}

function normalizeStoryState(story = {}) {
  return {
    origin: story?.origin || "",
    customer: story?.customer || "",
    demo: story?.demo || "",
  };
}

function makeDefaultAlignmentState() {
  return {
    internal: [
      { id: "positioning", icon: "P", title: "Positioning Statement", status: "In Review", sales: 3, product: 3, note: "No positioning statement entered yet. Fill it in under Narrative." },
      { id: "messaging", icon: "M", title: "Messaging", status: "In Review", sales: 3, product: 3, note: "No messaging pillars defined yet. Add them under Narrative." },
      { id: "diff", icon: "D", title: "Top Differentiators", status: "In Review", sales: 3, product: 3, note: "No differentiators defined yet. Add them under Product Truth." },
      { id: "features", icon: "F", title: "Features vs Benefits", status: "In Review", sales: 3, product: 3, note: "No features or benefits defined yet. Add them under Product Truth." },
    ],
    external: [
      { id: "market-message", icon: "MM", title: "Market Narrative", status: "In Review", sales: 3, product: 4, note: "Capture the message customers repeat back most clearly after seeing the story." },
      { id: "proof", icon: "PR", title: "Proof Points", status: "Needs Work", sales: 2, product: 3, note: "Document external proof like customer outcomes, adoption signals, and quotes." },
      { id: "objections", icon: "OB", title: "Objection Handling", status: "In Review", sales: 3, product: 2, note: "List recurring buyer objections and the strongest response for each." },
      { id: "resonance", icon: "AR", title: "Audience Resonance", status: "Aligned", sales: 4, product: 4, note: "Track what language and value messages resonate best with the target audience." },
    ],
  };
}

function normalizeAlignmentState(alignment = {}) {
  const fallback = makeDefaultAlignmentState();
  return {
    internal: Array.isArray(alignment?.internal) && alignment.internal.length ? alignment.internal : fallback.internal,
    external: Array.isArray(alignment?.external) && alignment.external.length ? alignment.external : fallback.external,
  };
}

function normalizeAudienceState(aud = {}) {
  return {
    primary: aud?.primary || "",
    secondary: aud?.secondary || "",
  };
}

function normalizePdState(pd = {}) {
  return {
    name: pd?.name || "",
    description: pd?.description || "",
    wowFactor: pd?.wowFactor || "",
    whatChanged: pd?.whatChanged || "",
    previousVersionId: pd?.previousVersionId || "",
    previousVersionName: pd?.previousVersionName || "",
    changeType: pd?.changeType || "",
    launchDate: pd?.launchDate || "",
    version: pd?.version || "",
    status: pd?.status || "Planned",
    owner: pd?.owner || "Project Owner",
    reviewTeams: pd?.reviewTeams || "Product, Sales",
    category: pd?.category || "",
    whatItDoes: pd?.whatItDoes || "",
    builtFor: pd?.builtFor || "",
    problem: pd?.problem || "",
    problemStatement: pd?.problemStatement || "",
    problemImpact: pd?.problemImpact || "",
    currentSolutionGaps: pd?.currentSolutionGaps || "",
    solution: pd?.solution || "",
    solutionMechanism: pd?.solutionMechanism || "",
    whyNow: pd?.whyNow || "",
    audience: pd?.audience || "",
    diff: pd?.diff || "",
  };
}

function normalizeCapabilitiesState(cap = {}) {
  return {
    features: cap?.features || "",
    featurePriorities: cap?.featurePriorities || "",
    integrations: cap?.integrations || "",
    integrationValue: cap?.integrationValue || "",
    featureBenefits: Array.isArray(cap?.featureBenefits) && cap.featureBenefits.length
      ? cap.featureBenefits.map(item => ({ feature: item?.feature || "", benefit: item?.benefit || "" }))
      : [{ feature: "", benefit: "" }],
  };
}

function normalizeCompetitionState(comp = {}) {
  return {
    competitors: comp?.competitors || "",
    differentiators: comp?.differentiators || "",
    proofPoints: comp?.proofPoints || "",
    proofMetrics: comp?.proofMetrics || "",
    winLose: comp?.winLose || "",
    alternativeGaps: comp?.alternativeGaps || "",
    comparisonRows: Array.isArray(comp?.comparisonRows) && comp.comparisonRows.length
      ? comp.comparisonRows.map(row => ({
          category: row?.category || "",
          ourProduct: row?.ourProduct || "",
          competitorOne: row?.competitorOne || "",
          competitorTwo: row?.competitorTwo || "",
        }))
      : [
          { category: "Ease of use", ourProduct: "", competitorOne: "", competitorTwo: "" },
          { category: "Implementation speed", ourProduct: "", competitorOne: "", competitorTwo: "" },
        ],
  };
}

function normalizePositioningState(pos = {}) {
  return {
    statement: pos?.statement || "",
    valueProp: pos?.valueProp || "",
    tagline: pos?.tagline || "",
    taglineOptions: pos?.taglineOptions || "",
    keyValue: pos?.keyValue || "",
  };
}

function normalizeMessagingState(msg = {}) {
  return {
    headline: msg?.headline || "",
    pillars: msg?.pillars || "",
    elevator: msg?.elevator || "",
  };
}

function normalizeStrategyState(strat = {}) {
  return {
    goal: strat?.goal || "",
    icp: strat?.icp || "",
    channels: strat?.channels || "",
    hooks: strat?.hooks || "",
  };
}

function normalizeDraftText(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join("\n");
  }
  return typeof value === "string" ? value.trim() : "";
}

function buildProductInput(inputOrName, description = "") {
  if (typeof inputOrName === "object" && inputOrName !== null) {
    return {
      name: (inputOrName.name || "").trim(),
      description: (inputOrName.description || "").trim(),
      audience: (inputOrName.audience || "").trim(),
      category: (inputOrName.category || "").trim(),
      wowFactor: (inputOrName.wowFactor || "").trim(),
      whatChanged: (inputOrName.whatChanged || "").trim(),
    };
  }

  return {
    name: (inputOrName || "").trim(),
    description: (description || "").trim(),
    audience: "",
    category: "",
    wowFactor: "",
    whatChanged: "",
  };
}

function buildGroundingBrief(productInput) {
  return [
    `Product name: ${productInput.name || "Not provided"}`,
    `Product description: ${productInput.description || "Not provided"}`,
    `Audience: ${productInput.audience || "Not provided"}`,
    `Category: ${productInput.category || "Not provided"}`,
    `Wow factor: ${productInput.wowFactor || "Not provided"}`,
    `What changed: ${productInput.whatChanged || "Not provided"}`,
  ].join("\n");
}

function buildLegacyCanvasValues(productInput, draft) {
  const context = draft?.context || {};
  const productTruth = draft?.productTruth || {};
  const narrative = draft?.narrative || {};
  const gtm = draft?.gtm || {};
  const assets = draft?.assets || {};
  const joinedMessages = normalizeDraftText(narrative.topMessages);

  return {
    whatItDoes: productInput.description || context.coreUseCase || "",
    builtFor: productInput.audience || context.targetAudience || productTruth.icp || "",
    problem: productTruth.problem || "",
    problemStatement: productTruth.problem || "",
    problemImpact: productTruth.value
      ? `If this problem stays unresolved, teams continue losing clarity, speed, and alignment. ${productTruth.value}`
      : "",
    currentSolutionGaps: productTruth.differentiation
      ? `Current approaches feel fragmented or generic. ${productTruth.differentiation}`
      : "",
    solution: productTruth.solution || "",
    solutionMechanism: narrative.positioning || context.coreUseCase || "",
    whyNow: gtm.launchApproach || productInput.wowFactor || "",
    audience: productTruth.icp || context.targetAudience || productInput.audience || "",
    diff: productTruth.differentiation || productTruth.value || productInput.wowFactor || "",
    differentiators: joinedMessages || productTruth.differentiation || "",
    alternativeGaps: productTruth.differentiation || productTruth.problem || "",
    proofPoints: assets.messagingAsset || productTruth.value || "",
  };
}

function hydrateDraftSnapshot(snapshot = {}) {
  const draft = snapshot.aiDraft || makeEmptyAiDraft();
  const productInput = buildProductInput(snapshot.pd || {});
  const legacy = buildLegacyCanvasValues(productInput, draft);

  return {
    ...snapshot,
    pd: {
      ...snapshot.pd,
      category: snapshot.pd?.category || draft.context?.productCategory || "",
      whatItDoes: snapshot.pd?.whatItDoes || legacy.whatItDoes,
      builtFor: snapshot.pd?.builtFor || legacy.builtFor,
      problem: snapshot.pd?.problem || legacy.problem,
      problemStatement: snapshot.pd?.problemStatement || legacy.problemStatement,
      problemImpact: snapshot.pd?.problemImpact || legacy.problemImpact,
      currentSolutionGaps: snapshot.pd?.currentSolutionGaps || legacy.currentSolutionGaps,
      solution: snapshot.pd?.solution || legacy.solution,
      solutionMechanism: snapshot.pd?.solutionMechanism || legacy.solutionMechanism,
      whyNow: snapshot.pd?.whyNow || legacy.whyNow,
      audience: snapshot.pd?.audience || legacy.audience,
      diff: snapshot.pd?.diff || legacy.diff,
    },
    comp: {
      ...snapshot.comp,
      differentiators: snapshot.comp?.differentiators || legacy.differentiators,
      alternativeGaps: snapshot.comp?.alternativeGaps || legacy.alternativeGaps,
      proofPoints: snapshot.comp?.proofPoints || legacy.proofPoints,
    },
    pos: {
      ...snapshot.pos,
      valueProp: snapshot.pos?.valueProp || draft.narrative?.valueProposition || draft.productTruth?.value || "",
    },
    msg: {
      ...snapshot.msg,
      pillars: snapshot.msg?.pillars || draft.narrative?.messaging || normalizeDraftText(draft.narrative?.topMessages),
      headline: snapshot.msg?.headline || draft.assets?.headline || "",
      elevator: snapshot.msg?.elevator || draft.assets?.elevatorPitch || "",
    },
    strat: {
      ...snapshot.strat,
      icp: snapshot.strat?.icp || draft.productTruth?.icp || "",
      goal: snapshot.strat?.goal || draft.gtm?.strategy || "",
      channels: snapshot.strat?.channels || draft.gtm?.channels || "",
      hooks: snapshot.strat?.hooks || draft.gtm?.hooks || "",
    },
    assets: normalizeAssetsState(snapshot.assets || {}, {
      pd: snapshot.pd,
      msg: {
        ...snapshot.msg,
        headline: snapshot.msg?.headline || draft.assets?.headline || "",
        elevator: snapshot.msg?.elevator || draft.assets?.elevatorPitch || "",
      },
      strat: {
        ...snapshot.strat,
        goal: snapshot.strat?.goal || draft.gtm?.strategy || "",
        channels: snapshot.strat?.channels || draft.gtm?.channels || "",
        hooks: snapshot.strat?.hooks || draft.gtm?.hooks || "",
      },
      aiDraft: draft,
    }),
  };
}

function parseJsonResponse(text, fallback = {}) {
  if (!text) return fallback;
  try {
    const fenced = String(text).match(/```json\s*([\s\S]*?)```/i);
    return JSON.parse(fenced ? fenced[1] : text);
  } catch {
    return fallback;
  }
}

function buildLocalNarrativeDraft(inputOrName, productDescription = "") {
  const productInput = buildProductInput(inputOrName, productDescription);
  const trimmedName = productInput.name || "Your product";
  const trimmedDescription = productInput.description || "A product that helps teams work more clearly.";
  const trimmedAudience = productInput.audience || "PMM teams, founders, and lean go-to-market operators";
  const trimmedCategory = productInput.category || "Narrative intelligence workflow";
  const wowFactor = productInput.wowFactor || `${trimmedName} keeps product truth, messaging, and launch execution aligned in one system.`;
  const whatChanged = productInput.whatChanged || "";

  return {
    context: {
      productCategory: trimmedCategory,
      targetAudience: trimmedAudience,
      coreUseCase: trimmedDescription,
      marketType: "Emerging product marketing workflow software",
      assumptions: [
        `Assumption: ${trimmedName} is used in a B2B workflow where message clarity and launch readiness matter.`,
        `Assumption: the strongest hook is ${wowFactor.toLowerCase()}`,
        ...(whatChanged ? [`Assumption: this version should account for the following change: ${whatChanged}`] : []),
      ],
    },
    productTruth: {
      problem: whatChanged
        ? `${trimmedName} now needs a narrative that accounts for: ${whatChanged}. The product truth should reflect that updated market or product change clearly.`
        : `${trimmedName} solves a messy, fragmented workflow where teams struggle to explain the product clearly and move launches forward with confidence.`,
      icp: trimmedAudience,
      value: `${trimmedName} gives teams a clearer narrative foundation, faster launch readiness, and more consistent messaging from strategy to execution.`,
      solution: `${trimmedName} gives one place to structure product truth, shape narrative, and generate launch-ready outputs without scattered docs and prompts.`,
      differentiation: wowFactor,
    },
    narrative: {
      positioning: `For lean go-to-market teams that need a sharper launch story, ${trimmedName} is the workflow that turns product inputs into clear, launch-ready narrative.`,
      messaging: `Clear product truth\nFaster narrative refinement\nLaunch-ready outputs from one shared source`,
      valueProposition: `${trimmedName} helps teams move from rough product context to a clearer launch story with less narrative drift and faster execution.`,
      topMessages: [
        "Turn fragmented product thinking into a clear launch story.",
        "Keep product, marketing, and sales aligned around one narrative.",
        "Generate outputs faster without losing strategic clarity.",
      ],
    },
    gtm: {
      channels: "Founder-led selling, launch email, website hero copy, and customer-facing product marketing channels.",
      hooks: `Lead with the pain of scattered launch storytelling, show how ${trimmedName} creates clarity, then connect that clarity to faster execution.`,
      strategy: "Use a clarity-first launch motion focused on fast internal alignment, customer-facing messaging, and feedback capture.",
      launchApproach: "Start with a focused launch story, pressure-test it in early customer and sales conversations, then expand into assets and post-launch signal.",
    },
    assets: {
      headline: `${trimmedName} turns product truth into launch-ready narrative.`,
      elevatorPitch: `${trimmedName} helps teams align product truth, messaging, and launch execution in one workflow so they can ship clearer launches faster.`,
      emailPitch: `Teams lose momentum when product story lives across docs and prompts. ${trimmedName} helps you turn product truth into a sharper narrative and faster launch execution.`,
      messagingAsset: "Core message: one approved narrative from product truth to launch and feedback.",
    },
    sourceSummary: trimmedDescription,
  };
}

async function generateContext(productInput) {
  const fallback = buildLocalNarrativeDraft(productInput).context;
  try {
    const prompt = `You are a product marketing strategist building high-context product understanding.
Return ONLY valid JSON with this exact shape:
{
  "productCategory": "string",
  "targetAudience": "string",
  "coreUseCase": "string",
  "marketType": "string",
  "assumptions": ["string"]
}

Use this product brief as the primary source of truth:
${buildGroundingBrief(productInput)}

Rules:
- Avoid generic SaaS language
- Be specific and realistic
- Clearly distinguish direct facts from inferred assumptions
- Every assumption must begin with "Assumption:"
- Reuse the product description's concrete nouns and verbs whenever possible
- If audience or category is missing, infer it from the product description instead of guessing a generic PMM/B2B answer
- coreUseCase should describe what the product actually helps someone do in plain language`;
    const text = await generateOpenAiText(prompt);
    const parsed = parseJsonResponse(text, fallback);
    return {
      ...fallback,
      ...parsed,
      assumptions: Array.isArray(parsed?.assumptions) ? parsed.assumptions : fallback.assumptions,
    };
  } catch {
    return fallback;
  }
}

async function generateProductTruth(context, productInput) {
  const fallback = buildLocalNarrativeDraft(productInput).productTruth;
  try {
    const prompt = `You are generating Product Truth for a product marketing workflow.
Return ONLY valid JSON with this exact shape:
{
  "problem": "string",
  "icp": "string",
  "value": "string",
  "solution": "string",
  "differentiation": "string"
}

Product input:
${JSON.stringify(productInput, null, 2)}

Context:
${JSON.stringify(context, null, 2)}

Rules:
- be specific and concrete
- describe the product the user actually entered, not Loop or a generic SaaS company
- use the product description, audience, category, and wow factor directly
- keep differentiation grounded in the wow factor and actual use case
- do not use phrases like "clearer narrative foundation", "aligned execution", or "launch-ready" unless the product is actually about those things
- problem should describe the end-user pain
- solution should explain how the product solves that pain in plain English
- value should describe the outcome the buyer gets, not internal team process benefits`;
    const text = await generateOpenAiText(prompt);
    return { ...fallback, ...parseJsonResponse(text, fallback) };
  } catch {
    return fallback;
  }
}

async function generateNarrative(productTruth, context, productInput) {
  const fallback = buildLocalNarrativeDraft(productInput).narrative;
  try {
    const prompt = `You are generating a concise core narrative.
Return ONLY valid JSON with this exact shape:
{
  "positioning": "string",
  "messaging": "string",
  "valueProposition": "string",
  "topMessages": ["string", "string", "string"]
}

Product Truth:
${JSON.stringify(productTruth, null, 2)}

Context:
${JSON.stringify(context, null, 2)}

Rules:
- positioning should follow Geoffrey Moore style where possible
- topMessages must be concise and differentiated
- avoid bland category language
- keep the wording specific to this product's audience and use case
- do not repeat the same message in every field
- valueProposition should sound like the buyer outcome, not internal marketing jargon
- topMessages should each focus on a distinct angle: problem, outcome, and differentiation`;
    const text = await generateOpenAiText(prompt);
    const parsed = parseJsonResponse(text, fallback);
    return {
      ...fallback,
      ...parsed,
      topMessages: Array.isArray(parsed?.topMessages) ? parsed.topMessages : fallback.topMessages,
    };
  } catch {
    return fallback;
  }
}

async function generateGtm(narrative, productTruth, context, productInput) {
  const fallback = buildLocalNarrativeDraft(productInput).gtm;
  try {
    const prompt = `You are generating a lightweight GTM plan.
Return ONLY valid JSON with this exact shape:
{
  "channels": "string",
  "hooks": "string",
  "strategy": "string",
  "launchApproach": "string"
}

Narrative:
${JSON.stringify(narrative, null, 2)}

Product Truth:
${JSON.stringify(productTruth, null, 2)}

Context:
${JSON.stringify(context, null, 2)}

Rules:
- keep it launch-ready and practical
- choose realistic channels
- connect hooks directly to the problem and wow factor
- channels must fit the actual audience and product category
- strategy should be 2-4 sentences and reflect how this product would realistically be introduced to the market
- do not recommend channels that don't fit the described audience`;
    const text = await generateOpenAiText(prompt);
    return { ...fallback, ...parseJsonResponse(text, fallback) };
  } catch {
    return fallback;
  }
}

async function generateAssets(narrative, gtm, productTruth, context, productInput) {
  const fallback = buildLocalNarrativeDraft(productInput).assets;
  try {
    const prompt = `You are creating starter assets for a product marketing platform.
Return ONLY valid JSON with this exact shape:
{
  "headline": "string",
  "elevatorPitch": "string",
  "emailPitch": "string",
  "messagingAsset": "string"
}

Narrative:
${JSON.stringify(narrative, null, 2)}

GTM:
${JSON.stringify(gtm, null, 2)}

Product Truth:
${JSON.stringify(productTruth, null, 2)}

Context:
${JSON.stringify(context, null, 2)}

Rules:
- keep the headline concise
- make the elevator pitch speak like a human
- make the email pitch usable as a first outreach draft
- messagingAsset should be a reusable key-message block
- every asset must clearly reflect the product description and audience
- avoid generic launch language unless the product itself is about launches
- headline should sound like something a real buyer could understand in one read`;
    const text = await generateOpenAiText(prompt);
    return { ...fallback, ...parseJsonResponse(text, fallback) };
  } catch {
    return fallback;
  }
}

function calculateFeedbackConfidence(sectionReviews = {}) {
  const reviews = Object.values(sectionReviews || {});
  if (!reviews.length) return 0;

  const weightedAverage = average(reviews.map(review => {
    const scores = review.scores || {};
    return (
      clampReviewScore(scores.clarity) * 0.25 +
      clampReviewScore(scores.relevance) * 0.25 +
      clampReviewScore(scores.differentiation) * 0.3 +
      clampReviewScore(scores.value) * 0.2
    );
  }));

  return Math.max(0, Math.min(100, Math.round((weightedAverage / 10) * 100)));
}

async function normalizeFeedback(sectionReview) {
  const fallback = {
    dominantIssue: sectionReview.decision === "improve" ? "Needs stronger narrative quality" : "Approved with no major concerns",
    severity: sectionReview.decision === "improve" ? "medium" : "low",
    parameterAffected: ["clarity", "relevance", "differentiation", "value"]
      .sort((a, b) => clampReviewScore(sectionReview.scores?.[a]) - clampReviewScore(sectionReview.scores?.[b]))[0] || "clarity",
    summary: sectionReview.comment || `${sectionReview.sectionName} was reviewed by ${sectionReview.reviewerTeam}.`,
  };

  try {
    const prompt = `Convert the following feedback into structured signals.
Return ONLY valid JSON with this exact shape:
{
  "dominantIssue": "string",
  "severity": "low|medium|high",
  "parameterAffected": "clarity|relevance|differentiation|value",
  "summary": "string"
}

Section: ${sectionReview.sectionName}
Team: ${sectionReview.reviewerTeam}
Scores:
Clarity: ${clampReviewScore(sectionReview.scores?.clarity)}
Relevance: ${clampReviewScore(sectionReview.scores?.relevance)}
Differentiation: ${clampReviewScore(sectionReview.scores?.differentiation)}
Value: ${clampReviewScore(sectionReview.scores?.value)}

Comment:
${sectionReview.comment || "No additional comment."}

Decision:
${sectionReview.decision || sectionReview.status}`;
    const text = await generateOpenAiText(prompt);
    return { ...fallback, ...parseJsonResponse(text, fallback) };
  } catch {
    return fallback;
  }
}

async function aggregateFeedback(allSections) {
  const fallback = {
    topIssues: allSections
      .map(item => item.signal?.dominantIssue)
      .filter(Boolean)
      .slice(0, 3),
    weakestParameter: allSections
      .map(item => item.signal?.parameterAffected)
      .find(Boolean) || "clarity",
    strongestParameter: "value",
    crossSectionPatterns: allSections
      .filter(item => item.signal?.summary)
      .map(item => item.signal.summary)
      .slice(0, 3),
  };

  try {
    const prompt = `Analyze the following feedback signals.
Return ONLY valid JSON with this exact shape:
{
  "topIssues": ["string"],
  "weakestParameter": "string",
  "strongestParameter": "string",
  "crossSectionPatterns": ["string"]
}

Signals:
${JSON.stringify(allSections, null, 2)}`;
    const text = await generateOpenAiText(prompt);
    const parsed = parseJsonResponse(text, fallback);
    return {
      ...fallback,
      ...parsed,
      topIssues: Array.isArray(parsed?.topIssues) ? parsed.topIssues : fallback.topIssues,
      crossSectionPatterns: Array.isArray(parsed?.crossSectionPatterns) ? parsed.crossSectionPatterns : fallback.crossSectionPatterns,
    };
  } catch {
    return fallback;
  }
}

async function generateFeedbackSuggestions(insights) {
  const fallback = {
    improvements: [
      {
        action: "Tighten the sections with the weakest scores first.",
        section: "Core Narrative",
        impact: "Improves narrative clarity and review confidence.",
      },
    ],
  };

  try {
    const prompt = `Based on these issues, generate actionable improvements.
Return ONLY valid JSON with this exact shape:
{
  "improvements": [
    {
      "action": "string",
      "section": "string",
      "impact": "string"
    }
  ]
}

Insights:
${JSON.stringify(insights, null, 2)}`;
    const text = await generateOpenAiText(prompt);
    const parsed = parseJsonResponse(text, fallback);
    return {
      improvements: Array.isArray(parsed?.improvements) && parsed.improvements.length
        ? parsed.improvements
        : fallback.improvements,
    };
  } catch {
    return fallback;
  }
}

function escapeReportHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildReportRow(label, value) {
  return `
    <tr>
      <th>${escapeReportHtml(label)}</th>
      <td>${escapeReportHtml(value || "-")}</td>
    </tr>
  `;
}

function buildProjectReportHtml(data) {
  const {
    pd,
    pos,
    msg,
    aud,
    comp,
    strat,
    story,
    assets,
    feedbackEntries,
    projectReview,
    narrativeHealthScore,
    confidenceScore,
    alignmentScore,
    reviewInsights = {},
    reviewAnalytics = {
      totals: { approved: 0, improve: 0, pending: 0, routed: 0 },
      scores: { clarity: 0, relevance: 0, differentiation: 0, value: 0 },
      byTeam: [],
    },
    pmmActionQueue = [],
  } = data;

  const feedbackRows = (feedbackEntries || [])
    .slice(0, 10)
    .map(entry => `
      <tr>
        <td>${escapeReportHtml(entry.source || "Team")}</td>
        <td>${escapeReportHtml(entry.note || "-")}</td>
        <td>${escapeReportHtml(entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : "-")}</td>
      </tr>
    `)
    .join("");

  const suggestionRows = (reviewInsights.suggestions || [])
    .map(item => `
      <tr>
        <td>${escapeReportHtml(item.action || "Suggestion")}</td>
        <td>${escapeReportHtml(item.section || "-")}</td>
        <td>${escapeReportHtml(item.impact || "-")}</td>
      </tr>
    `)
    .join("");

  const queueRows = (pmmActionQueue || [])
    .map(item => `
      <tr>
        <td>${escapeReportHtml(item.sectionName || "-")}</td>
        <td>${escapeReportHtml(item.workspace || "-")}</td>
        <td>${escapeReportHtml(item.reason || "-")}</td>
      </tr>
    `)
    .join("");

  const teamRows = (reviewAnalytics.byTeam || [])
    .map(item => `
      <tr>
        <td>${escapeReportHtml(item.team || "-")}</td>
        <td>${escapeReportHtml(item.count || 0)}</td>
      </tr>
    `)
    .join("");

  const assetRows = (assets?.rows || [])
    .map(item => `
      <tr>
        <td>${escapeReportHtml(item.assetName || "-")}</td>
        <td>${escapeReportHtml(item.category || "-")}</td>
        <td>${escapeReportHtml(item.status || "-")}</td>
        <td>${escapeReportHtml(item.score || 0)}</td>
      </tr>
    `)
    .join("");

  const approvedKitMap = (assets?.rows || [])
    .filter(item => item.status === "Approved")
    .reduce((acc, item) => {
      const key = item.kit || item.category || "Approved Kit";
      acc[key] = [...(acc[key] || []), item.assetName];
      return acc;
    }, {});

  const approvedKitRows = Object.entries(approvedKitMap)
    .map(([kit, items]) => `
      <tr>
        <td>${escapeReportHtml(kit)}</td>
        <td>${escapeReportHtml(items.join(" | "))}</td>
      </tr>
    `)
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeReportHtml(pd.name || "Loop Project Report")}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 32px; color: #1f1b5b; background: #faf9ff; }
      .wrap { max-width: 980px; margin: 0 auto; }
      .hero { background: #fff; border: 1px solid #d7d3fb; border-radius: 18px; padding: 24px; margin-bottom: 18px; }
      .eyebrow { font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #5b52c4; }
      h1 { margin: 10px 0 6px; font-size: 36px; line-height: 1.05; }
      p { line-height: 1.6; }
      .grid { display: grid; gap: 18px; }
      .section { background: #fff; border: 1px solid #d7d3fb; border-radius: 18px; overflow: hidden; }
      .section h2 { margin: 0; padding: 16px 18px; font-size: 20px; border-bottom: 1px solid #ece9ff; background: #f7f5ff; }
      table { width: 100%; border-collapse: collapse; }
      th, td { text-align: left; padding: 12px 18px; border-bottom: 1px solid #ece9ff; vertical-align: top; }
      th { width: 30%; font-size: 13px; color: #625a9b; }
      td { font-size: 14px; color: #1f1b5b; white-space: pre-wrap; }
      .meta { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 12px; }
      .pill { padding: 8px 10px; border-radius: 999px; background: #f0eeff; font-size: 12px; font-weight: 700; color: #5b52c4; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="hero">
        <div class="eyebrow">Loop Report</div>
        <h1>${escapeReportHtml(pd.name || "Untitled Project")}</h1>
        <p>${escapeReportHtml(pd.description || "Loop project report generated from the current workspace state.")}</p>
        <div class="meta">
          <span class="pill">Version ${escapeReportHtml(pd.version || "v1.0")}</span>
          <span class="pill">Status ${escapeReportHtml(pd.status || "Planned")}</span>
          <span class="pill">Review ${escapeReportHtml(projectReview.status || "Draft")}</span>
          <span class="pill">Narrative Health ${escapeReportHtml(narrativeHealthScore)}/10</span>
          <span class="pill">Alignment ${escapeReportHtml(alignmentScore)}/100</span>
          <span class="pill">Confidence ${escapeReportHtml(confidenceScore)}/100</span>
        </div>
      </div>

      <div class="grid">
        <section class="section">
          <h2>Product Truth</h2>
          <table>
            ${buildReportRow("What Product Does", pd.what || pd.description)}
            ${buildReportRow("Who It Is For", pd.audience || aud.primary)}
            ${buildReportRow("Core Problem", pd.problem)}
            ${buildReportRow("Impact", pd.impact || pd.urgency)}
            ${buildReportRow("Solution Summary", pd.solution)}
            ${buildReportRow("How It Solves The Problem", pd.solutionMechanism)}
          </table>
        </section>

        <section class="section">
          <h2>Core Narrative</h2>
          <table>
            ${buildReportRow("Positioning Statement", pos.statement)}
            ${buildReportRow("Value Proposition", pos.valueProp)}
            ${buildReportRow("Top Messaging", msg.headline)}
            ${buildReportRow("Messaging Pillars", msg.pillars)}
            ${buildReportRow("Elevator Pitch", msg.elevator)}
          </table>
        </section>

        <section class="section">
          <h2>Competition</h2>
          <table>
            ${buildReportRow("Main Competitors", comp.competitors)}
            ${buildReportRow("Why We Win", comp.differentiators)}
            ${buildReportRow("Alternative Gaps", comp.alternativeGaps)}
            ${buildReportRow("Proof Points", comp.proofPoints || comp.proofMetrics)}
          </table>
        </section>

        <section class="section">
          <h2>GTM and Assets</h2>
          <table>
            ${buildReportRow("Launch Goal", strat.goal)}
            ${buildReportRow("Target Segment", strat.icp)}
            ${buildReportRow("Channels", strat.channels)}
            ${buildReportRow("Launch Story", story.origin || story.customer)}
            ${buildReportRow("Asset Notes", assets.notes)}
            ${buildReportRow("Total Assets", assets?.rows?.length || 0)}
            ${buildReportRow("Approved Assets", (assets?.rows || []).filter(item => item.status === "Approved").length)}
            ${buildReportRow("Needs Work Assets", (assets?.rows || []).filter(item => item.status === "Needs Work").length)}
          </table>
          <table>
            <thead>
              <tr><th>Asset</th><th>Category</th><th>Status</th><th>Score</th></tr>
            </thead>
            <tbody>
              ${assetRows || `<tr><td colspan="4">No assets have been generated yet.</td></tr>`}
            </tbody>
          </table>
          <table>
            <thead>
              <tr><th>Approved Kit</th><th>Assets Included</th></tr>
            </thead>
            <tbody>
              ${approvedKitRows || `<tr><td colspan="2">No approved kits are available yet.</td></tr>`}
            </tbody>
          </table>
        </section>

        <section class="section">
          <h2>Feedback and Review</h2>
          <table>
            ${buildReportRow("Review Status", projectReview.status)}
            ${buildReportRow("Review Teams", (projectReview.teams || []).join(", "))}
            ${buildReportRow("Latest Review Action", projectReview.lastAction)}
            ${buildReportRow("Weakest Parameter", reviewInsights.weakestParameter)}
            ${buildReportRow("Strongest Parameter", reviewInsights.strongestParameter)}
            ${buildReportRow("Cross-Section Patterns", (reviewInsights.crossSectionPatterns || []).join(" | "))}
          </table>
          <table>
            <thead>
              <tr><th>Source</th><th>Feedback</th><th>Date</th></tr>
            </thead>
            <tbody>
              ${feedbackRows || `<tr><td colspan="3">No feedback captured yet.</td></tr>`}
            </tbody>
          </table>
        </section>

        <section class="section">
          <h2>Feedback Intelligence</h2>
          <table>
            ${buildReportRow("Top Issues", (reviewInsights.topIssues || []).join(" | "))}
            ${buildReportRow("Open PMM Actions", pmmActionQueue.length)}
            ${buildReportRow("Approved Sections", reviewAnalytics.totals.approved)}
            ${buildReportRow("Improve Requests", reviewAnalytics.totals.improve)}
            ${buildReportRow("Pending Reviews", reviewAnalytics.totals.pending)}
            ${buildReportRow("Sections Routed", reviewAnalytics.totals.routed)}
            ${buildReportRow("Average Clarity", reviewAnalytics.scores.clarity)}
            ${buildReportRow("Average Relevance", reviewAnalytics.scores.relevance)}
            ${buildReportRow("Average Differentiation", reviewAnalytics.scores.differentiation)}
            ${buildReportRow("Average Value", reviewAnalytics.scores.value)}
          </table>
          <table>
            <thead>
              <tr><th>Action</th><th>Section</th><th>Expected Impact</th></tr>
            </thead>
            <tbody>
              ${suggestionRows || `<tr><td colspan="3">No AI suggestions generated yet.</td></tr>`}
            </tbody>
          </table>
        </section>

        <section class="section">
          <h2>Action Queue and Team Coverage</h2>
          <table>
            <thead>
              <tr><th>Section</th><th>Workspace</th><th>Reason</th></tr>
            </thead>
            <tbody>
              ${queueRows || `<tr><td colspan="3">No PMM follow-up items are open.</td></tr>`}
            </tbody>
          </table>
          <table>
            <thead>
              <tr><th>Team</th><th>Assigned Sections</th></tr>
            </thead>
            <tbody>
              ${teamRows || `<tr><td colspan="2">No team routing data is available yet.</td></tr>`}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  </body>
</html>`;
}

function buildSectionExportHtml({ projectName, workspaceTitle, intro, rows = [] }) {
  const tableRows = rows
    .map(row => buildReportRow(row.label, row.value))
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeReportHtml(projectName || "Loop Workspace Export")} - ${escapeReportHtml(workspaceTitle)}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 32px; color: #1f1b5b; background: #faf9ff; }
      .wrap { max-width: 920px; margin: 0 auto; }
      .hero { background: #fff; border: 1px solid #d7d3fb; border-radius: 18px; padding: 24px; margin-bottom: 18px; }
      .eyebrow { font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #5b52c4; }
      h1 { margin: 10px 0 6px; font-size: 34px; line-height: 1.05; }
      p { line-height: 1.6; }
      .section { background: #fff; border: 1px solid #d7d3fb; border-radius: 18px; overflow: hidden; }
      .section h2 { margin: 0; padding: 16px 18px; font-size: 20px; border-bottom: 1px solid #ece9ff; background: #f7f5ff; }
      table { width: 100%; border-collapse: collapse; }
      th, td { text-align: left; padding: 12px 18px; border-bottom: 1px solid #ece9ff; vertical-align: top; }
      th { width: 30%; font-size: 13px; color: #625a9b; }
      td { font-size: 14px; color: #1f1b5b; white-space: pre-wrap; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="hero">
        <div class="eyebrow">Loop Workspace Export</div>
        <h1>${escapeReportHtml(workspaceTitle)}</h1>
        <p>${escapeReportHtml(intro || "Loop exported this workspace from the current project state.")}</p>
      </div>
      <section class="section">
        <h2>${escapeReportHtml(workspaceTitle)}</h2>
        <table>
          ${tableRows}
        </table>
      </section>
    </div>
  </body>
</html>`;
}

function buildVersionComparisonHtml({ currentProjectName, currentVersion, previousVersion, changeType, whatChanged, previous, current }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeReportHtml(currentProjectName || "Loop Version Comparison")}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 32px; color: #1f1b5b; background: #faf9ff; }
      .wrap { max-width: 1040px; margin: 0 auto; }
      .hero, .section { background: #fff; border: 1px solid #d7d3fb; border-radius: 18px; margin-bottom: 18px; overflow: hidden; }
      .hero { padding: 24px; }
      .eyebrow { font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #5b52c4; }
      h1 { margin: 10px 0 6px; font-size: 34px; line-height: 1.08; }
      p { line-height: 1.6; }
      .meta { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 12px; }
      .pill { padding: 8px 10px; border-radius: 999px; background: #f0eeff; font-size: 12px; font-weight: 700; color: #5b52c4; }
      h2 { margin: 0; padding: 16px 18px; font-size: 20px; border-bottom: 1px solid #ece9ff; background: #f7f5ff; }
      table { width: 100%; border-collapse: collapse; }
      th, td { text-align: left; padding: 12px 18px; border-bottom: 1px solid #ece9ff; vertical-align: top; }
      th { width: 22%; font-size: 13px; color: #625a9b; }
      td { white-space: pre-wrap; line-height: 1.6; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="hero">
        <div class="eyebrow">Loop Version Comparison</div>
        <h1>${escapeReportHtml(currentProjectName || "Next Version Comparison")}</h1>
        <p>${escapeReportHtml(whatChanged || "Loop compared this version against the previous narrative to show what changed.")}</p>
        <div class="meta">
          <span class="pill">Current ${escapeReportHtml(currentVersion || "v1.0")}</span>
          <span class="pill">Previous ${escapeReportHtml(previousVersion || "v1.0")}</span>
          <span class="pill">${escapeReportHtml(changeType || "Version Update")}</span>
        </div>
      </div>

      <section class="section">
        <h2>Product Truth</h2>
        <table>
          <tr><th>Problem</th><td>${escapeReportHtml(previous.pd?.problem || "-")}</td><td>${escapeReportHtml(current.pd?.problem || "-")}</td></tr>
          <tr><th>Solution</th><td>${escapeReportHtml(previous.pd?.solution || "-")}</td><td>${escapeReportHtml(current.pd?.solution || "-")}</td></tr>
          <tr><th>Audience</th><td>${escapeReportHtml(previous.pd?.audience || "-")}</td><td>${escapeReportHtml(current.pd?.audience || "-")}</td></tr>
          <tr><th>Differentiation</th><td>${escapeReportHtml(previous.pd?.diff || "-")}</td><td>${escapeReportHtml(current.pd?.diff || "-")}</td></tr>
        </table>
      </section>

      <section class="section">
        <h2>Core Narrative</h2>
        <table>
          <tr><th>Positioning</th><td>${escapeReportHtml(previous.pos?.statement || "-")}</td><td>${escapeReportHtml(current.pos?.statement || "-")}</td></tr>
          <tr><th>Value Proposition</th><td>${escapeReportHtml(previous.pos?.valueProp || "-")}</td><td>${escapeReportHtml(current.pos?.valueProp || "-")}</td></tr>
          <tr><th>Messaging</th><td>${escapeReportHtml(previous.msg?.pillars || "-")}</td><td>${escapeReportHtml(current.msg?.pillars || "-")}</td></tr>
        </table>
      </section>

      <section class="section">
        <h2>GTM</h2>
        <table>
          <tr><th>Strategy</th><td>${escapeReportHtml(previous.strat?.goal || "-")}</td><td>${escapeReportHtml(current.strat?.goal || "-")}</td></tr>
          <tr><th>Channels</th><td>${escapeReportHtml(previous.strat?.channels || "-")}</td><td>${escapeReportHtml(current.strat?.channels || "-")}</td></tr>
          <tr><th>Launch Strategy</th><td>${escapeReportHtml(previous.strat?.hooks || "-")}</td><td>${escapeReportHtml(current.strat?.hooks || "-")}</td></tr>
        </table>
      </section>
    </div>
  </body>
</html>`;
}

function buildLocalAiResponse(prompt = "") {
  const text = prompt.toLowerCase();
  const sectionMatch = prompt.match(/Current section:\s*([^.]*)/i);
  const section = sectionMatch?.[1] || "this section";

  if (text.includes("summarize")) {
    return `Summary for ${section}: keep the message clear, specific, and tied to one buyer problem. The current section should state the core outcome, who it matters to, and the strongest proof or differentiator.`;
  }

  if (text.includes("sharpen")) {
    return `To sharpen ${section}, remove broad language, lead with the customer problem, then make the value specific. Tighten each point into: problem, promise, proof, and why this is different now.`;
  }

  if (text.includes("risk")) {
    return `Risks in ${section}: the value may be too broad, the proof may be weak, and the message may not be clearly tied to one audience. Check for unsupported claims, unclear differentiation, and language that product, sales, and marketing would interpret differently.`;
  }

  if (text.includes("positioning")) {
    return "Draft the positioning in Geoffrey Moore style: target customer, unmet need, category, key benefit, and main differentiation. Keep it short enough that sales and marketing can repeat it consistently.";
  }

  if (text.includes("asset")) {
    return "Start from the approved narrative, then adapt it for one channel at a time. Lead with the core problem, introduce the product promise, add one differentiator, and close with a simple call to action.";
  }

  return `Loop AI helper for ${section}: use this space to turn raw product inputs into a clearer story, highlight gaps, and suggest the next best move for launch readiness.`;
}

async function callClaude(prompt) {
  try {
    if (import.meta.env.VITE_OPENAI_API_KEY) {
      return await generateOpenAiText(prompt);
    }
  } catch {
    // Fall back to local AI helper for private MVP testing if the live request fails.
  }
  return Promise.resolve(buildLocalAiResponse(prompt));
}

function PField({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: S.text }}>{label}</span>
      </div>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        style={{
          width: "100%", boxSizing: "border-box", padding: "8px 10px",
          fontSize: 13, fontFamily: "inherit", lineHeight: 1.5,
          border: `1px solid ${S.border}`, borderRadius: 8,
          background: S.bg, color: S.text, resize: "vertical", outline: "none",
        }} />
    </div>
  );
}

function CanvasField({ label, value, onChange, placeholder, rows = 4, minHeight = 150, accent = P[50] }) {
  return (
    <div style={{
      background: accent,
      border: `1px solid ${S.border}`,
      borderRadius: 14,
      padding: 16,
      boxShadow: "0 1px 0 rgba(38, 33, 92, 0.03)",
      minHeight,
      display: "flex",
      flexDirection: "column",
      minWidth: 0,
      overflow: "hidden",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: S.text }}>{label}</span>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          width: "100%",
          flex: 1,
          boxSizing: "border-box",
          padding: "0",
          fontSize: 13,
          fontFamily: "inherit",
          lineHeight: 1.6,
          border: "none",
          background: "transparent",
          color: S.text,
          resize: "none",
          outline: "none",
        }}
      />
    </div>
  );
}

function FeatureBenefitTable({ items, onChange }) {
  const updateItem = (index, key, value) => {
    onChange(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  };

  const addItem = () => {
    onChange([...items, { feature: "", benefit: "" }]);
  };

  const removeItem = index => {
    onChange(items.filter((_, i) => i !== index));
  };

  const visibleItems = items.length ? items : [{ feature: "", benefit: "" }];
  const signUpOpen = false;
  const setSignUpOpen = () => {};
  const signUpForm = { fullName: "", workEmail: "", companyName: "", password: "" };
  const setSignUpForm = () => {};
  const onLogIn = () => {};

  return (
    <div style={{
      background: "linear-gradient(180deg, #F8F7FF 0%, #F1EFFF 100%)",
      border: `1px solid ${S.border}`,
      borderRadius: 14,
      padding: 16,
      minHeight: 320,
      minWidth: 0,
      overflow: "hidden",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: S.text }}>Feature + Benefit</div>
          <div style={{ fontSize: 11, color: S.muted, marginTop: 3 }}>Add structured feature entries in a canvas-style editor.</div>
        </div>
        <button
          onClick={addItem}
          style={{
            border: "none",
            background: P[600],
            color: "white",
            borderRadius: 10,
            padding: "8px 12px",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          + Add Feature
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 16 }}>
        {visibleItems.map((item, index) => (
          <div key={`feature-preview-${index}`} style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 12, padding: 14, minHeight: 118 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: S.text, lineHeight: 1.3 }}>
                {item.feature || `Feature ${index + 1}`}
              </div>
              <span style={{ fontSize: 11, color: P[600], background: P[50], borderRadius: 999, padding: "4px 10px", whiteSpace: "nowrap" }}>
                Feature
              </span>
            </div>
            <div style={{ fontSize: 13, color: S.muted, lineHeight: 1.55 }}>
              {item.benefit || "Capture the customer-facing benefit for this feature."}
            </div>
          </div>
        ))}
      </div>

      <div style={{ border: `1px solid ${S.border}`, borderRadius: 12, overflowX: "auto", background: "white" }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(180px, 0.9fr) minmax(260px, 1.3fr) 64px", background: P[50], borderBottom: `1px solid ${S.border}` }}>
          <div style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: P[800], textTransform: "uppercase", letterSpacing: "0.06em" }}>Feature</div>
          <div style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: P[800], textTransform: "uppercase", letterSpacing: "0.06em" }}>Benefit</div>
          <div style={{ padding: "10px 12px" }} />
        </div>
        {visibleItems.map((item, index) => (
          <div key={`feature-row-${index}`} style={{ display: "grid", gridTemplateColumns: "minmax(180px, 0.9fr) minmax(260px, 1.3fr) 64px", borderBottom: index === visibleItems.length - 1 ? "none" : `1px solid ${S.border}` }}>
            <input
              value={item.feature}
              onChange={e => updateItem(index, "feature", e.target.value)}
              placeholder="Feature name"
              style={{ border: "none", padding: "12px", fontSize: 13, color: S.text, outline: "none", fontFamily: "inherit" }}
            />
            <input
              value={item.benefit}
              onChange={e => updateItem(index, "benefit", e.target.value)}
              placeholder="Customer benefit"
              style={{ border: "none", borderLeft: `1px solid ${S.border}`, padding: "12px", fontSize: 13, color: S.text, outline: "none", fontFamily: "inherit" }}
            />
            <button
              onClick={() => removeItem(index)}
              disabled={visibleItems.length === 1 && !item.feature && !item.benefit}
              style={{
                border: "none",
                borderLeft: `1px solid ${S.border}`,
                background: "transparent",
                color: visibleItems.length === 1 && !item.feature && !item.benefit ? S.light : S.muted,
                cursor: visibleItems.length === 1 && !item.feature && !item.benefit ? "default" : "pointer",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "inherit",
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      {signUpOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(34, 27, 86, 0.24)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", padding: 24 }}>
          <div style={{ width: "100%", maxWidth: 520, background: "white", border: `1px solid ${S.border}`, borderRadius: 28, boxShadow: "0 28px 64px rgba(83, 74, 183, 0.18)", padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: P[600], textTransform: "uppercase", letterSpacing: "0.08em" }}>Create Account</div>
                <div style={{ marginTop: 10, fontSize: 34, lineHeight: 1.04, fontWeight: 800, letterSpacing: "-0.05em", color: P[900] }}>Sign up for Loop</div>
                <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6, color: S.muted }}>
                  Create your Loop access with the basics you need to log in and start your first product project.
                </div>
              </div>
              <button
                onClick={() => setSignUpOpen(false)}
                style={{ border: "none", background: "transparent", color: S.muted, fontSize: 24, lineHeight: 1, cursor: "pointer", fontFamily: "inherit" }}
                aria-label="Close sign up"
              >
                ×
              </button>
            </div>

            <div style={{ display: "grid", gap: 14, marginTop: 22 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: S.muted, marginBottom: 6 }}>Full name</div>
                <input
                  value={signUpForm.fullName}
                  onChange={e => setSignUpForm(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Mayank Trivedi"
                  style={{ width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 14, border: `1px solid ${S.border}`, background: S.bg, color: S.text, fontSize: 14, outline: "none", fontFamily: "inherit" }}
                />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: S.muted, marginBottom: 6 }}>Work email</div>
                <input
                  value={signUpForm.workEmail}
                  onChange={e => setSignUpForm(prev => ({ ...prev, workEmail: e.target.value }))}
                  placeholder="founder@company.com"
                  style={{ width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 14, border: `1px solid ${S.border}`, background: S.bg, color: S.text, fontSize: 14, outline: "none", fontFamily: "inherit" }}
                />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: S.muted, marginBottom: 6 }}>Company name</div>
                <input
                  value={signUpForm.companyName}
                  onChange={e => setSignUpForm(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Loop AI"
                  style={{ width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 14, border: `1px solid ${S.border}`, background: S.bg, color: S.text, fontSize: 14, outline: "none", fontFamily: "inherit" }}
                />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: S.muted, marginBottom: 6 }}>Password</div>
                <input
                  type="password"
                  value={signUpForm.password}
                  onChange={e => setSignUpForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Create a password"
                  style={{ width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 14, border: `1px solid ${S.border}`, background: S.bg, color: S.text, fontSize: 14, outline: "none", fontFamily: "inherit" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 }}>
              <button
                onClick={() => {
                  setSignUpOpen(false);
                  onLogIn();
                }}
                style={{ border: "none", background: P[600], color: "white", borderRadius: 14, padding: "13px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flex: 1, minWidth: 180 }}
              >
                Create Account
              </button>
              <button
                onClick={() => setSignUpOpen(false)}
                style={{ border: `1px solid ${S.border}`, background: "white", color: S.text, borderRadius: 14, padding: "13px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CompetitiveComparisonTable({ items, onChange }) {
  const rows = items?.length ? items : [
    { category: "Ease of use", ourProduct: "", competitorOne: "", competitorTwo: "" },
    { category: "AI quality", ourProduct: "", competitorOne: "", competitorTwo: "" },
  ];

  const updateRow = (index, key, value) => {
    onChange(rows.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)));
  };

  const addRow = () => {
    onChange([
      ...rows,
      { category: "", ourProduct: "", competitorOne: "", competitorTwo: "" },
    ]);
  };

  const removeRow = index => {
    onChange(rows.filter((_, rowIndex) => rowIndex !== index));
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "none",
    background: "transparent",
    color: S.text,
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{
      background: "linear-gradient(180deg, #F8F7FF 0%, #F1EFFF 100%)",
      border: `1px solid ${S.border}`,
      borderRadius: 14,
      padding: 16,
      minHeight: 320,
      minWidth: 0,
      overflow: "hidden",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: S.text }}>Competitive Comparison</div>
          <div style={{ fontSize: 11, color: S.muted, marginTop: 3 }}>Compare your product against the top 2 competitors across the proof areas that matter most.</div>
        </div>
        <button
          onClick={addRow}
          style={{
            border: "none",
            background: P[600],
            color: "white",
            borderRadius: 10,
            padding: "8px 12px",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          + Add Row
        </button>
      </div>

      <div style={{ border: `1px solid ${S.border}`, borderRadius: 12, overflowX: "auto", background: "white" }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(160px, 0.95fr) minmax(180px, 1fr) minmax(180px, 1fr) minmax(180px, 1fr) 64px", background: P[50], borderBottom: `1px solid ${S.border}` }}>
          <div style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: P[800], textTransform: "uppercase", letterSpacing: "0.06em" }}>Category</div>
          <div style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: P[800], textTransform: "uppercase", letterSpacing: "0.06em" }}>Your Product</div>
          <div style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: P[800], textTransform: "uppercase", letterSpacing: "0.06em" }}>Competitor 1</div>
          <div style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: P[800], textTransform: "uppercase", letterSpacing: "0.06em" }}>Competitor 2</div>
          <div style={{ padding: "10px 12px" }} />
        </div>
        {rows.map((row, index) => (
          <div key={`competitive-row-${index}`} style={{ display: "grid", gridTemplateColumns: "minmax(160px, 0.95fr) minmax(180px, 1fr) minmax(180px, 1fr) minmax(180px, 1fr) 64px", borderBottom: index === rows.length - 1 ? "none" : `1px solid ${S.border}` }}>
            <input
              value={row.category}
              onChange={e => updateRow(index, "category", e.target.value)}
              placeholder="Pricing, onboarding, analytics..."
              style={{ ...inputStyle, borderRight: `1px solid ${S.border}` }}
            />
            <input
              value={row.ourProduct}
              onChange={e => updateRow(index, "ourProduct", e.target.value)}
              placeholder="How you compare"
              style={{ ...inputStyle, borderRight: `1px solid ${S.border}` }}
            />
            <input
              value={row.competitorOne}
              onChange={e => updateRow(index, "competitorOne", e.target.value)}
              placeholder="Top competitor 1"
              style={{ ...inputStyle, borderRight: `1px solid ${S.border}` }}
            />
            <input
              value={row.competitorTwo}
              onChange={e => updateRow(index, "competitorTwo", e.target.value)}
              placeholder="Top competitor 2"
              style={{ ...inputStyle, borderRight: `1px solid ${S.border}` }}
            />
            <button
              onClick={() => removeRow(index)}
              style={{
                border: "none",
                background: "transparent",
                color: P[600],
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TaglineStudio({ tagline, taglineOptions, onTaglineChange, onOptionsChange, prompt }) {
  const [loading, setLoading] = useState(false);

  async function generateOptions() {
    if (!prompt?.trim() || loading) return;
    setLoading(true);
    onOptionsChange(await callClaude(prompt));
    setLoading(false);
  }

  return (
    <div style={{
      background: "linear-gradient(180deg, #F8F7FF 0%, #F1EFFF 100%)",
      border: `1px solid ${S.border}`,
      borderRadius: 14,
      padding: 16,
      minHeight: 220,
      minWidth: 0,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      gap: 14,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: S.text }}>Tagline + Tagline Options</div>
        <button
          onClick={generateOptions}
          disabled={!prompt?.trim() || loading}
          style={{
            border: `1px solid ${P[400]}`,
            background: loading ? P[50] : "white",
            color: P[600],
            borderRadius: 20,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 600,
            cursor: !prompt?.trim() || loading ? "default" : "pointer",
            fontFamily: "inherit",
            opacity: !prompt?.trim() ? 0.45 : 1,
          }}
        >
          {loading ? "..." : "Generate Options"}
        </button>
      </div>

      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: P[800], textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Tagline</div>
        <textarea
          value={tagline}
          onChange={e => onTaglineChange(e.target.value)}
          placeholder="A memorable 3-8 word tagline"
          rows={2}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "10px 12px",
            fontSize: 13,
            fontFamily: "inherit",
            lineHeight: 1.5,
            border: `1px solid ${S.border}`,
            borderRadius: 10,
            background: "white",
            color: S.text,
            resize: "none",
            outline: "none",
          }}
        />
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: P[800], textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Tagline Options</div>
        <textarea
          value={taglineOptions}
          onChange={e => onOptionsChange(e.target.value)}
          placeholder="Generated tagline options will appear here..."
          rows={6}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "10px 12px",
            fontSize: 13,
            fontFamily: "inherit",
            lineHeight: 1.55,
            border: `1px solid ${S.border}`,
            borderRadius: 10,
            background: "white",
            color: S.text,
            resize: "none",
            outline: "none",
            minHeight: 120,
          }}
        />
      </div>
    </div>
  );
}

function WorkspaceTile({ title, layout, onDragStart, onResizeStart, starred = false, onToggleStar, children }) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${layout.x}%`,
        top: layout.y,
        width: `${layout.w}%`,
        height: layout.h,
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      <div style={{
        position: "relative",
        height: "100%",
        background: S.card,
        border: `1px solid ${S.border}`,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 1px 0 rgba(38, 33, 92, 0.03)",
      }}>
        <button
          onClick={onToggleStar}
          title={starred ? `Unstar ${title}` : `Star ${title}`}
          style={{
            position: "absolute",
            top: 10,
            left: 12,
            border: "none",
            background: "transparent",
            color: starred ? "#F59E0B" : S.light,
            cursor: "pointer",
            fontSize: 18,
            lineHeight: 1,
            padding: 4,
            zIndex: 2,
            fontFamily: "inherit",
          }}
        >
          {starred ? "★" : "☆"}
        </button>
        <button
          onPointerDown={onDragStart}
          title={`Drag ${title}`}
          style={{
            position: "absolute",
            top: 10,
            right: 12,
            border: "none",
            background: "transparent",
            color: S.light,
            cursor: "grab",
            fontSize: 18,
            lineHeight: 1,
            padding: 4,
            zIndex: 2,
          }}
        >
          ⋮⋮
        </button>
        <div style={{ height: "100%", overflow: "auto", padding: 0 }}>
          {children}
        </div>
        <button
          onPointerDown={onResizeStart}
          title={`Resize ${title}`}
          style={{
            position: "absolute",
            right: 6,
            bottom: 6,
            width: 18,
            height: 18,
            border: "none",
            background: "transparent",
            cursor: "nwse-resize",
            color: P[400],
            fontSize: 14,
            lineHeight: 1,
            padding: 0,
            zIndex: 2,
          }}
        >
          ◢
        </button>
      </div>
    </div>
  );
}

function WorkspaceCanvas({ compact, layout, setLayout, tiles, tileLimits = {}, minHeight = 720, starredTiles = {}, onToggleStar = null, starContext = "" }) {
  const workspaceRef = useRef(null);
  const interactionRef = useRef(null);

  useEffect(() => {
    if (compact || !layout || !setLayout) return undefined;

    function handlePointerMove(event) {
      const state = interactionRef.current;
      const rect = workspaceRef.current?.getBoundingClientRect();
      if (!state || !rect) return;

      const dx = event.clientX - state.startX;
      const dy = event.clientY - state.startY;
      const deltaXPercent = (dx / rect.width) * 100;

      setLayout(prev => {
        const current = prev[state.id];
        const limits = tileLimits[state.id] || DEFAULT_TILE_LIMITS;
        if (!current) return prev;

        if (state.mode === "drag") {
          const nextX = Math.max(0, Math.min(100 - current.w, state.startLayout.x + deltaXPercent));
          const nextY = Math.max(0, state.startLayout.y + dy);
          return {
            ...prev,
            [state.id]: { ...current, x: nextX, y: nextY },
          };
        }

        const nextW = Math.max(limits.minW, Math.min(100 - state.startLayout.x, state.startLayout.w + deltaXPercent));
        const nextH = Math.max(limits.minH, state.startLayout.h + dy);
        return {
          ...prev,
          [state.id]: { ...current, w: nextW, h: nextH },
        };
      });
    }

    function handlePointerUp() {
      interactionRef.current = null;
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [compact, layout, setLayout, tileLimits]);

  if (compact || !layout || !setLayout) {
    return (
      <div style={{ display: "grid", gap: 14 }}>
        {tiles.map(tile => (
          <div key={tile.id} style={{ position: "relative" }}>
            {onToggleStar && (
              <button
                onClick={() => onToggleStar(`${starContext}:${tile.id}`)}
                title={starredTiles[`${starContext}:${tile.id}`] ? `Unstar ${tile.title}` : `Star ${tile.title}`}
                style={{
                  position: "absolute",
                  top: 10,
                  left: 12,
                  zIndex: 2,
                  border: "none",
                  background: "transparent",
                  color: starredTiles[`${starContext}:${tile.id}`] ? "#F59E0B" : S.light,
                  cursor: "pointer",
                  fontSize: 18,
                  lineHeight: 1,
                  padding: 4,
                  fontFamily: "inherit",
                }}
              >
                {starredTiles[`${starContext}:${tile.id}`] ? "★" : "☆"}
              </button>
            )}
            {tile.render()}
          </div>
        ))}
      </div>
    );
  }

  function startInteraction(id, mode) {
    return event => {
      event.preventDefault();
      interactionRef.current = {
        id,
        mode,
        startX: event.clientX,
        startY: event.clientY,
        startLayout: { ...layout[id] },
      };
    };
  }

  const workspaceHeight = Math.max(...Object.values(layout).map(item => item.y + item.h), minHeight) + 16;

  return (
    <div
      ref={workspaceRef}
      style={{
        position: "relative",
        minHeight: workspaceHeight,
        border: `1px dashed ${P[200]}`,
        borderRadius: 18,
        background: "linear-gradient(180deg, rgba(238, 237, 254, 0.45) 0%, rgba(244, 243, 255, 0.85) 100%)",
        padding: 8,
      }}
    >
      {tiles.map(tile => (
        <WorkspaceTile
          key={tile.id}
          title={tile.title}
          layout={layout[tile.id]}
          starred={!!starredTiles[`${starContext}:${tile.id}`]}
          onToggleStar={onToggleStar ? () => onToggleStar(`${starContext}:${tile.id}`) : undefined}
          onDragStart={startInteraction(tile.id, "drag")}
          onResizeStart={startInteraction(tile.id, "resize")}
        >
          {tile.render(layout[tile.id])}
        </WorkspaceTile>
      ))}
      <div style={{ position: "absolute", right: 14, bottom: 10, fontSize: 11, color: S.muted }}>
        Drag tiles by the dotted handle and resize from the bottom-right corner.
      </div>
    </div>
  );
}

function GenBlock({ label, prompt }) {
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);
  async function go() {
    if (!prompt?.trim() || loading) return;
    setLoading(true);
    setOut(await callClaude(prompt));
    setLoading(false);
  }
  return (
    <div style={{ marginBottom: 16, border: `1px solid ${S.border}`, borderRadius: 10, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 14px", background: P[50] }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: P[800] }}>{label}</span>
        <button onClick={go} disabled={loading || !prompt?.trim()} style={{
          fontSize: 11, padding: "3px 12px", borderRadius: 20,
          border: `1px solid ${P[400]}`, background: "white",
          color: P[600], cursor: "pointer", fontWeight: 500, opacity: !prompt?.trim() ? 0.4 : 1,
        }}>
          {loading ? "Generating..." : "✦ Generate"}
        </button>
      </div>
      {out && <div style={{ padding: "10px 14px", fontSize: 13, lineHeight: 1.6, color: S.text, background: "white", whiteSpace: "pre-wrap" }}>{out}</div>}
    </div>
  );
}

function ProductPanel({ d, set, compact = false, layout, setLayout }) {
  const u = k => v => set(p => ({ ...p, [k]: v }));
  const tiles = [
    {
      id: "problem",
      title: "Core Problem",
      render: tile => <CanvasField label="Core Problem" value={d.problem} onChange={u("problem")} placeholder="Describe the core problem your product solves..." rows={5} minHeight={Math.max(170, (tile?.h || 170) - 34)} accent="linear-gradient(180deg, #F6F4FF 0%, #F0EEFF 100%)" />,
    },
    {
      id: "problemStatement",
      title: "Problem Statement",
      render: tile => <CanvasField label="Problem Statement" value={d.problemStatement} onChange={u("problemStatement")} placeholder="Summarize the problem in one sharp statement..." rows={4} minHeight={Math.max(150, (tile?.h || 150) - 34)} />,
    },
    {
      id: "solution",
      title: "Solution",
      render: tile => <CanvasField label="Solution" value={d.solution} onChange={u("solution")} placeholder="Describe how your product solves the problem..." rows={6} minHeight={Math.max(180, (tile?.h || 180) - 34)} accent="#F8F7FF" />,
    },
    {
      id: "audience",
      title: "Audience (Who Is It For)",
      render: tile => <CanvasField label="Audience (Who Is It For)" value={d.audience} onChange={u("audience")} placeholder="Describe your main target audience..." rows={5} minHeight={Math.max(180, (tile?.h || 180) - 34)} accent="#F3F1FF" />,
    },
    {
      id: "diff",
      title: "Product Differentiation",
      render: tile => <CanvasField label="Product Differentiation" value={d.diff} onChange={u("diff")} placeholder="Define your product's unique advantages..." rows={4} minHeight={Math.max(150, (tile?.h || 150) - 34)} />,
    },
  ];

  return <WorkspaceCanvas compact={compact} layout={layout} setLayout={setLayout} tiles={tiles} minHeight={680} />;
}

function CapabilitiesPanel({ d, set, compact = false, layout, setLayout }) {
  const u = k => v => set(p => ({ ...p, [k]: v }));
  const featureBenefitText = (d.featureBenefits || [])
    .map(item => `${item.feature}: ${item.benefit}`)
    .filter(Boolean)
    .join("; ");
  const tiles = [
    {
      id: "features",
      title: "Core Features",
      render: tile => <CanvasField label="Core Features" value={d.features} onChange={u("features")} placeholder="Write the headline story for your feature set..." rows={4} minHeight={Math.max(150, (tile?.h || 150) - 34)} accent="linear-gradient(180deg, #F6F4FF 0%, #F0EEFF 100%)" />,
    },
    {
      id: "integrations",
      title: "Integrations",
      render: tile => <CanvasField label="Integrations" value={d.integrations} onChange={u("integrations")} placeholder="What does your product connect with?" rows={5} minHeight={Math.max(170, (tile?.h || 170) - 34)} accent="#F8F7FF" />,
    },
    {
      id: "featureBenefits",
      title: "Feature + Benefit",
      render: () => <FeatureBenefitTable items={d.featureBenefits || []} onChange={u("featureBenefits")} />,
    },
    {
      id: "summary",
      title: "Capabilities Summary",
      render: () => <GenBlock label="Capabilities Summary" prompt={d.features || featureBenefitText || d.integrations ? `Write a compelling capabilities summary. Core features: ${d.features}. Feature benefits: ${featureBenefitText}. Integrations: ${d.integrations}. 3-4 sentences.` : ""} />,
    },
  ];

  return <WorkspaceCanvas compact={compact} layout={layout} setLayout={setLayout} tiles={tiles} tileLimits={CAP_TILE_LIMITS} minHeight={720} />;
}

function CompetitivePanel({ d, set, pd, compact = false, layout, setLayout }) {
  const u = k => v => set(p => ({ ...p, [k]: v }));
  const comparisonSummary = (d.comparisonRows || [])
    .map(row => `${row.category}: us ${row.ourProduct}, competitor 1 ${row.competitorOne}, competitor 2 ${row.competitorTwo}`)
    .filter(Boolean)
    .join("; ");
  const tiles = [
    { id: "competitors", title: "Main Competitors", render: tile => <CanvasField label="Main Competitors" value={d.competitors} onChange={u("competitors")} placeholder="Who are your top 2 competitors and why are they relevant?" rows={3} minHeight={Math.max(140, (tile?.h || 140) - 34)} /> },
    { id: "comparison", title: "Competitive Comparison", render: () => <CompetitiveComparisonTable items={d.comparisonRows || []} onChange={u("comparisonRows")} /> },
    { id: "differentiators", title: "Key Differentiators", render: tile => <CanvasField label="Key Differentiators" value={d.differentiators} onChange={u("differentiators")} placeholder="What 3-5 things make your product meaningfully different?" rows={5} minHeight={Math.max(160, (tile?.h || 160) - 34)} accent="#F8F7FF" /> },
    { id: "proofPoints", title: "Proof Points", render: tile => <CanvasField label="Proof Points" value={d.proofPoints} onChange={u("proofPoints")} placeholder="Customer evidence, outcomes, benchmarks, or examples that back up your claims..." rows={4} minHeight={Math.max(150, (tile?.h || 150) - 34)} /> },
    { id: "battleCard", title: "Battle Card", render: () => <GenBlock label="Battle Card" prompt={d.competitors || d.differentiators || comparisonSummary ? `Create a sales battle card. Product problem: "${pd.problem}". Competitors: ${d.competitors}. Key differentiators: ${d.differentiators}. Proof points: ${d.proofPoints}. Competitive comparison: ${comparisonSummary}. Include win themes, objection handling, and when not to compete.` : ""} /> },
  ];
  return <WorkspaceCanvas compact={compact} layout={layout} setLayout={setLayout} tiles={tiles} minHeight={580} />;
}

function ProductTruthPanel({ pd, setPd, cap, setCap, comp, setComp, compact = false, layout, setLayout }) {
  const updatePd = key => value => setPd(prev => ({ ...prev, [key]: value }));
  const updateCap = key => value => setCap(prev => ({ ...prev, [key]: value }));
  const updateComp = key => value => setComp(prev => ({ ...prev, [key]: value }));
  const featureBenefitText = (cap.featureBenefits || [])
    .map(item => `${item.feature}: ${item.benefit}`)
    .filter(Boolean)
    .join("; ");
  const comparisonSummary = (comp.comparisonRows || [])
    .map(row => `${row.category}: us ${row.ourProduct}, competitor 1 ${row.competitorOne}, competitor 2 ${row.competitorTwo}`)
    .filter(Boolean)
    .join("; ");

  const tiles = [
    {
      id: "problem",
      title: "Core Problem",
      render: tile => <CanvasField label="Core Problem" value={pd.problem} onChange={updatePd("problem")} placeholder="Describe the core problem your product solves..." rows={5} minHeight={Math.max(160, (tile?.h || 160) - 34)} accent="linear-gradient(180deg, #F6F4FF 0%, #F0EEFF 100%)" />,
    },
    {
      id: "problemStatement",
      title: "Problem Statement",
      render: tile => <CanvasField label="Problem Statement" value={pd.problemStatement} onChange={updatePd("problemStatement")} placeholder="Summarize the problem in one sharp statement..." rows={4} minHeight={Math.max(140, (tile?.h || 140) - 34)} />,
    },
    {
      id: "solution",
      title: "Solution",
      render: tile => <CanvasField label="Solution" value={pd.solution} onChange={updatePd("solution")} placeholder="Describe how your product solves the problem..." rows={6} minHeight={Math.max(180, (tile?.h || 180) - 34)} accent="#F8F7FF" />,
    },
    {
      id: "audience",
      title: "Audience",
      render: tile => <CanvasField label="Audience (Who Is It For)" value={pd.audience} onChange={updatePd("audience")} placeholder="Describe your main target audience..." rows={5} minHeight={Math.max(150, (tile?.h || 150) - 34)} accent="#F3F1FF" />,
    },
    {
      id: "diff",
      title: "Product Differentiation",
      render: tile => <CanvasField label="Product Differentiation" value={pd.diff} onChange={updatePd("diff")} placeholder="Define your product's unique advantages..." rows={5} minHeight={Math.max(150, (tile?.h || 150) - 34)} />,
    },
    {
      id: "features",
      title: "Core Features",
      render: tile => <CanvasField label="Core Features" value={cap.features} onChange={updateCap("features")} placeholder="Write the headline story for your feature set..." rows={4} minHeight={Math.max(140, (tile?.h || 140) - 34)} accent="linear-gradient(180deg, #F6F4FF 0%, #F0EEFF 100%)" />,
    },
    {
      id: "featureBenefits",
      title: "Feature + Benefit",
      render: () => <FeatureBenefitTable items={cap.featureBenefits || []} onChange={updateCap("featureBenefits")} />,
    },
    {
      id: "competitors",
      title: "Main Competitors",
      render: tile => <CanvasField label="Main Competitors" value={comp.competitors} onChange={updateComp("competitors")} placeholder="Who are your top competitors and why are they relevant?" rows={4} minHeight={Math.max(130, (tile?.h || 130) - 34)} accent="#F8F7FF" />,
    },
    {
      id: "comparison",
      title: "Competitive Comparison",
      render: () => <CompetitiveComparisonTable items={comp.comparisonRows || []} onChange={updateComp("comparisonRows")} />,
    },
    {
      id: "differentiators",
      title: "Key Differentiators",
      render: tile => <CanvasField label="Key Differentiators" value={comp.differentiators} onChange={updateComp("differentiators")} placeholder="What 3-5 things make your product meaningfully different?" rows={5} minHeight={Math.max(160, (tile?.h || 160) - 34)} accent="#F8F7FF" />,
    },
    {
      id: "proofPoints",
      title: "Proof Points",
      render: tile => <CanvasField label="Proof Points" value={comp.proofPoints} onChange={updateComp("proofPoints")} placeholder="Customer evidence, outcomes, benchmarks, or examples that back up your claims..." rows={4} minHeight={Math.max(150, (tile?.h || 150) - 34)} />,
    },
    {
      id: "integrations",
      title: "Integrations",
      render: tile => <CanvasField label="Integrations" value={cap.integrations} onChange={updateCap("integrations")} placeholder="What does your product connect with?" rows={4} minHeight={Math.max(130, (tile?.h || 130) - 34)} accent="#F8F7FF" />,
    },
    {
      id: "summary",
      title: "Capabilities Summary",
      render: () => <GenBlock label="Capabilities Summary" prompt={cap.features || featureBenefitText || cap.integrations ? `Write a compelling capabilities summary. Core features: ${cap.features}. Feature benefits: ${featureBenefitText}. Integrations: ${cap.integrations}. 3-4 sentences.` : ""} />,
    },
    {
      id: "battleCard",
      title: "Battle Card",
      render: () => <GenBlock label="Battle Card" prompt={comp.competitors || comp.differentiators || comparisonSummary ? `Create a sales battle card. Product problem: "${pd.problem}". Competitors: ${comp.competitors}. Key differentiators: ${comp.differentiators}. Proof points: ${comp.proofPoints}. Competitive comparison: ${comparisonSummary}. Include win themes, objection handling, and when not to compete.` : ""} />,
    },
  ];

  return <WorkspaceCanvas compact={compact} layout={layout} setLayout={setLayout} tiles={tiles} tileLimits={PRODUCT_TRUTH_TILE_LIMITS} minHeight={1720} />;
}

function ProductTruthOverviewPanel({ pd, cap, comp }) {
  const sections = [
    ["Product Overview", pd.category || pd.whatItDoes || "Define the category, product role, and who it serves."],
    ["Problem Statement", pd.problem || "Clarify the problem, stakes, and why current alternatives fail."],
    ["Solution", pd.solution || "Describe the solution and how it resolves the core problem."],
    ["Audience", pd.audience || "Identify the primary audience and what they need."],
    ["Differentiation", pd.diff || comp.differentiators || "Capture why this product wins versus alternatives."],
    ["Capabilities", cap.features || "Document the product capabilities and supporting features."],
    ["Competitive Comparison", comp.competitors || "Compare against competitors with evidence and proof."],
  ];

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ border: `1px dashed ${P[200]}`, borderRadius: 22, background: "linear-gradient(180deg, rgba(238, 237, 254, 0.45) 0%, rgba(244, 243, 255, 0.82) 100%)", padding: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>Product Truth</div>
        <div style={{ marginTop: 8, fontSize: 28, fontWeight: 800, color: P[900], letterSpacing: "-0.04em" }}>Build your product truth one section at a time</div>
        <div style={{ marginTop: 12, maxWidth: 760, fontSize: 14, lineHeight: 1.7, color: S.muted }}>
          Use the nested sections on the left to define the product, problem, solution, audience, capabilities, and competitive context. Each section is a focused canvas workspace so founders and small teams can think clearly without losing the fun, flexible board feel.
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {sections.map(([title, text]) => (
          <div key={title} style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 18, padding: 18, minHeight: 138, boxShadow: "0 10px 28px rgba(38, 33, 92, 0.04)" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</div>
            <div style={{ marginTop: 10, fontSize: 13, lineHeight: 1.65, color: S.muted }}>{text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SmartInput({
  label,
  fieldKey,
  aiValue,
  value,
  onChange,
  placeholder,
  rows = 4,
  helper,
  treatment = "draft",
  insightBullets = [],
}) {
  const hasAi = !!String(aiValue || "").trim();
  const hasUserValue = !!String(value || "").trim();
  const displayValue = hasUserValue ? value : (aiValue || value || "");
  const isAiStyled = treatment === "draft" && hasAi && !hasUserValue && displayValue === aiValue;
  const treatmentMeta = {
    draft: { label: "AI draft", bg: "#ECE9FF", color: P[700] },
    bullets: { label: "Bullet context", bg: "#EDF6FF", color: "#3670C9" },
    ghost: { label: "Ghost prompt", bg: "#F8F7FF", color: "#7B78B5" },
  }[treatment] || { label: "", bg: "#ECE9FF", color: P[700] };
  const sharedStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    borderRadius: 14,
    border: `1px solid ${isAiStyled ? P[200] : S.border}`,
    background: isAiStyled ? "linear-gradient(180deg, rgba(248,247,255,0.95) 0%, rgba(255,255,255,1) 100%)" : "white",
    color: isAiStyled ? "#867EC9" : S.text,
    outline: "none",
    fontFamily: "inherit",
    fontSize: 14,
    lineHeight: 1.65,
    fontStyle: isAiStyled ? "italic" : "normal",
    boxShadow: isAiStyled ? "inset 0 0 0 1px rgba(175,169,236,0.28)" : "none",
  };

  return (
    <label style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
        {treatment === "draft" && hasAi && (
          <span title={`AI draft available for ${fieldKey}`} style={{ fontSize: 12, fontWeight: 700, color: P[600] }}>
            ✨ AI draft
          </span>
        )}
      </div>
      {treatment !== "draft" && (
        <div
          style={{
            justifySelf: "start",
            fontSize: 12,
            fontWeight: 800,
            color: treatmentMeta.color,
            background: treatmentMeta.bg,
            borderRadius: 999,
            padding: "6px 10px",
          }}
        >
          {treatmentMeta.label}
        </div>
      )}
      {treatment === "bullets" && !hasUserValue && insightBullets.length > 0 && (
        <div style={{ display: "grid", gap: 8, padding: "12px 14px", borderRadius: 14, border: `1px solid ${S.border}`, background: "#FBFCFF" }}>
          {insightBullets.map((bullet, index) => (
            <div key={`${fieldKey}-bullet-${index}`} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ width: 8, height: 8, borderRadius: 999, background: "#5B51D8", marginTop: 7, flex: "0 0 auto" }} />
              <div style={{ fontSize: 13, lineHeight: 1.6, color: S.muted }}>{bullet}</div>
            </div>
          ))}
        </div>
      )}
      {rows > 1 ? (
        <textarea
          value={displayValue}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          style={{ ...sharedStyle, resize: "vertical", minHeight: rows * 28 }}
        />
      ) : (
        <input
          value={displayValue}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={sharedStyle}
        />
      )}
      {helper && <div style={{ fontSize: 12, lineHeight: 1.55, color: S.muted }}>{helper}</div>}
    </label>
  );
}

function SimplifiedSectionCard({ title, description, children, improveMode = false, onEnhance, enhancing = false }) {
  return (
    <div style={{
      background: "white",
      border: `1px solid ${improveMode ? P[200] : S.border}`,
      borderRadius: 22,
      padding: 22,
      boxShadow: improveMode ? "0 12px 28px rgba(83, 74, 183, 0.08)" : "0 10px 24px rgba(38, 33, 92, 0.04)",
      display: "grid",
      gap: 16,
      position: "relative",
      overflow: "hidden",
    }}>
      {improveMode && <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(180deg, rgba(238,237,254,0.2) 0%, rgba(255,255,255,0) 24%)" }} />}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, position: "relative" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: P[900], letterSpacing: "-0.03em" }}>{title}</div>
          <div style={{ marginTop: 8, maxWidth: 720, fontSize: 14, lineHeight: 1.65, color: S.muted }}>{description}</div>
        </div>
        {improveMode && (
          <button
            onClick={onEnhance}
            disabled={enhancing}
            style={{
              border: "none",
              background: enhancing ? P[100] : P[600],
              color: enhancing ? P[700] : "white",
              borderRadius: 12,
              padding: "11px 14px",
              fontSize: 13,
              fontWeight: 800,
              cursor: enhancing ? "wait" : "pointer",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
            }}
          >
            {enhancing ? "Enhancing..." : "Enhance"}
          </button>
        )}
      </div>
      <div style={{ display: "grid", gap: 14, position: "relative" }}>{children}</div>
    </div>
  );
}

function BuildNarrativeWorkspacePanel({
  section,
  pd,
  pos,
  msg,
  strat,
  aiDraft,
  userEdits,
  improveMode,
  enhancingSection,
  onEnhanceSection,
  onFieldChange,
}) {
  const derivedProblem = aiDraft.productTruth.problem || pd.problem || pd.problemStatement || "";
  const derivedSolution = aiDraft.productTruth.solution || pd.solution || pd.solutionMechanism || "";
  const derivedAudience = aiDraft.productTruth.icp || pd.audience || strat.icp || "";
  const derivedPositioning = aiDraft.narrative.positioning || pos.statement || "";
  const derivedValueProposition = aiDraft.narrative.valueProposition || pos.valueProp || "";
  const derivedMessaging = aiDraft.narrative.messaging || normalizeDraftText(aiDraft.narrative.topMessages) || msg.pillars || "";
  const derivedHeadline = aiDraft.assets.headline || msg.headline || "";
  const derivedElevator = aiDraft.assets.elevatorPitch || msg.elevator || "";
  const derivedGtmStrategy = aiDraft.gtm.strategy || strat.goal || "";
  const derivedChannels = aiDraft.gtm.channels || strat.channels || "";
  const derivedLaunchStrategy = aiDraft.gtm.launchApproach || strat.hooks || "";
  const toGuidanceBullets = text => String(text || "")
    .split(/[\n.]/)
    .map(line => line.replace(/^[-*•\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 3);
  const solutionBullets = toGuidanceBullets(derivedSolution);
  const audienceBullets = toGuidanceBullets(derivedAudience);

  const helperCopy = improveMode ? {
    productTruth: {
      overview: "Summarize what the product does in plain language and what category it belongs to.",
      problem: "Describe the core customer pain and what breaks if the problem stays unresolved.",
      solution: "Explain how the product solves the problem in plain English.",
      icp: "Describe the ideal customer by company type, team, role, and urgency.",
      differentiation: "Explain what feels uniquely valuable or meaningfully different about the product.",
    },
    narrative: {
      positioning: "Make the positioning specific to the audience, category, and differentiated benefit.",
      valueProposition: "State the clearest buyer outcome or business value this product delivers.",
      messaging: "Keep messaging concise, repeatable, and easy for sales or founders to say out loud.",
      headline: "Write the one-line message a buyer should understand on first read.",
      elevator: "Turn the core story into a short spoken explanation a PMM or founder can say out loud.",
    },
    gtm: {
      strategy: "Describe the launch goal and how this product should enter the market first.",
      channels: "Focus on the channels that realistically matter for the first launch motion.",
      launchStrategy: "Describe how the launch should be sequenced or executed at a practical level.",
    },
  } : {};

  const workspaceSuggestions = {
    productTruth: [
      { type: "section", icon: "◎", title: "Problem Statement", description: "Sharpen the core problem into a tighter statement for the team." },
      { type: "section", icon: "⊙", title: "Audience Fit", description: "Clarify who feels this problem most and why it matters now." },
      { type: "asset", icon: "▣", title: "One-Page Product Summary", description: "Generate a concise internal product summary for alignment." },
      { type: "asset", icon: "▤", title: "Problem Brief", description: "Generate a short founder-ready brief built from the problem and solution." },
    ],
    narrative: [
      { type: "section", icon: "◔", title: "Category Design", description: "Extend the narrative into clearer category framing." },
      { type: "section", icon: "◫", title: "Objection Handling", description: "Pressure-test the messaging against likely buyer objections." },
      { type: "asset", icon: "!", title: "Homepage Hero Copy", description: "Generate homepage-ready hero copy from the current narrative." },
      { type: "asset", icon: "✉", title: "Launch Messaging Pack", description: "Generate website, email, and sales copy starters from this story." },
    ],
    gtm: [
      { type: "section", icon: "▶", title: "Launch Narrative", description: "Translate the GTM plan into a stronger launch story." },
      { type: "section", icon: "◔", title: "Pricing Narrative", description: "Define how value and pricing should be framed in market." },
      { type: "asset", icon: "✉", title: "Launch Brief", description: "Generate a launch brief to align marketing, PMM, and sales." },
      { type: "asset", icon: "▣", title: "Campaign Brief", description: "Generate a campaign-ready brief from the GTM strategy and channels." },
    ],
  };

  if (section === "productTruth") {
    return (
      <>
        <SimplifiedSectionCard
          title="Product Truth"
          description="Use one strong AI draft for momentum, then shape the rest with guidance so the canvas feels strategic instead of fully pre-written."
          improveMode={improveMode}
          enhancing={enhancingSection === "productTruth"}
          onEnhance={() => onEnhanceSection("productTruth")}
        >
          <SmartInput
            label="Product Overview"
            fieldKey="productTruth.overview"
            aiValue=""
            userEdited={!!userEdits["productTruth.overview"]}
            value={pd.whatItDoes || ""}
            onChange={value => onFieldChange("productTruth.overview", value)}
            rows={3}
            placeholder="Describe what the product does, what category it belongs to, and who it serves."
            helper={helperCopy.productTruth?.overview}
            treatment="ghost"
          />
          <SmartInput
            label="Problem"
            fieldKey="productTruth.problem"
            aiValue={derivedProblem}
            userEdited={!!userEdits["productTruth.problem"]}
            value={pd.problem}
            onChange={value => onFieldChange("productTruth.problem", value)}
            rows={5}
            helper={helperCopy.productTruth?.problem}
            treatment="draft"
          />
          <SmartInput
            label="Solution"
            fieldKey="productTruth.solution"
            aiValue=""
            userEdited={!!userEdits["productTruth.solution"]}
            value={pd.solution || ""}
            onChange={value => onFieldChange("productTruth.solution", value)}
            rows={4}
            placeholder="Turn the guidance into a clear explanation of how the product solves the problem."
            helper={helperCopy.productTruth?.solution}
            treatment="bullets"
            insightBullets={solutionBullets}
          />
          <SmartInput
            label="Primary Audience"
            fieldKey="productTruth.icp"
            aiValue=""
            userEdited={!!userEdits["productTruth.icp"]}
            value={pd.audience}
            onChange={value => onFieldChange("productTruth.icp", value)}
            rows={3}
            placeholder="Describe who feels this problem most, what triggers urgency, and why they are the best early audience."
            helper={helperCopy.productTruth?.icp}
            treatment="bullets"
            insightBullets={audienceBullets}
          />
          <SmartInput
            label="Differentiation"
            fieldKey="productTruth.differentiation"
            aiValue=""
            userEdited={!!userEdits["productTruth.differentiation"]}
            value={pd.diff || ""}
            onChange={value => onFieldChange("productTruth.differentiation", value)}
            rows={3}
            placeholder="Explain why this product is meaningfully different and what makes it stand out."
            helper={helperCopy.productTruth?.differentiation}
            treatment="ghost"
          />
        </SimplifiedSectionCard>
        <SectionSuggestionsPanel
          title="AI-Suggested Sections for PMMs"
          subtitle="Turn Product Truth into alignment-ready assets and sharper follow-on sections."
          suggestions={workspaceSuggestions.productTruth}
        />
      </>
    );
  }

  if (section === "narrative") {
    return (
      <>
        <SimplifiedSectionCard
          title="Core Narrative"
          description="Refine the positioning and messaging until the story is clear enough to repeat across launch materials."
          improveMode={improveMode}
          enhancing={enhancingSection === "narrative"}
          onEnhance={() => onEnhanceSection("narrative")}
        >
          <SmartInput
            label="Positioning"
            fieldKey="narrative.positioning"
            aiValue={derivedPositioning}
            userEdited={!!userEdits["narrative.positioning"]}
            value={pos.statement}
            onChange={value => onFieldChange("narrative.positioning", value)}
            rows={5}
            helper={helperCopy.narrative?.positioning}
          />
          <SmartInput
            label="Value Proposition"
            fieldKey="narrative.valueProposition"
            aiValue={derivedValueProposition}
            userEdited={!!userEdits["narrative.valueProposition"]}
            value={pos.valueProp || ""}
            onChange={value => onFieldChange("narrative.valueProposition", value)}
            rows={4}
            helper={helperCopy.narrative?.valueProposition}
          />
          <SmartInput
            label="Messaging"
            fieldKey="narrative.messaging"
            aiValue={derivedMessaging}
            userEdited={!!userEdits["narrative.messaging"]}
            value={msg.pillars}
            onChange={value => onFieldChange("narrative.messaging", value)}
            rows={5}
            helper={helperCopy.narrative?.messaging}
          />
          <SmartInput
            label="Headline Message"
            fieldKey="narrative.headline"
            aiValue={derivedHeadline}
            userEdited={!!userEdits["narrative.headline"]}
            value={msg.headline || ""}
            onChange={value => onFieldChange("narrative.headline", value)}
            rows={3}
            placeholder="Write the one-line message you want buyers to remember first."
            helper={helperCopy.narrative?.headline}
          />
          <SmartInput
            label="Elevator Pitch"
            fieldKey="narrative.elevator"
            aiValue={derivedElevator}
            userEdited={!!userEdits["narrative.elevator"]}
            value={msg.elevator || ""}
            onChange={value => onFieldChange("narrative.elevator", value)}
            rows={4}
            placeholder="Turn the story into a short, spoken explanation a founder or PMM can use live."
            helper={helperCopy.narrative?.elevator}
          />
        </SimplifiedSectionCard>
        <SectionSuggestionsPanel
          title="AI-Suggested Sections for PMMs"
          subtitle="Generate launch-ready assets directly from the live narrative you’re shaping."
          suggestions={workspaceSuggestions.narrative}
        />
      </>
    );
  }

  return (
    <>
      <SimplifiedSectionCard
        title="GTM"
        description="Use the draft as a starting point for a focused go-to-market motion. Keep this light and execution-ready."
        improveMode={improveMode}
        enhancing={enhancingSection === "gtm"}
        onEnhance={() => onEnhanceSection("gtm")}
      >
        <SmartInput
          label="GTM Strategy"
          fieldKey="gtm.strategy"
          aiValue={derivedGtmStrategy}
          userEdited={!!userEdits["gtm.strategy"]}
          value={strat.goal || ""}
          onChange={value => onFieldChange("gtm.strategy", value)}
          rows={4}
          helper={helperCopy.gtm?.strategy}
        />
        <SmartInput
          label="Key Channels"
          fieldKey="gtm.channels"
          aiValue={derivedChannels}
          userEdited={!!userEdits["gtm.channels"]}
          value={strat.channels}
          onChange={value => onFieldChange("gtm.channels", value)}
          rows={4}
          helper={helperCopy.gtm?.channels}
        />
        <SmartInput
          label="Launch Strategy"
          fieldKey="gtm.launchStrategy"
          aiValue={derivedLaunchStrategy}
          userEdited={!!userEdits["gtm.launchStrategy"]}
          value={strat.hooks || ""}
          onChange={value => onFieldChange("gtm.launchStrategy", value)}
          rows={4}
          placeholder="Describe the launch approach, sequencing, and execution plan for this first motion."
          helper={helperCopy.gtm?.launchStrategy}
        />
      </SimplifiedSectionCard>
      <SectionSuggestionsPanel
        title="AI-Suggested Sections for PMMs"
        subtitle="Generate GTM assets and briefs directly from the strategy you’re building."
        suggestions={workspaceSuggestions.gtm}
      />
    </>
  );
}

function NarrativeGeneratingOverlay({ productName }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "linear-gradient(180deg, rgba(248,247,255,0.97) 0%, rgba(244,243,255,0.99) 100%)",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <style>{`
        @keyframes loopSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes loopPulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.08); opacity: 1; }
        }
      `}</style>
      <div
        style={{
          width: "min(520px, 100%)",
          background: "white",
          border: `1px solid ${S.border}`,
          borderRadius: 28,
          padding: "34px 30px",
          boxShadow: "0 26px 60px rgba(83, 74, 183, 0.12)",
          display: "grid",
          justifyItems: "center",
          gap: 18,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 78,
            height: 78,
            borderRadius: 24,
            background: "linear-gradient(135deg, #534AB7 0%, #8A80F1 100%)",
            color: "white",
            display: "grid",
            placeItems: "center",
            fontSize: 28,
            fontWeight: 900,
            boxShadow: "0 18px 34px rgba(83, 74, 183, 0.26)",
            animation: "loopPulse 1.8s ease-in-out infinite",
          }}
        >
          L
        </div>
        <div
          style={{
            width: 118,
            height: 118,
            borderRadius: 999,
            border: `3px solid ${P[100]}`,
            borderTopColor: P[600],
            animation: "loopSpin 1.2s linear infinite",
            position: "absolute",
            pointerEvents: "none",
          }}
        />
        <div style={{ fontSize: 32, fontWeight: 800, color: P[900], letterSpacing: "-0.04em" }}>
          Generating Narrative
        </div>
        <div style={{ maxWidth: 420, fontSize: 15, lineHeight: 1.7, color: S.muted }}>
          {productName
            ? `Loop is building a first draft for ${productName}. We’re creating context, product truth, narrative, and GTM before opening the workspace.`
            : "Loop is building your first draft. We’re creating context, product truth, narrative, and GTM before opening the workspace."}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          {["Context", "Product Truth", "Core Narrative", "GTM", "Assets"].map(step => (
            <span
              key={step}
              style={{
                padding: "8px 12px",
                borderRadius: 999,
                background: P[50],
                color: P[700],
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {step}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function AiContextReviewPage({
  productName,
  context,
  isLoading,
  onUpdateContext,
  onBack,
  onConfirm,
}) {
  const contextRows = [
    ["Product Category", "productCategory", "What category best describes this product?"],
    ["Target Audience", "targetAudience", "Who is this primarily for?"],
    ["Core Use Case", "coreUseCase", "What does this product help someone do?"],
    ["Market Type", "marketType", "What kind of market or buying motion does this fit?"],
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #FBFAFF 0%, #F4F3FF 100%)", padding: "54px 24px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto", display: "grid", gap: 20 }}>
        <div style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 28, padding: "28px 30px", boxShadow: "0 18px 40px rgba(83, 74, 183, 0.08)" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: P[600], textTransform: "uppercase", letterSpacing: "0.08em" }}>AI Context Review</div>
          <div style={{ marginTop: 10, fontSize: 38, fontWeight: 800, color: P[900], letterSpacing: "-0.05em" }}>
            Confirm the product context before Loop drafts the narrative
          </div>
          <div style={{ marginTop: 12, maxWidth: 760, fontSize: 15, lineHeight: 1.7, color: S.muted }}>
            {productName
              ? `Loop has interpreted the product information for ${productName}. Confirm or correct the context below so Product Truth, Core Narrative, and GTM are drafted from the right starting point.`
              : "Loop has interpreted the product information. Confirm or correct the context below so Product Truth, Core Narrative, and GTM are drafted from the right starting point."}
          </div>
        </div>

        <div style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 24, padding: 24, boxShadow: "0 14px 34px rgba(83, 74, 183, 0.06)" }}>
          {isLoading ? (
            <div style={{ minHeight: 340, display: "grid", placeItems: "center" }}>
              <div style={{ display: "grid", justifyItems: "center", gap: 16, textAlign: "center" }}>
                <div style={{ width: 74, height: 74, borderRadius: 22, background: "linear-gradient(135deg, #534AB7 0%, #8A80F1 100%)", color: "white", display: "grid", placeItems: "center", fontSize: 26, fontWeight: 900, boxShadow: "0 18px 34px rgba(83, 74, 183, 0.24)" }}>L</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: P[900], letterSpacing: "-0.04em" }}>Understanding your product</div>
                <div style={{ maxWidth: 520, fontSize: 14, lineHeight: 1.7, color: S.muted }}>
                  Loop is generating context first so the rest of the narrative is based on the right audience, use case, and market interpretation.
                </div>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
                {contextRows.map(([label, key, placeholder]) => (
                  <label key={key} style={{ display: "grid", gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
                    <textarea
                      value={context?.[key] || ""}
                      onChange={e => onUpdateContext(key, e.target.value)}
                      placeholder={placeholder}
                      rows={key === "coreUseCase" ? 4 : 3}
                      style={{ width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 14, border: `1px solid ${S.border}`, background: S.bg, color: S.text, outline: "none", fontFamily: "inherit", resize: "vertical", lineHeight: 1.65 }}
                    />
                  </label>
                ))}
              </div>

              <label style={{ display: "grid", gap: 8, marginTop: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.06em" }}>AI Assumptions</span>
                <textarea
                  value={Array.isArray(context?.assumptions) ? context.assumptions.join("\n") : ""}
                  onChange={e => onUpdateContext("assumptions", e.target.value.split("\n").map(item => item.trim()).filter(Boolean))}
                  placeholder="Assumption: ..."
                  rows={5}
                  style={{ width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 14, border: `1px solid ${S.border}`, background: S.bg, color: S.text, outline: "none", fontFamily: "inherit", resize: "vertical", lineHeight: 1.65 }}
                />
              </label>
            </>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={onBack}
            style={{ border: `1px solid ${S.border}`, background: "white", color: S.text, borderRadius: 14, padding: "14px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
          >
            Back to Product Info
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            style={{ border: "none", background: P[600], color: "white", borderRadius: 14, padding: "14px 20px", fontSize: 14, fontWeight: 800, cursor: isLoading ? "default" : "pointer", opacity: isLoading ? 0.6 : 1, fontFamily: "inherit" }}
          >
            Looks Right, Continue
          </button>
        </div>
      </div>
    </div>
  );
}

function AddSectionPanel() {
  const premiumSections = [
    { name: "Proof Points", note: "Add evidence, outcomes, and credibility signals to strengthen product claims." },
    { name: "Integrations", note: "Capture integration context and why ecosystem fit matters." },
    { name: "Competitive Comparison", note: "Unlock side-by-side comparison boards for sharper market positioning." },
  ];

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ borderRadius: 24, padding: "24px 24px 22px", background: "linear-gradient(135deg, #F8F6FF 0%, #F1EEFF 100%)", border: `1px solid ${S.border}`, boxShadow: "0 16px 34px rgba(83, 74, 183, 0.08)" }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>Add Section</div>
        <div style={{ marginTop: 8, fontSize: 28, fontWeight: 800, color: P[900], letterSpacing: "-0.04em" }}>Expand Product Truth with premium sections</div>
        <div style={{ marginTop: 12, maxWidth: 760, fontSize: 14, lineHeight: 1.7, color: S.muted }}>
          Keep the core Product Truth flow focused for early-stage teams, then unlock deeper strategic sections as your product story matures.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
        {premiumSections.map(section => (
          <div key={section.name} style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 20, padding: 18, minHeight: 190, display: "grid", alignContent: "space-between", boxShadow: "0 10px 28px rgba(38, 33, 92, 0.04)" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 999, background: P[50], color: P[700], fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Upgrade
              </div>
              <div style={{ marginTop: 14, fontSize: 18, fontWeight: 700, color: P[900] }}>{section.name}</div>
              <div style={{ marginTop: 10, fontSize: 13, lineHeight: 1.65, color: S.muted }}>{section.note}</div>
            </div>
            <button style={{ marginTop: 18, border: "none", background: P[600], color: "white", borderRadius: 12, padding: "12px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Upgrade to Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function NarrativeAddSectionPanel() {
  const premiumSections = [
    { name: "Story", note: "Add customer story, origin story, and launch story arc workspaces to sharpen narrative resonance." },
    { name: "Tagline Studio", note: "Unlock dedicated tagline exploration and option generation for tighter brand expression." },
    { name: "Message Testing", note: "Add structured message testing and objection-handling sections to pressure-test the narrative." },
  ];

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ borderRadius: 24, padding: "24px 24px 22px", background: "linear-gradient(135deg, #F8F6FF 0%, #F1EEFF 100%)", border: `1px solid ${S.border}`, boxShadow: "0 16px 34px rgba(83, 74, 183, 0.08)" }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>Add Section</div>
        <div style={{ marginTop: 8, fontSize: 28, fontWeight: 800, color: P[900], letterSpacing: "-0.04em" }}>Expand Narrative with premium sections</div>
        <div style={{ marginTop: 12, maxWidth: 760, fontSize: 14, lineHeight: 1.7, color: S.muted }}>
          Keep the core narrative workflow simple for early teams, then unlock deeper storytelling and message-testing sections as the product matures.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
        {premiumSections.map(section => (
          <div key={section.name} style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 20, padding: 18, minHeight: 190, display: "grid", alignContent: "space-between", boxShadow: "0 10px 28px rgba(38, 33, 92, 0.04)" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 999, background: P[50], color: P[700], fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Upgrade
              </div>
              <div style={{ marginTop: 14, fontSize: 18, fontWeight: 700, color: P[900] }}>{section.name}</div>
              <div style={{ marginTop: 10, fontSize: 13, lineHeight: 1.65, color: S.muted }}>{section.note}</div>
            </div>
            <button style={{ marginTop: 18, border: "none", background: P[600], color: "white", borderRadius: 12, padding: "12px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Upgrade to Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function NarrativeOverviewPanel({ pos, msg, aud }) {
  const sections = [
    ["Positioning Statement", pos.statement || "Define the positioning statement that anchors the narrative."],
    ["Value Proposition", pos.valueProp || "Summarize the strongest value this product delivers."],
    ["Headline Message", msg.headline || "Capture the headline message customers should remember."],
    ["Messaging Pillars", msg.pillars || "Turn the story into a few repeatable message themes."],
    ["Elevator Pitch", msg.elevator || "Shape the 30-second narrative your team can actually say."],
    ["Primary Persona", aud.primary || "Clarify the main buyer persona and what they care about."],
  ];

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ border: `1px dashed ${P[200]}`, borderRadius: 22, background: "linear-gradient(180deg, rgba(238, 237, 254, 0.45) 0%, rgba(244, 243, 255, 0.82) 100%)", padding: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>Narrative</div>
        <div style={{ marginTop: 8, fontSize: 28, fontWeight: 800, color: P[900], letterSpacing: "-0.04em" }}>Shape the story one section at a time</div>
        <div style={{ marginTop: 12, maxWidth: 760, fontSize: 14, lineHeight: 1.7, color: S.muted }}>
          Use the nested sections on the left to define positioning, messaging, and audience understanding in focused canvas workspaces. This keeps the narrative sharp without overwhelming early teams.
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {sections.map(([title, text]) => (
          <div key={title} style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 18, padding: 18, minHeight: 138, boxShadow: "0 10px 28px rgba(38, 33, 92, 0.04)" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</div>
            <div style={{ marginTop: 10, fontSize: 13, lineHeight: 1.65, color: S.muted }}>{text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompetitionOverviewPanel({ comp }) {
  const sections = [
    ["Competition Overview", comp.competitors || "List the main competitors and status-quo alternatives buyers compare you against."],
    ["Comparison", comp.alternativeGaps || "Capture where alternatives fall short and where your product wins."],
    ["Sales Intelligence", comp.winLose || "Summarize the sales-ready talk track, objections, and competitive angles."],
  ];

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ border: `1px dashed ${P[200]}`, borderRadius: 22, background: "linear-gradient(180deg, rgba(238, 237, 254, 0.45) 0%, rgba(244, 243, 255, 0.82) 100%)", padding: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>Competition</div>
        <div style={{ marginTop: 8, fontSize: 28, fontWeight: 800, color: P[900], letterSpacing: "-0.04em" }}>Pressure-test your market story against real alternatives</div>
        <div style={{ marginTop: 12, maxWidth: 760, fontSize: 14, lineHeight: 1.7, color: S.muted }}>
          Keep competition separate from product truth so positioning, sales, and GTM teams can sharpen the story around what buyers compare you against in the market.
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {sections.map(([title, text]) => (
          <div key={title} style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 18, padding: 18, minHeight: 138, boxShadow: "0 10px 28px rgba(38, 33, 92, 0.04)" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</div>
            <div style={{ marginTop: 10, fontSize: 13, lineHeight: 1.65, color: S.muted }}>{text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompetitionComparisonPanel({ comp, setComp, compact = false, layout, setLayout, starredTiles = {}, onToggleStar, starContext = "" }) {
  const updateField = key => value => setComp(prev => ({ ...prev, [key]: value }));
  const rowsText = (comp.comparisonRows || []).map(row => `${row.category}: Loop(${row.ourProduct || "-"}) / Competitor A(${row.competitorOne || "-"}) / Competitor B(${row.competitorTwo || "-"})`).join("\n");
  const tiles = [
    {
      id: "comparison",
      title: "Feature Comparison",
      render: tile => <CanvasField label="Feature Comparison" value={rowsText} onChange={updateField("comparisonText")} placeholder="Compare the main strengths and weaknesses against alternatives..." rows={7} minHeight={Math.max(210, (tile?.h || 210) - 34)} />,
    },
    {
      id: "whyWeWin",
      title: "Why We Win",
      render: tile => <CanvasField label="Why We Win" value={comp.alternativeGaps} onChange={updateField("alternativeGaps")} placeholder="Where do alternatives fall short, and why does your product win?" rows={6} minHeight={Math.max(190, (tile?.h || 190) - 34)} accent="#F8F7FF" />,
    },
  ];

  return (
    <>
      <WorkspaceCanvas compact={compact} layout={layout} setLayout={setLayout} tiles={tiles} minHeight={420} starredTiles={starredTiles} onToggleStar={onToggleStar} starContext={starContext} />
      <SectionSuggestionsPanel
        subtitle="Useful next moves once the competitive framing is clear."
        suggestions={[
          { type: "section", icon: "⚔", title: "Competitive Battlecard", description: "Turn the comparison into clear sales-ready win themes and landmines." },
          { type: "asset", icon: "▣", title: "Comparison Snapshot", description: "Generate a concise comparison sheet for founders, PMM, and sales." },
        ]}
      />
    </>
  );
}

function CompetitionSalesPanel({ comp, setComp, compact = false, layout, setLayout, starredTiles = {}, onToggleStar, starContext = "" }) {
  const updateField = key => value => setComp(prev => ({ ...prev, [key]: value }));
  const tiles = [
    {
      id: "battleCard",
      title: "Competitive Battlecard",
      render: tile => <CanvasField label="Competitive Battlecard" value={comp.differentiators} onChange={updateField("differentiators")} placeholder="What should sales repeat when buyers compare alternatives?" rows={6} minHeight={Math.max(190, (tile?.h || 190) - 34)} />,
    },
    {
      id: "objections",
      title: "Objection Handling",
      render: tile => <CanvasField label="Objection Handling" value={comp.winLose} onChange={updateField("winLose")} placeholder="Capture common objections, risk areas, and the best competitive response." rows={6} minHeight={Math.max(190, (tile?.h || 190) - 34)} accent="#F8F7FF" />,
    },
  ];

  return (
    <>
      <WorkspaceCanvas compact={compact} layout={layout} setLayout={setLayout} tiles={tiles} minHeight={420} starredTiles={starredTiles} onToggleStar={onToggleStar} starContext={starContext} />
      <SectionSuggestionsPanel
        subtitle="Helpful competitive assets once sales angles are in place."
        suggestions={[
          { type: "asset", icon: "✉", title: "Sales Talk Track", description: "Generate a concise talk track based on the battlecard and objections." },
          { type: "asset", icon: "▤", title: "Competitive FAQ", description: "Create a fast internal FAQ for objections and comparison questions." },
        ]}
      />
    </>
  );
}

function ProjectReviewCenter({
  reviewState,
  reviewTeams,
  reviewSections,
  reviewRouting,
  assignedSections,
  sectionReviews,
  reviewInsights,
  confidenceScore,
  reviewAnalytics,
  pmmActionQueue,
  onAssignTeam,
  onUpdateScore,
  onUpdateComment,
  onChooseImprove,
  onChooseApprove,
  onSubmitFeedback,
  onSendReview,
  feedbackCount,
  compactView = false,
}) {
  const [expandedSectionId, setExpandedSectionId] = useState("");
  const reviewerTeams = reviewTeams.length ? reviewTeams : REVIEW_TEAMS;
  const sharedShellStyle = {
    borderRadius: 28,
    border: `1px solid ${S.border}`,
    background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(246,244,255,0.96) 100%)",
    boxShadow: "0 22px 48px rgba(38, 33, 92, 0.06)",
    padding: 18,
    display: "grid",
    gap: 18,
  };
  const allSections = reviewSections.map(section => {
    const assignedTeam = REVIEW_TEAMS.find(team => (reviewRouting.assignments?.[team] || []).includes(section.id)) || section.suggestedTeam;
    return {
      sectionId: section.id,
      sectionName: section.label,
      content: section.content,
      workspace: section.workspace,
      workspaceLabel: normalizeResourceCategoryLabel(section.workspace),
      reviewerTeam: assignedTeam,
      suggestedTeam: section.suggestedTeam,
    };
  });
  const currentExpandedSectionId = allSections.some(section => section.sectionId === expandedSectionId)
    ? expandedSectionId
    : allSections[0]?.sectionId || "";
  const summary = summarizeSectionReviewState(sectionReviews, {
    assignments: Object.fromEntries(
      reviewerTeams.map(team => [team, assignedSections.filter(section => section.reviewerTeam === team).map(section => section.sectionId)])
    ),
  });
  const gridTemplate = compactView
    ? "minmax(0, 1.7fr) minmax(0, 0.9fr) minmax(0, 0.95fr) repeat(4, minmax(0, 0.72fr)) minmax(0, 0.72fr) minmax(0, 0.9fr)"
    : "minmax(240px, 1.5fr) minmax(120px, 0.8fr) minmax(110px, 0.8fr) repeat(4, minmax(84px, 0.55fr)) minmax(96px, 0.65fr) minmax(120px, 0.8fr)";
  const boardMinWidth = compactView ? "auto" : 1120;

  return (
    <div style={sharedShellStyle}>
      <div style={{ borderRadius: 24, border: `1px solid ${S.border}`, background: "linear-gradient(180deg, rgba(255,255,255,0.99) 0%, rgba(245,243,255,0.96) 100%)", padding: 22 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>Internal Feedback</div>
        <div style={{ marginTop: 8, fontSize: 28, fontWeight: 800, color: P[900], letterSpacing: "-0.04em" }}>Review every narrative section in one sleek operating board</div>
        <div style={{ marginTop: 10, maxWidth: 820, fontSize: 14, lineHeight: 1.7, color: S.muted }}>
          Internal Feedback now mirrors the Assets dashboard style. Every section from Product, Narrative, and GTM shows up in one contained board with ownership, scoring, approvals, and AI review support.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        {[
          { label: "Review Status", value: reviewState, note: "Overall review state across the routed sections." },
          { label: "Assigned Teams", value: reviewerTeams.join(", ") || "None", note: "Review owners are still tracked per row, even though the board stays unified." },
          { label: "Sections Routed", value: String(summary.totalCount), note: "How many sections are currently in the review package." },
          { label: "Confidence Score", value: `${confidenceScore}/100`, note: "Weighted narrative confidence calculated from submitted section reviews." },
        ].map(card => (
          <div key={card.label} style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 18, padding: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>{card.label}</div>
            <div style={{ marginTop: 10, fontSize: 24, fontWeight: 800, color: P[900] }}>{card.value}</div>
            <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6, color: S.muted }}>{card.note}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 24, overflow: "hidden" }}>
        <div style={{ padding: 18, borderBottom: `1px solid ${S.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Unified Review Grid
            </span>
            <span style={{ padding: "6px 10px", borderRadius: 999, background: "#FFF7E8", color: "#C77812", fontSize: 12, fontWeight: 800 }}>
              Resources gets a notification badge when review is sent or received
            </span>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={onSendReview}
              style={{ border: `1px solid ${S.border}`, background: "white", color: P[700], borderRadius: 12, padding: "11px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
            >
              Send Review
            </button>
            <button
              onClick={onSubmitFeedback}
              style={{ border: "none", background: P[600], color: "white", borderRadius: 12, padding: "11px 16px", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}
            >
              Submit Feedback
            </button>
          </div>
        </div>

        <div style={{ padding: 18, background: "linear-gradient(180deg, #FCFBFF 0%, #F7F5FF 100%)" }}>
          <div style={{ borderRadius: 20, border: `1px solid ${S.border}`, background: "rgba(255,255,255,0.78)", padding: 14, display: "grid", gap: 14 }}>
            <div style={{ overflowX: "auto", paddingBottom: 2 }}>
              <div style={{ minWidth: boardMinWidth, display: "grid", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: gridTemplate, gap: compactView ? 8 : 12, padding: "0 10px", fontSize: compactView ? 11 : 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  <div>Section</div>
                  <div>Category</div>
                  <div>Team</div>
                  <div>Clarity</div>
                  <div>Relevance</div>
                  <div>Differentiation</div>
                  <div>Value</div>
                  <div>Overall</div>
                  <div>Status</div>
                </div>

                {allSections.length === 0 && (
                  <div style={{ padding: "18px 16px", borderRadius: 16, background: S.bg, border: `1px solid ${S.border}`, fontSize: 14, lineHeight: 1.65, color: S.muted }}>
                    No sections are available for review yet. Generate a draft first, then use this Review Center to send and manage review in one place.
                  </div>
                )}

                {allSections.map(section => {
                  const review = sectionReviews[section.sectionId] || makeDefaultSectionReview(section, section.reviewerTeam);
                  const isExpanded = currentExpandedSectionId === section.sectionId;
                  const statusLabel = review.status === "approved" ? "Approved" : "In Review";
                  const overallScore = Number((
                    (Number(review.scores.clarity || 0) +
                      Number(review.scores.relevance || 0) +
                      Number(review.scores.differentiation || 0) +
                      Number(review.scores.value || 0)) / 4
                  ).toFixed(1));
                  const suggestionForSection = (reviewInsights.suggestions || []).find(item => item.section === section.sectionName);
                  return (
                    <div key={section.sectionId} style={{ borderRadius: 18, border: `1px solid ${S.border}`, overflow: "hidden", background: "white", boxShadow: "0 10px 24px rgba(38, 33, 92, 0.04)" }}>
                      <div style={{ display: "grid", gridTemplateColumns: gridTemplate, gap: compactView ? 8 : 12, alignItems: "center", padding: compactView ? "14px 14px" : "16px 18px" }}>
                        <button
                          onClick={() => setExpandedSectionId(prev => (prev === section.sectionId ? "" : section.sectionId))}
                          style={{ textAlign: "left", border: "none", background: "transparent", padding: 0, cursor: "pointer", fontFamily: "inherit" }}
                        >
                          <div style={{ fontSize: compactView ? 13 : 15, fontWeight: 800, color: S.text, lineHeight: 1.3 }}>{section.sectionName}</div>
                          <div style={{ marginTop: 4, fontSize: compactView ? 11 : 12, color: S.muted, lineHeight: 1.45 }}>Expand for content, review notes, and decision</div>
                        </button>
                        <div style={{ justifySelf: "start", padding: compactView ? "8px 10px" : "9px 12px", borderRadius: 999, border: `1px solid ${S.border}`, background: "#F7F4FF", fontSize: compactView ? 11 : 12, fontWeight: 800, color: P[700], whiteSpace: compactView ? "normal" : "nowrap" }}>
                          {section.workspaceLabel}
                        </div>
                        <div>
                          <select
                            value={section.reviewerTeam}
                            onChange={event => onAssignTeam(section.sectionId, event.target.value)}
                            style={{
                              width: "100%",
                              padding: compactView ? "8px 8px" : "9px 10px",
                              borderRadius: 12,
                              border: `1px solid ${S.border}`,
                              background: "white",
                              fontSize: compactView ? 11 : 12,
                              color: S.text,
                              fontFamily: "inherit",
                            }}
                          >
                            {REVIEW_TEAMS.map(team => <option key={team} value={team}>{team}</option>)}
                          </select>
                        </div>
                        {["clarity", "relevance", "differentiation", "value"].map(parameter => (
                          <div key={parameter} style={{ justifySelf: "stretch", minWidth: 0, padding: compactView ? "9px 8px" : "10px 12px", borderRadius: 999, border: `1px solid ${S.border}`, background: "#FBFAFF", fontSize: compactView ? 12 : 13, fontWeight: 700, color: S.text, textAlign: compactView ? "center" : "left" }}>
                            {review.scores[parameter] || 0}
                          </div>
                        ))}
                        <div style={{ justifySelf: "stretch", minWidth: 0, padding: compactView ? "9px 8px" : "10px 12px", borderRadius: 999, border: `1px solid ${S.border}`, background: "#F7F4FF", fontSize: compactView ? 12 : 13, fontWeight: 800, color: S.text, textAlign: compactView ? "center" : "left" }}>
                          {overallScore || 0}
                        </div>
                        <div style={{ justifySelf: "stretch", minWidth: 0, padding: compactView ? "9px 8px" : "10px 12px", borderRadius: 999, background: review.status === "approved" ? "#ECFFF3" : "#FFF7E8", color: review.status === "approved" ? "#177A51" : "#AE7B10", fontSize: compactView ? 11 : 12, fontWeight: 800, textAlign: "center" }}>
                          {statusLabel}
                        </div>
                      </div>

                      {isExpanded && (
                        <div style={{ borderTop: `1px solid ${S.border}`, padding: 18, background: "#FCFBFF", display: "grid", gap: 14 }}>
                          <div style={{ display: "grid", gap: 8 }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>Section Content</div>
                            <div style={{ padding: "14px 16px", borderRadius: 16, border: `1px solid ${S.border}`, background: "white", fontSize: 14, lineHeight: 1.7, color: S.text }}>
                              {section.content || "No content has been created for this section yet. The review row is still visible so teams can track ownership and readiness across the full narrative."}
                            </div>
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10 }}>
                            {[
                              ["clarity", "Clarity"],
                              ["relevance", "Relevance"],
                              ["differentiation", "Differentiation"],
                              ["value", "Value"],
                            ].map(([parameter, label]) => (
                              <label key={parameter} style={{ display: "grid", gap: 8 }}>
                                <span style={{ fontSize: 11, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
                                <select
                                  value={review.scores[parameter] || ""}
                                  onChange={event => onUpdateScore(section.sectionId, parameter, event.target.value)}
                                  style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    padding: "12px 14px",
                                    borderRadius: 14,
                                    border: `1px solid ${S.border}`,
                                    background: "white",
                                    fontSize: 14,
                                    color: S.text,
                                    outline: "none",
                                    fontFamily: "inherit",
                                  }}
                                >
                                  <option value="">Select score</option>
                                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(scoreOption => (
                                    <option key={scoreOption} value={scoreOption}>{scoreOption}</option>
                                  ))}
                                </select>
                              </label>
                            ))}
                          </div>

                          <div style={{ display: "grid", gap: 8 }}>
                            {suggestionForSection && (
                              <div style={{ padding: "12px 14px", borderRadius: 14, background: "#F7F4FF", border: `1px solid ${S.border}` }}>
                                <div style={{ fontSize: 11, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>Suggested Improvement</div>
                                <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.6, color: S.text }}>
                                  {suggestionForSection.action} Impact: {suggestionForSection.impact}
                                </div>
                              </div>
                            )}
                            <div style={{ fontSize: 11, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>Suggest Improvement / Comment</div>
                            <textarea
                              value={review.comment}
                              onChange={event => onUpdateComment(section.sectionId, event.target.value)}
                              rows={5}
                              placeholder={`What should ${section.reviewerTeam} change, approve, or pressure-test in this section?`}
                              style={{
                                width: "100%",
                                boxSizing: "border-box",
                                padding: "14px 16px",
                                borderRadius: 16,
                                border: `1px solid ${S.border}`,
                                background: "white",
                                fontSize: 14,
                                color: S.text,
                                lineHeight: 1.65,
                                outline: "none",
                                resize: "vertical",
                                fontFamily: "inherit",
                              }}
                            />
                          </div>

                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <button
                              onClick={() => onChooseImprove(section.sectionId)}
                              style={{
                                border: `1px solid ${review.decision === "improve" ? P[200] : S.border}`,
                                background: review.decision === "improve" ? P[50] : "white",
                                color: review.decision === "improve" ? P[700] : S.text,
                                borderRadius: 12,
                                padding: "11px 16px",
                                fontSize: 13,
                                fontWeight: 700,
                                cursor: "pointer",
                                fontFamily: "inherit",
                              }}
                            >
                              Improve
                            </button>
                            <button
                              onClick={() => onChooseApprove(section.sectionId)}
                              style={{
                                border: `1px solid ${review.status === "approved" ? "#BFE8CF" : S.border}`,
                                background: review.status === "approved" ? "#ECFFF3" : "white",
                                color: review.status === "approved" ? "#177A51" : S.text,
                                borderRadius: 12,
                                padding: "11px 16px",
                                fontSize: 13,
                                fontWeight: 700,
                                cursor: "pointer",
                                fontFamily: "inherit",
                              }}
                            >
                              Approve
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 360px)", gap: 16 }}>
        <div style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 20, padding: 18, display: "grid", gap: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>Top Issues</div>
          {(reviewInsights.topIssues || []).length === 0 && (
            <div style={{ fontSize: 13, lineHeight: 1.65, color: S.muted }}>Submit feedback to see AI-ranked review issues across the routed sections.</div>
          )}
          {(reviewInsights.topIssues || []).map(issue => (
            <div key={issue} style={{ padding: "12px 14px", borderRadius: 14, background: "#FFF8F8", border: `1px solid ${S.border}`, fontSize: 13, lineHeight: 1.6, color: S.text }}>
              {issue}
            </div>
          ))}
          {(reviewInsights.crossSectionPatterns || []).length > 0 && (
            <>
              <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>Cross-Section Patterns</div>
              {(reviewInsights.crossSectionPatterns || []).map(pattern => (
                <div key={pattern} style={{ fontSize: 13, lineHeight: 1.6, color: S.muted }}>
                  {pattern}
                </div>
              ))}
            </>
          )}
        </div>

        <div style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 20, padding: 18, display: "grid", gap: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>Narrative Intelligence</div>
          <div style={{ padding: "14px 16px", borderRadius: 16, background: "#F7F4FF", border: `1px solid ${S.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Weakest Parameter</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: P[900] }}>{reviewInsights.weakestParameter || "Not enough data yet"}</div>
          </div>
          <div style={{ padding: "14px 16px", borderRadius: 16, background: "#F4FAFF", border: `1px solid ${S.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#1F6FEB", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Strongest Parameter</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: P[900] }}>{reviewInsights.strongestParameter || "Not enough data yet"}</div>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>AI Suggestions</div>
            {(reviewInsights.suggestions || []).length === 0 && (
              <div style={{ fontSize: 13, lineHeight: 1.65, color: S.muted }}>AI suggestions appear here after submitted review records are normalized and aggregated.</div>
            )}
            {(reviewInsights.suggestions || []).map((suggestion, index) => (
              <div key={`${suggestion.action}-${index}`} style={{ padding: "12px 14px", borderRadius: 14, background: "#FBFAFF", border: `1px solid ${S.border}` }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: S.text }}>{suggestion.action}</div>
                <div style={{ marginTop: 4, fontSize: 12, lineHeight: 1.55, color: S.muted }}>
                  Update: {suggestion.section} · Impact: {suggestion.impact}
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, lineHeight: 1.65, color: S.muted }}>
            Saved feedback entries: {feedbackCount}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 16 }}>
        <div style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 20, padding: 18, display: "grid", gap: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>PMM Action Queue</div>
          {pmmActionQueue.length === 0 && (
            <div style={{ fontSize: 13, lineHeight: 1.65, color: S.muted }}>No open PMM follow-up items yet. Sections marked Improve will appear here automatically.</div>
          )}
          {pmmActionQueue.map(item => (
            <div key={item.id} style={{ padding: "12px 14px", borderRadius: 14, background: "#FBFAFF", border: `1px solid ${S.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: S.text }}>{item.sectionName}</div>
              <div style={{ marginTop: 4, fontSize: 12, color: P[700], fontWeight: 700 }}>{item.workspace} · Owner: {item.owner}</div>
              <div style={{ marginTop: 6, fontSize: 12, lineHeight: 1.6, color: S.muted }}>{item.reason}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 20, padding: 18, display: "grid", gap: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>Review Analytics</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10 }}>
            {[
              ["Approved", reviewAnalytics.totals.approved],
              ["Improve", reviewAnalytics.totals.improve],
              ["Pending", reviewAnalytics.totals.pending],
              ["Routed", reviewAnalytics.totals.routed],
            ].map(([label, value]) => (
              <div key={label} style={{ padding: "12px 10px", borderRadius: 14, background: "#FBFAFF", border: `1px solid ${S.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
                <div style={{ marginTop: 6, fontSize: 22, fontWeight: 800, color: S.text }}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10 }}>
            {[
              ["Clarity", reviewAnalytics.scores.clarity],
              ["Relevance", reviewAnalytics.scores.relevance],
              ["Differentiation", reviewAnalytics.scores.differentiation],
              ["Value", reviewAnalytics.scores.value],
            ].map(([label, value]) => (
              <div key={label} style={{ padding: "12px 10px", borderRadius: 14, background: "#F7F4FF", border: `1px solid ${S.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
                <div style={{ marginTop: 6, fontSize: 18, fontWeight: 800, color: S.text }}>{value || 0}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {reviewAnalytics.byTeam.map(item => (
              <div key={item.team} style={{ padding: "10px 12px", borderRadius: 999, background: "#F7F4FF", border: `1px solid ${S.border}`, fontSize: 12, fontWeight: 700, color: S.text }}>
                {item.team}: {item.count}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, lineHeight: 1.65, color: S.muted }}>
            Email notifications are sent when review is submitted. In Loop, Resources gets a badge when review is sent or received.
          </div>
        </div>
      </div>
    </div>
  );
}

function SingleNarrativeSectionPanel({ compact = false, layout, setLayout, tile, minHeight = 360, suggestions = [], starredTiles = {}, onToggleStar, starContext = "" }) {
  return (
    <>
      <WorkspaceCanvas compact={compact} layout={layout} setLayout={setLayout} tiles={[tile]} minHeight={minHeight} starredTiles={starredTiles} onToggleStar={onToggleStar} starContext={starContext} />
      <SectionSuggestionsPanel
        title="AI-Suggested Sections for PMMs"
        subtitle="Relevant narrative add-ons and generated assets for this section."
        suggestions={suggestions}
      />
    </>
  );
}

function SectionSuggestionsPanel({ title = "AI-Suggested Sections", subtitle, suggestions = [] }) {
  const { onGenerateAssetSuggestion } = useContext(WorkspaceAssetActionContext);
  const [generatingTitle, setGeneratingTitle] = useState("");
  if (!suggestions.length) return null;

  return (
    <div style={{ marginTop: 18, borderRadius: 22, padding: 18, border: `1px dashed ${P[200]}`, background: "linear-gradient(180deg, rgba(248, 246, 255, 0.92) 0%, rgba(241, 238, 255, 0.8) 100%)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
        <div style={{ width: 38, height: 38, borderRadius: 14, background: P[600], color: "white", display: "grid", placeItems: "center", fontSize: 16, fontWeight: 800 }}>✦</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: P[900] }}>{title}</div>
          <div style={{ marginTop: 2, fontSize: 12, color: S.muted }}>{subtitle || "Suggested next sections and assets for this workspace."}</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        {suggestions.map(suggestion => (
          <div key={`${suggestion.type}-${suggestion.title}`} style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 16, padding: 16, minHeight: 138, boxShadow: "0 10px 26px rgba(38, 33, 92, 0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
              <div style={{ fontSize: 18, lineHeight: 1 }}>{suggestion.icon || "+"}</div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 9px", borderRadius: 999, background: suggestion.type === "asset" ? "#EEF8FF" : P[50], color: suggestion.type === "asset" ? "#1D4ED8" : P[700], fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                {suggestion.type === "asset" ? "Generate Asset" : "Add Section"}
              </span>
            </div>
            <div style={{ marginTop: 14, fontSize: 18, fontWeight: 700, color: P[900], lineHeight: 1.2 }}>+ {suggestion.title}</div>
            <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.55, color: S.muted }}>{suggestion.description}</div>
            {suggestion.type === "asset" && onGenerateAssetSuggestion && (
              <button
                onClick={async () => {
                  if (generatingTitle === suggestion.title) return;
                  setGeneratingTitle(suggestion.title);
                  try {
                    await onGenerateAssetSuggestion(suggestion);
                  } finally {
                    setGeneratingTitle("");
                  }
                }}
                style={{ marginTop: 14, border: `1px solid ${S.border}`, background: generatingTitle === suggestion.title ? "#F3F1FF" : "white", color: P[700], borderRadius: 12, padding: "10px 12px", fontSize: 12, fontWeight: 800, cursor: generatingTitle === suggestion.title ? "wait" : "pointer", fontFamily: "inherit" }}
              >
                {generatingTitle === suggestion.title ? "Generating..." : "Generate Asset"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductOverviewSectionPanel({ d, set, compact = false, layout, setLayout, starredTiles = {}, onToggleStar, starContext = "" }) {
  const u = k => v => set(prev => ({ ...prev, [k]: v }));
  const tiles = [
    { id: "category", title: "Product Category", render: tile => <CanvasField label="Product Category" value={d.category} onChange={u("category")} placeholder="What category does this product belong to?" rows={4} minHeight={Math.max(150, (tile?.h || 150) - 34)} accent="#F8F7FF" /> },
    { id: "doesWhat", title: "What The Product Does", render: tile => <CanvasField label="What The Product Does" value={d.whatItDoes} onChange={u("whatItDoes")} placeholder="What does the product actually help customers do?" rows={5} minHeight={Math.max(180, (tile?.h || 180) - 34)} /> },
    { id: "builtFor", title: "Who It's Built For", render: tile => <CanvasField label="Who It's Built For" value={d.builtFor} onChange={u("builtFor")} placeholder="Who is this product designed for at a high level?" rows={4} minHeight={Math.max(150, (tile?.h || 150) - 34)} accent="#F3F1FF" /> },
  ];
  return (
    <>
      <WorkspaceCanvas compact={compact} layout={layout} setLayout={setLayout} tiles={tiles} minHeight={420} starredTiles={starredTiles} onToggleStar={onToggleStar} starContext={starContext} />
      <SectionSuggestionsPanel
        subtitle="AI ideas to deepen product framing from the overview."
        suggestions={[
          { type: "section", icon: "◔", title: "Category Design", description: "Define or refine the market category this product should lead in." },
          { type: "section", icon: "◎", title: "Problem Statement", description: "Turn the overview into a sharper customer problem definition." },
          { type: "asset", icon: "▣", title: "One-Page Product Summary", description: "Generate a concise internal product summary for alignment." },
        ]}
      />
    </>
  );
}

function ProblemStatementSectionPanel({ d, set, compact = false, layout, setLayout, starredTiles = {}, onToggleStar, starContext = "" }) {
  const u = k => v => set(prev => ({ ...prev, [k]: v }));
  const tiles = [
    { id: "coreProblem", title: "Core Problem", render: tile => <CanvasField label="Core Problem" value={d.problem} onChange={u("problem")} placeholder="Describe the core problem your product solves..." rows={5} minHeight={Math.max(180, (tile?.h || 180) - 34)} accent="linear-gradient(180deg, #F6F4FF 0%, #F0EEFF 100%)" /> },
    { id: "impact", title: "Impact / Stakes", render: tile => <CanvasField label="Impact / Stakes" value={d.problemImpact} onChange={u("problemImpact")} placeholder="What happens if this problem isn't solved? Quantify where possible..." rows={5} minHeight={Math.max(170, (tile?.h || 170) - 34)} /> },
    { id: "currentGaps", title: "Current Solutions & Their Gaps", render: tile => <CanvasField label="Current Solutions & Their Gaps" value={d.currentSolutionGaps} onChange={u("currentSolutionGaps")} placeholder="How do people solve this today, and why is that insufficient?" rows={5} minHeight={Math.max(170, (tile?.h || 170) - 34)} accent="#F8F7FF" /> },
  ];
  return (
    <>
      <WorkspaceCanvas compact={compact} layout={layout} setLayout={setLayout} tiles={tiles} minHeight={460} starredTiles={starredTiles} onToggleStar={onToggleStar} starContext={starContext} />
      <SectionSuggestionsPanel
        subtitle="Helpful next moves once the problem is clear."
        suggestions={[
          { type: "section", icon: "◎", title: "Solution Section", description: "Map the solution directly to the problem and stakes you defined." },
          { type: "section", icon: "◌", title: "Audience Section", description: "Identify who feels this problem most urgently and why." },
          { type: "asset", icon: "▤", title: "Problem Brief", description: "Generate a short founder-ready problem brief for internal alignment." },
        ]}
      />
    </>
  );
}

function SolutionSectionPanel({ d, set, compact = false, layout, setLayout, starredTiles = {}, onToggleStar, starContext = "" }) {
  const u = k => v => set(prev => ({ ...prev, [k]: v }));
  const tiles = [
    { id: "solutionSummary", title: "Solution Summary", render: tile => <CanvasField label="Solution Summary" value={d.solution} onChange={u("solution")} placeholder="Describe the solution at a high level..." rows={5} minHeight={Math.max(180, (tile?.h || 180) - 34)} /> },
    { id: "howItWorks", title: "How It Solves The Problem", render: tile => <CanvasField label="How It Solves The Problem" value={d.solutionMechanism} onChange={u("solutionMechanism")} placeholder="How does the product solve the problem in practice?" rows={5} minHeight={Math.max(170, (tile?.h || 170) - 34)} accent="#F8F7FF" /> },
    { id: "whyNow", title: "Why Now", render: tile => <CanvasField label="Why Now" value={d.whyNow} onChange={u("whyNow")} placeholder="Why is this the right moment for this solution to matter?" rows={4} minHeight={Math.max(150, (tile?.h || 150) - 34)} accent="#F3F1FF" /> },
  ];
  return (
    <>
      <WorkspaceCanvas compact={compact} layout={layout} setLayout={setLayout} tiles={tiles} minHeight={430} starredTiles={starredTiles} onToggleStar={onToggleStar} starContext={starContext} />
      <SectionSuggestionsPanel
        subtitle="Suggestions to connect the solution to market understanding."
        suggestions={[
          { type: "section", icon: "⊙", title: "Audience Fit", description: "Clarify which audience segments benefit most from this solution." },
          { type: "section", icon: "✦", title: "Differentiation", description: "Explain why this solution is better than current alternatives." },
          { type: "asset", icon: "▣", title: "Solution One-Pager", description: "Generate a crisp summary for founders, advisors, or early teammates." },
        ]}
      />
    </>
  );
}

function AudienceTruthPanel({ pd, setPd, aud, setAud, compact = false, layout, setLayout, starredTiles = {}, onToggleStar, starContext = "" }) {
  const updatePd = key => value => setPd(prev => ({ ...prev, [key]: value }));
  const updateAud = key => value => setAud(prev => ({ ...prev, [key]: value }));
  const tiles = [
    { id: "primaryAudience", title: "Primary Audience", render: tile => <CanvasField label="Primary Audience" value={pd.audience} onChange={updatePd("audience")} placeholder="Who is the main audience for this product?" rows={5} minHeight={Math.max(170, (tile?.h || 170) - 34)} /> },
    { id: "secondaryAudience", title: "Secondary Audience", render: tile => <CanvasField label="Secondary Audience" value={aud.secondary} onChange={updateAud("secondary")} placeholder="Who influences or supports the buying decision?" rows={4} minHeight={Math.max(150, (tile?.h || 150) - 34)} accent="#F8F7FF" /> },
    { id: "painGoals", title: "Pain Points & Goals", render: tile => <CanvasField label="Pain Points & Goals" value={aud.primary} onChange={updateAud("primary")} placeholder="What pain points and goals matter most to this audience?" rows={6} minHeight={Math.max(180, (tile?.h || 180) - 34)} accent="#F3F1FF" /> },
  ];
  return (
    <>
      <WorkspaceCanvas compact={compact} layout={layout} setLayout={setLayout} tiles={tiles} minHeight={450} starredTiles={starredTiles} onToggleStar={onToggleStar} starContext={starContext} />
      <SectionSuggestionsPanel
        subtitle="Audience-specific expansions that help sharpen positioning."
        suggestions={[
          { type: "section", icon: "◈", title: "Positioning", description: "Turn audience pain points into a more targeted positioning statement." },
          { type: "section", icon: "▦", title: "Messaging Pillars", description: "Build messages that match what this audience actually cares about." },
          { type: "asset", icon: "✉", title: "Persona Snapshot", description: "Generate a customer snapshot for founders, sales, or advisors." },
        ]}
      />
    </>
  );
}

function DifferentiationTruthPanel({ pd, setPd, comp, setComp, compact = false, layout, setLayout, starredTiles = {}, onToggleStar, starContext = "" }) {
  const updatePd = key => value => setPd(prev => ({ ...prev, [key]: value }));
  const updateComp = key => value => setComp(prev => ({ ...prev, [key]: value }));
  const tiles = [
    { id: "whyWeWin", title: "Why We Win", render: tile => <CanvasField label="Why We Win" value={pd.diff} onChange={updatePd("diff")} placeholder="Why does this product win in the market?" rows={5} minHeight={Math.max(170, (tile?.h || 170) - 34)} /> },
    { id: "keyDiffs", title: "Key Differentiators", render: tile => <CanvasField label="Key Differentiators" value={comp.differentiators} onChange={updateComp("differentiators")} placeholder="What 3-5 things make this meaningfully different?" rows={5} minHeight={Math.max(180, (tile?.h || 180) - 34)} accent="#F8F7FF" /> },
    { id: "altShortfalls", title: "Why Alternatives Fall Short", render: tile => <CanvasField label="Why Alternatives Fall Short" value={comp.alternativeGaps} onChange={updateComp("alternativeGaps")} placeholder="Why are current alternatives or competitors insufficient?" rows={5} minHeight={Math.max(170, (tile?.h || 170) - 34)} accent="#F3F1FF" /> },
  ];
  return (
    <>
      <WorkspaceCanvas compact={compact} layout={layout} setLayout={setLayout} tiles={tiles} minHeight={450} starredTiles={starredTiles} onToggleStar={onToggleStar} starContext={starContext} />
      <SectionSuggestionsPanel
        subtitle="Useful next sections and assets once your differentiation is taking shape."
        suggestions={[
          { type: "section", icon: "◌", title: "Competitors", description: "Capture who you are really up against and where you win or lose." },
          { type: "section", icon: "⊟", title: "Competitive Comparison", description: "Add a side-by-side comparison table for head-to-head positioning." },
          { type: "asset", icon: "⚔", title: "Competitive Battlecard", description: "Generate a simple battlecard for founder-led sales conversations." },
        ]}
      />
    </>
  );
}

function FeaturesTruthPanel({ d, set, compact = false, layout, setLayout, starredTiles = {}, onToggleStar, starContext = "" }) {
  const u = k => v => set(prev => ({ ...prev, [k]: v }));
  const tiles = [
    { id: "topFeatures", title: "Top Features", render: tile => <CanvasField label="Top Features" value={d.features} onChange={u("features")} placeholder="What are the core features users should care about most?" rows={5} minHeight={Math.max(180, (tile?.h || 180) - 34)} /> },
    { id: "featurePriorities", title: "Feature Priorities", render: tile => <CanvasField label="Feature Priorities" value={d.featurePriorities} onChange={u("featurePriorities")} placeholder="Which features matter most right now, and why?" rows={5} minHeight={Math.max(170, (tile?.h || 170) - 34)} accent="#F8F7FF" /> },
  ];
  return (
    <>
      <WorkspaceCanvas compact={compact} layout={layout} setLayout={setLayout} tiles={tiles} minHeight={390} starredTiles={starredTiles} onToggleStar={onToggleStar} starContext={starContext} />
      <SectionSuggestionsPanel
        subtitle="Turn feature detail into clearer product truth."
        suggestions={[
          { type: "section", icon: "≡", title: "Capabilities", description: "Translate features into benefit-led capability framing." },
          { type: "section", icon: "✦", title: "Differentiation", description: "Highlight which features create real competitive separation." },
          { type: "asset", icon: "▤", title: "Feature Snapshot", description: "Generate a simple feature brief for internal product storytelling." },
        ]}
      />
    </>
  );
}

function CapabilitiesTruthPanel({ d, set, compact = false, layout, setLayout, starredTiles = {}, onToggleStar, starContext = "" }) {
  const u = k => v => set(prev => ({ ...prev, [k]: v }));
  const featureBenefitText = (d.featureBenefits || [])
    .map(item => `${item.feature}: ${item.benefit}`)
    .filter(Boolean)
    .join("; ");
  const tiles = [
    { id: "featureBenefits", title: "Feature + Benefit", render: () => <FeatureBenefitTable items={d.featureBenefits || []} onChange={u("featureBenefits")} /> },
    { id: "summary", title: "Capabilities Summary", render: () => <GenBlock label="Capabilities Summary" prompt={d.features || featureBenefitText || d.integrations ? `Write a compelling capabilities summary. Core features: ${d.features}. Feature benefits: ${featureBenefitText}. Integrations: ${d.integrations}. 3-4 sentences.` : ""} /> },
  ];
  return (
    <>
      <WorkspaceCanvas compact={compact} layout={layout} setLayout={setLayout} tiles={tiles} tileLimits={CAP_TILE_LIMITS} minHeight={420} starredTiles={starredTiles} onToggleStar={onToggleStar} starContext={starContext} />
      <SectionSuggestionsPanel
        subtitle="Relevant additions once capabilities and benefits are defined."
        suggestions={[
          { type: "section", icon: "▦", title: "Messaging Pillars", description: "Turn capabilities into messages that are easier to repeat and sell." },
          { type: "section", icon: "✶", title: "Proof Points", description: "Add outcomes and evidence that back up these claimed capabilities." },
          { type: "asset", icon: "▣", title: "Capabilities Overview", description: "Generate a capability summary asset for product marketing and sales." },
        ]}
      />
    </>
  );
}

function CompetitorsTruthPanel({ d, set, compact = false, layout, setLayout, starredTiles = {}, onToggleStar, starContext = "" }) {
  const u = k => v => set(prev => ({ ...prev, [k]: v }));
  const tiles = [
    { id: "competitors", title: "Main Competitors", render: tile => <CanvasField label="Main Competitors" value={d.competitors} onChange={u("competitors")} placeholder="Who are your top competitors and why are they relevant?" rows={5} minHeight={Math.max(170, (tile?.h || 170) - 34)} /> },
    { id: "winLose", title: "When We Win / Lose", render: tile => <CanvasField label="When We Win / Lose" value={d.winLose} onChange={u("winLose")} placeholder="Where do you tend to win, and where do you tend to lose?" rows={5} minHeight={Math.max(170, (tile?.h || 170) - 34)} accent="#F8F7FF" /> },
  ];
  return (
    <>
      <WorkspaceCanvas compact={compact} layout={layout} setLayout={setLayout} tiles={tiles} minHeight={390} starredTiles={starredTiles} onToggleStar={onToggleStar} starContext={starContext} />
      <SectionSuggestionsPanel
        subtitle="Competitive follow-ups that are most useful from this section."
        suggestions={[
          { type: "section", icon: "⊟", title: "Competitive Comparison Table", description: "Add a side-by-side comparison table for the main competitors listed here." },
          { type: "section", icon: "✶", title: "Proof Points", description: "Add proof that supports your claims against competitors." },
          { type: "asset", icon: "⚔", title: "Competitive Battlecard", description: "Generate a founder-friendly battlecard for sales and investor conversations." },
        ]}
      />
    </>
  );
}

function PositioningPanel({ d, set, pd, compact = false, layout, setLayout }) {
  const u = k => v => set(p => ({ ...p, [k]: v }));
  const tiles = [
    { id: "statement", title: "Positioning Statement", render: tile => <CanvasField label="Positioning Statement (Geoffrey Moore Style)" value={d.statement} onChange={u("statement")} placeholder="For [target customer] who [statement of need or opportunity], [product name] is a [product category] that [key benefit]. Unlike [primary competitive alternative], [product name] [primary differentiation]." rows={6} minHeight={Math.max(190, (tile?.h || 190) - 34)} accent="#F8F7FF" /> },
    { id: "valueProp", title: "Value Proposition", render: tile => <CanvasField label="Value Proposition" value={d.valueProp} onChange={u("valueProp")} placeholder="Summarize the core promise and business value your product delivers..." rows={5} minHeight={Math.max(160, (tile?.h || 160) - 34)} /> },
    { id: "tagline", title: "Tagline + Options", render: () => <TaglineStudio tagline={d.tagline} taglineOptions={d.taglineOptions} onTaglineChange={u("tagline")} onOptionsChange={u("taglineOptions")} prompt={pd.problem || d.valueProp ? `Generate 5 distinct tagline options for this product. Problem: ${pd.problem}. Value proposition: ${d.valueProp}. Keep each option 3-8 words and make them punchy.` : ""} /> },
    { id: "keyValue", title: "Key Value", render: tile => <CanvasField label="Key Value" value={d.keyValue} onChange={u("keyValue")} placeholder="List the most important customer or business value outcomes in short, clear terms..." rows={4} minHeight={Math.max(140, (tile?.h || 140) - 34)} accent="#F3F1FF" /> },
  ];
  return (
    <>
      <WorkspaceCanvas compact={compact} layout={layout} setLayout={setLayout} tiles={tiles} minHeight={520} />
      <SectionSuggestionsPanel
        title="AI-Suggested Sections for PMMs"
        subtitle="Add deeper narrative work or generate founder-ready assets from positioning."
        suggestions={[
          { type: "section", icon: "▶", title: "Launch Narrative", description: "Build a higher-level story arc for launch communication." },
          { type: "section", icon: "◔", title: "Category Design", description: "Define or redefine the market category around your positioning." },
          { type: "asset", icon: "▤", title: "Positioning Brief", description: "Generate a concise positioning brief for team alignment." },
        ]}
      />
    </>
  );
}

function MessagingPanel({ d, set, pd, compact = false, layout, setLayout }) {
  const u = k => v => set(p => ({ ...p, [k]: v }));
  const tiles = [
    { id: "headline", title: "Headline Message", render: tile => <CanvasField label="Headline Message" value={d.headline} onChange={u("headline")} placeholder="Your primary hero message..." rows={3} minHeight={Math.max(140, (tile?.h || 140) - 34)} /> },
    { id: "pillars", title: "Messaging Pillars", render: tile => <CanvasField label="Messaging Pillars" value={d.pillars} onChange={u("pillars")} placeholder="3-4 core messages that support your headline..." rows={5} minHeight={Math.max(180, (tile?.h || 180) - 34)} accent="#F8F7FF" /> },
    { id: "elevator", title: "Elevator Pitch", render: tile => <CanvasField label="Elevator Pitch" value={d.elevator} onChange={u("elevator")} placeholder="30-second verbal pitch..." rows={4} minHeight={Math.max(150, (tile?.h || 150) - 34)} /> },
    { id: "framework", title: "Full Messaging Framework", render: () => <GenBlock label="Full Messaging Framework" prompt={pd.problem ? `Create a messaging framework: 1) Bold headline (10 words max), 2) Three pillars with proof points, 3) Elevator pitch (2 sentences). Context: ${pd.problem}, Audience: ${pd.audience}` : ""} /> },
  ];
  return (
    <>
      <WorkspaceCanvas compact={compact} layout={layout} setLayout={setLayout} tiles={tiles} minHeight={460} />
      <SectionSuggestionsPanel
        title="AI-Suggested Sections for PMMs"
        subtitle="Relevant message extensions and assets for the narrative you are shaping."
        suggestions={[
          { type: "section", icon: "▥", title: "Sales Enablement Brief", description: "Add what sales needs to know, say, and repeat consistently." },
          { type: "section", icon: "◫", title: "Objection Handling", description: "Capture common objections and the best narrative response." },
          { type: "asset", icon: "✉", title: "Launch Messaging Pack", description: "Generate website, email, and sales copy starters from this messaging." },
        ]}
      />
    </>
  );
}

function AudiencePanel({ d, set, pd, compact = false, layout, setLayout }) {
  const u = k => v => set(p => ({ ...p, [k]: v }));
  const tiles = [
    { id: "primary", title: "Primary Persona", render: tile => <CanvasField label="Primary Persona" value={d.primary} onChange={u("primary")} placeholder="Job title, company size, key pain points, goals..." rows={6} minHeight={Math.max(200, (tile?.h || 200) - 34)} /> },
    { id: "secondary", title: "Secondary Persona", render: tile => <CanvasField label="Secondary Persona" value={d.secondary} onChange={u("secondary")} placeholder="Additional buyer or influencer persona..." rows={4} minHeight={Math.max(130, (tile?.h || 130) - 34)} accent="#F8F7FF" /> },
    { id: "persona", title: "Detailed Buyer Persona", render: () => <GenBlock label="Detailed Buyer Persona" prompt={pd.audience ? `Create a buyer persona for: ${pd.audience}. Include: name/title, day-in-the-life challenge, what they care about (3 things), key objections, how they discover tools.` : ""} /> },
  ];
  return (
    <>
      <WorkspaceCanvas compact={compact} layout={layout} setLayout={setLayout} tiles={tiles} minHeight={470} />
      <SectionSuggestionsPanel
        title="AI-Suggested Sections for PMMs"
        subtitle="Expand the narrative in ways that stay tied to audience reality."
        suggestions={[
          { type: "section", icon: "◈", title: "Persona Narrative", description: "Add a richer section for how each persona interprets the message." },
          { type: "section", icon: "◎", title: "GTM Motion", description: "Translate persona insight into channel and launch strategy." },
          { type: "asset", icon: "▣", title: "Persona Brief", description: "Generate a concise persona summary for marketing and sales teams." },
        ]}
      />
    </>
  );
}

function StrategyPanel({ d, set, pd, compact = false, layout, setLayout, starredTiles = {}, onToggleStar, starContext = "" }) {
  const u = k => v => set(p => ({ ...p, [k]: v }));
  const tiles = [
    { id: "goal", title: "Launch Goal", render: tile => <CanvasField label="Launch Goal" value={d.goal} onChange={u("goal")} placeholder="Success at 30/60/90 days..." rows={4} minHeight={Math.max(130, (tile?.h || 130) - 34)} /> },
    { id: "icp", title: "ICP Definition", render: tile => <CanvasField label="ICP Definition" value={d.icp} onChange={u("icp")} placeholder="Ideal Customer Profile - be specific..." rows={4} minHeight={Math.max(150, (tile?.h || 150) - 34)} accent="#F8F7FF" /> },
    { id: "channels", title: "Channels", render: tile => <CanvasField label="Channels" value={d.channels} onChange={u("channels")} placeholder="Where and how will you reach buyers?" rows={4} minHeight={Math.max(150, (tile?.h || 150) - 34)} /> },
    { id: "brief", title: "GTM Strategy Brief", render: () => <GenBlock label="GTM Strategy Brief" prompt={pd.problem ? `Write a GTM strategy brief. Product: ${pd.problem}, Audience: ${pd.audience}, Goal: ${d.goal}, ICP: ${d.icp}. Include: launch motion, top 3 tactics, key metrics, 90-day milestone.` : ""} /> },
  ];
  return (
    <>
      <WorkspaceCanvas compact={compact} layout={layout} setLayout={setLayout} tiles={tiles} minHeight={410} starredTiles={starredTiles} onToggleStar={onToggleStar} starContext={starContext} />
      <SectionSuggestionsPanel
        subtitle="Strategy-specific sections and assets that help operationalize GTM."
        suggestions={[
          { type: "section", icon: "▶", title: "Launch Narrative", description: "Create a launch story that supports the GTM strategy." },
          { type: "section", icon: "◔", title: "Pricing Narrative", description: "Add how value and pricing should be framed in market." },
          { type: "asset", icon: "✉", title: "Launch Brief", description: "Generate a launch brief to align cross-functional teams." },
        ]}
      />
    </>
  );
}

function StoryPanel({ d, set, pd, compact = false, layout, setLayout, starredTiles = {}, onToggleStar, starContext = "" }) {
  const u = k => v => set(p => ({ ...p, [k]: v }));
  const tiles = [
    { id: "origin", title: "Origin Story", render: tile => <CanvasField label="Origin Story" value={d.origin} onChange={u("origin")} placeholder="Why does this product exist?" rows={4} minHeight={Math.max(130, (tile?.h || 130) - 34)} /> },
    { id: "customer", title: "Customer Story", render: tile => <CanvasField label="Customer Story" value={d.customer} onChange={u("customer")} placeholder="A concrete before/after customer win..." rows={6} minHeight={Math.max(180, (tile?.h || 180) - 34)} accent="#F8F7FF" /> },
    { id: "demo", title: "Demo Narrative", render: tile => <CanvasField label="Demo Narrative" value={d.demo} onChange={u("demo")} placeholder="The story you tell during a product demo..." rows={4} minHeight={Math.max(130, (tile?.h || 130) - 34)} /> },
    { id: "arc", title: "Launch Story Arc", render: () => <GenBlock label="Launch Story Arc" prompt={pd.problem ? `Write a product launch story arc covering: The Problem, The Insight, The Solution, The Proof, The Vision. Context: ${pd.problem}. 3-4 sentences per section.` : ""} /> },
  ];
  return <WorkspaceCanvas compact={compact} layout={layout} setLayout={setLayout} tiles={tiles} minHeight={470} starredTiles={starredTiles} onToggleStar={onToggleStar} starContext={starContext} />;
}

function AssetsPanel({ d, set, pd, msg, strat, aiDraft, compactView = false, onNavigateToWorkspace }) {
  const [expandedAssetId, setExpandedAssetId] = useState("");
  const [updatingAssetId, setUpdatingAssetId] = useState("");
  const sharedShellStyle = {
    borderRadius: 28,
    border: `1px solid ${S.border}`,
    background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(246,244,255,0.96) 100%)",
    boxShadow: "0 22px 48px rgba(38, 33, 92, 0.06)",
    padding: 18,
    display: "grid",
    gap: 18,
  };
  const normalizedAssets = normalizeAssetsState(d, { pd, msg, strat, aiDraft });
  const suggestedAssets = buildAssetSuggestionCatalog({ pd, msg, strat, aiDraft })
    .filter(suggestion => !normalizedAssets.rows.some(row => row.id === suggestion.id))
    .map(suggestion => ({
      ...suggestion,
      sourceLabel:
        suggestion.category === "Sales"
          ? "Narrative or Product Truth"
          : suggestion.type === "Campaign" || suggestion.assetName.toLowerCase().includes("launch")
            ? "GTM Readiness"
            : "Narrative",
    }));

  useEffect(() => {
    const currentRows = JSON.stringify(d?.rows || []);
    const nextRows = JSON.stringify(normalizedAssets.rows || []);
    const currentNotes = d?.notes || "";
    if (currentRows !== nextRows || currentNotes !== normalizedAssets.notes) {
      set(prev => normalizeAssetsState(prev, { pd, msg, strat, aiDraft }));
    }
  }, [d, normalizedAssets, pd, msg, strat, aiDraft, set]);

  const rows = normalizedAssets.rows || [];
  const approvedAssets = rows.filter(row => row.status === "Approved");
  const summary = {
    approved: approvedAssets.length,
    needsWork: rows.filter(row => row.status === "Needs Work").length,
    inReview: rows.filter(row => row.status === "In Review").length,
    kits: new Set(approvedAssets.map(row => row.kit)).size,
  };

  const updateAsset = (assetId, updater) => {
    set(prev => {
      const next = normalizeAssetsState(prev, { pd, msg, strat, aiDraft });
      next.rows = next.rows.map(row => {
        if (row.id !== assetId) return row;
        const updated = typeof updater === "function" ? updater(row) : { ...row, ...updater };
        const score = calculateAssetScore(updated.scores || row.scores);
        return {
          ...updated,
          score,
          status: updated.status || inferAssetStatus(updated.content, score),
        };
      });
      return next;
    });
  };

  const downloadTextBlob = (filename, content) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const downloadAsset = asset => {
    downloadTextBlob(
      `${asset.assetName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-asset.txt`,
      `${asset.assetName}\n\nType: ${asset.type}\nCategory: ${asset.category}\nStatus: ${asset.status}\nScore: ${asset.score}\n\n${asset.content || ""}\n\nFeedback Summary:\n${asset.feedbackSummary || ""}`
    );
  };

  const downloadKit = kitName => {
    const kitAssets = approvedAssets.filter(asset => asset.kit === kitName);
    if (!kitAssets.length) return;
    downloadTextBlob(
      `${kitName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.txt`,
      `${kitName}\n\n${kitAssets.map(asset => `${asset.assetName}\nType: ${asset.type}\nScore: ${asset.score}\n\n${asset.content || ""}`).join("\n\n--------------------\n\n")}`
    );
  };

  const approvedKits = Array.from(new Set(approvedAssets.map(asset => asset.kit)));
  const gridTemplate = compactView
    ? "minmax(0, 1.7fr) minmax(0, 0.8fr) minmax(0, 0.9fr) repeat(3, minmax(0, 0.7fr)) minmax(0, 0.68fr) minmax(0, 0.9fr) minmax(0, 0.85fr)"
    : "minmax(220px, 1.45fr) minmax(110px, 0.7fr) minmax(120px, 0.8fr) repeat(3, minmax(90px, 0.55fr)) minmax(88px, 0.55fr) minmax(130px, 0.8fr) minmax(120px, 0.75fr)";
  const boardMinWidth = compactView ? "auto" : 1180;
  const hasGeneratedAssets = rows.length > 0;

  return (
    <div style={sharedShellStyle}>
      <div style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 24, overflow: "hidden" }}>
        <div style={{ padding: 18, background: "linear-gradient(180deg, #FCFBFF 0%, #F7F5FF 100%)", display: "grid", gap: 16 }}>
          {!hasGeneratedAssets ? (
            <>
              <div style={{ display: "grid", gap: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>AI Suggested Assets</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: P[900] }}>Generate assets from the workspace first</div>
                <div style={{ fontSize: 14, lineHeight: 1.65, color: S.muted }}>
                  Assets will appear here only after you generate them from Product Truth, Narrative, or GTM Readiness.
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                {suggestedAssets.map(suggestion => (
                  <div key={suggestion.id} style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 18, padding: 16, boxShadow: "0 10px 24px rgba(38, 33, 92, 0.04)", display: "grid", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: P[900] }}>{suggestion.assetName}</div>
                      <span style={{ padding: "5px 9px", borderRadius: 999, background: "#EEF8FF", color: "#1D4ED8", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {suggestion.category}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, lineHeight: 1.55, color: S.muted }}>{suggestion.description}</div>
                    <div style={{ fontSize: 12, color: P[700], fontWeight: 700 }}>Generate from: {suggestion.sourceLabel}</div>
                    <button
                      onClick={() => onNavigateToWorkspace?.(suggestion)}
                      style={{ justifySelf: "start", border: `1px solid ${S.border}`, background: "white", color: P[700], borderRadius: 12, padding: "10px 12px", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}
                    >
                      Open in Workspace
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ borderRadius: 20, border: `1px solid ${S.border}`, background: "rgba(255,255,255,0.78)", padding: 14, display: "grid", gap: 14 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <div style={{ padding: "8px 12px", borderRadius: 999, background: "#FBFAFF", border: `1px solid ${S.border}`, fontSize: 12, fontWeight: 700, color: S.text }}>
                  Approved {summary.approved}
                </div>
                <div style={{ padding: "8px 12px", borderRadius: 999, background: "#FBFAFF", border: `1px solid ${S.border}`, fontSize: 12, fontWeight: 700, color: S.text }}>
                  In Review {summary.inReview}
                </div>
                <div style={{ padding: "8px 12px", borderRadius: 999, background: "#FBFAFF", border: `1px solid ${S.border}`, fontSize: 12, fontWeight: 700, color: S.text }}>
                  Needs Work {summary.needsWork}
                </div>
                <div style={{ padding: "8px 12px", borderRadius: 999, background: "#FBFAFF", border: `1px solid ${S.border}`, fontSize: 12, fontWeight: 700, color: S.text }}>
                  Kits {summary.kits}
                </div>
              </div>
              <div style={{ overflowX: "auto", paddingBottom: 2 }}>
                <div style={{ minWidth: boardMinWidth, display: "grid", gap: 14 }}>
                  <div style={{ display: "grid", gridTemplateColumns: gridTemplate, gap: compactView ? 8 : 12, padding: "0 10px", fontSize: compactView ? 11 : 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    <div>Asset Name</div>
                    <div>Type</div>
                    <div>Category</div>
                    <div>Clarity</div>
                    <div>Relevance</div>
                    <div>Differentiation</div>
                    <div>Score</div>
                    <div>Status</div>
                    <div>Action</div>
                  </div>

                  {rows.map(asset => (
                    <div key={asset.id} style={{ borderRadius: 18, border: `1px solid ${S.border}`, overflow: "hidden", background: "white", boxShadow: "0 10px 24px rgba(38, 33, 92, 0.04)" }}>
                      <div style={{ display: "grid", gridTemplateColumns: gridTemplate, gap: compactView ? 8 : 12, alignItems: "center", padding: compactView ? "14px 14px" : "16px 18px" }}>
                        <button onClick={() => setExpandedAssetId(prev => (prev === asset.id ? "" : asset.id))} style={{ textAlign: "left", border: "none", background: "transparent", padding: 0, cursor: "pointer", fontFamily: "inherit" }}>
                          <div style={{ fontSize: compactView ? 13 : 15, fontWeight: 800, color: S.text, lineHeight: 1.3 }}>{asset.assetName}</div>
                          <div style={{ marginTop: 4, fontSize: compactView ? 11 : 12, color: S.muted, lineHeight: 1.45 }}>Expand for preview, feedback, and approval</div>
                        </button>
                        <div style={{ fontSize: compactView ? 12 : 13, fontWeight: 700, color: S.text }}>{asset.type}</div>
                        <div style={{ justifySelf: "start", padding: compactView ? "8px 10px" : "9px 12px", borderRadius: 999, border: `1px solid ${S.border}`, background: "#F7F4FF", fontSize: compactView ? 11 : 12, fontWeight: 800, color: P[700], whiteSpace: compactView ? "normal" : "nowrap" }}>{asset.category}</div>
                        {["clarity", "relevance", "differentiation"].map(parameter => (
                          <div key={parameter} style={{ minWidth: 0, padding: compactView ? "9px 8px" : "10px 12px", borderRadius: 999, border: `1px solid ${S.border}`, background: "#FBFAFF", fontSize: compactView ? 12 : 13, fontWeight: 700, color: S.text, textAlign: "center" }}>
                            {Number(asset.scores?.[parameter] || 0).toFixed(1)}
                          </div>
                        ))}
                        <div style={{ minWidth: 0, padding: compactView ? "9px 8px" : "10px 12px", borderRadius: 999, border: `1px solid ${S.border}`, background: "#EEF7F0", fontSize: compactView ? 12 : 13, fontWeight: 800, color: "#177A51", textAlign: "center" }}>
                          {asset.score}
                        </div>
                        <div style={{ justifySelf: "stretch", minWidth: 0, padding: compactView ? "9px 8px" : "10px 12px", borderRadius: 999, border: `1px solid ${S.border}`, background: asset.status === "Approved" ? "#EAF7EE" : asset.status === "Needs Work" ? "#FFF1F0" : "#FBFAFF", fontSize: compactView ? 11 : 13, fontWeight: 800, color: asset.status === "Approved" ? "#177A51" : asset.status === "Needs Work" ? "#B44332" : P[700], textAlign: "center" }}>
                          {asset.status}
                        </div>
                        <button onClick={() => downloadAsset(asset)} style={{ border: `1px solid ${S.border}`, background: "white", color: P[700], borderRadius: 12, padding: compactView ? "9px 8px" : "10px 14px", fontSize: compactView ? 11 : 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", width: "100%" }}>
                          Download
                        </button>
                      </div>

                      {expandedAssetId === asset.id && (
                        <div style={{ borderTop: `1px solid ${S.border}`, background: "#FCFBFF", padding: 18, display: "grid", gap: 16 }}>
                          <div style={{ display: "grid", gap: 8 }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>Asset Preview</div>
                            <div style={{ padding: 14, borderRadius: 16, border: `1px solid ${S.border}`, background: "white", fontSize: 14, lineHeight: 1.7, color: S.text, whiteSpace: "pre-wrap" }}>
                              {asset.content || "No content generated yet for this asset."}
                            </div>
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                            {["clarity", "relevance", "differentiation"].map(parameter => (
                              <label key={parameter} style={{ display: "grid", gap: 8 }}>
                                <span style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>{parameter}</span>
                                <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.1"
                                  value={asset.scores?.[parameter] ?? 0}
                                  onChange={event => {
                                    const value = Math.max(0, Math.min(10, Number(event.target.value || 0)));
                                    updateAsset(asset.id, row => ({
                                      ...row,
                                      scores: { ...row.scores, [parameter]: value },
                                      status: "",
                                    }));
                                  }}
                                  style={{ width: "100%", boxSizing: "border-box", padding: "11px 12px", borderRadius: 12, border: `1px solid ${S.border}`, background: "white", color: S.text, fontFamily: "inherit" }}
                                />
                              </label>
                            ))}
                          </div>

                          <div style={{ display: "grid", gap: 8 }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>Feedback Summary</div>
                            <textarea value={asset.feedbackSummary || ""} onChange={event => updateAsset(asset.id, { feedbackSummary: event.target.value })} rows={3} style={{ width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 16, border: `1px solid ${S.border}`, background: "white", color: S.text, fontFamily: "inherit", resize: "vertical" }} />
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
                            <div style={{ padding: 16, borderRadius: 16, border: `1px solid ${S.border}`, background: "white" }}>
                              <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>Top Issues</div>
                              <ul style={{ margin: "10px 0 0", paddingLeft: 18, color: S.text, lineHeight: 1.7 }}>
                                {(asset.topIssues || []).map(issue => <li key={issue}>{issue}</li>)}
                              </ul>
                            </div>
                            <div style={{ padding: 16, borderRadius: 16, border: `1px solid ${S.border}`, background: "white" }}>
                              <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>Suggested Improvements</div>
                              <ul style={{ margin: "10px 0 0", paddingLeft: 18, color: S.text, lineHeight: 1.7 }}>
                                {(asset.suggestedImprovements || []).map(item => <li key={item}>{item}</li>)}
                              </ul>
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <button onClick={() => updateAsset(asset.id, { status: "Approved" })} style={{ border: "none", background: "#177A51", color: "white", borderRadius: 12, padding: "11px 16px", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                              Approve
                            </button>
                            <button
                              onClick={async () => {
                                if (updatingAssetId === asset.id) return;
                                setUpdatingAssetId(asset.id);
                                try {
                                  const updateBrief = await generateAssetUpdateBrief(asset, { pd, msg, strat });
                                  updateAsset(asset.id, row => ({
                                    ...row,
                                    status: "Needs Work",
                                    feedbackSummary: updateBrief.feedbackSummary,
                                    topIssues: updateBrief.topIssues,
                                    suggestedImprovements: updateBrief.suggestedImprovements,
                                  }));
                                } finally {
                                  setUpdatingAssetId("");
                                }
                              }}
                              style={{ border: `1px solid ${S.border}`, background: "white", color: P[700], borderRadius: 12, padding: "11px 16px", fontSize: 13, fontWeight: 800, cursor: updatingAssetId === asset.id ? "wait" : "pointer", fontFamily: "inherit" }}
                            >
                              {updatingAssetId === asset.id ? "Preparing Update..." : "Request Update"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {hasGeneratedAssets && (
      <div style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 24, padding: 18, display: "grid", gap: 14 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>Download Approved Kit</div>
          <div style={{ marginTop: 8, fontSize: 16, fontWeight: 700, color: P[900] }}>Only approved assets are grouped into downloadable kits</div>
        </div>
        {approvedKits.length === 0 ? (
          <div style={{ padding: 16, borderRadius: 16, background: S.bg, border: `1px solid ${S.border}`, color: S.muted, fontSize: 14, lineHeight: 1.65 }}>
            Approve at least one asset to create a downloadable sales or marketing kit.
          </div>
        ) : (
          approvedKits.map(kitName => {
            const kitAssets = approvedAssets.filter(asset => asset.kit === kitName);
            return (
              <div key={kitName} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap", padding: 16, borderRadius: 16, border: `1px solid ${S.border}`, background: "#FCFBFF" }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: P[900] }}>{kitName}</div>
                  <div style={{ marginTop: 6, fontSize: 13, color: S.muted }}>{kitAssets.map(asset => asset.assetName).join(" • ")}</div>
                </div>
                <button onClick={() => downloadKit(kitName)} style={{ border: "none", background: P[600], color: "white", borderRadius: 12, padding: "11px 16px", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                  Download All
                </button>
              </div>
            );
          })
        )}
      </div>
      )}
    </div>
  );
}

function AlignmentPanel({ d }) {
  return <FeedbackDashboard {...d} />;
}

function AnalyticsPanel({ d }) {
  const performanceCards = [
    { label: "Wins Influenced", value: d.performance?.wins || "0", note: "How many revenue opportunities used the narrative in a meaningful way." },
    { label: "Asset Downloads", value: d.performance?.downloads || "0", note: "Downloads show which outputs are actually being pulled into field use." },
    { label: "Campaign Engagement", value: d.performance?.campaigns || "0", note: "Campaign interactions show whether the narrative is resonating in-market." },
    { label: "Revenue Influenced", value: d.performance?.revenue || "$0", note: "Pipeline and revenue links help PMM connect narrative quality to business outcomes." },
  ];

  const signalBlocks = [
    {
      title: "Narrative Performance Inputs",
      bullets: [
        "Wins and pipeline influenced by the active narrative",
        "Asset downloads by sales and marketing teams",
        "Campaign engagement and CTA conversion",
        "Social, event, and field engagement mapped back to the story",
      ],
    },
    {
      title: "How This Feeds Narrative Intelligence",
      bullets: [
        "AI summarizes what messages are working across channels",
        "Weak engagement highlights which parts of the narrative are underperforming",
        "High-converting assets reveal what language or proof points should be promoted",
        "PMM can compare signal quality across versions and launches",
      ],
    },
    {
      title: "What Third-Party Integrations Will Unlock",
      bullets: [
        "CRM and pipeline attribution",
        "Campaign performance from ad and marketing platforms",
        "Social engagement by message theme",
        "Event and webinar engagement mapped to the narrative",
      ],
    },
  ];

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <div style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 22, padding: 20, display: "grid", gap: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>Market Feedback</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: P[900], letterSpacing: "-0.04em" }}>How engagement data will feed Loop’s narrative intelligence</div>
        <div style={{ maxWidth: 860, fontSize: 14, lineHeight: 1.7, color: S.muted }}>
          This page is intentionally an infographic-style preview for now. It shows how wins, downloads, campaign engagement, social engagement, event engagement, and other activity will later connect into measurable PMM intelligence once third-party integrations are added.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        {performanceCards.map(card => (
          <div key={card.label} style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 18, padding: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>{card.label}</div>
            <div style={{ marginTop: 10, fontSize: 24, fontWeight: 800, color: P[900] }}>{card.value}</div>
            <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6, color: S.muted }}>{card.note}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {signalBlocks.map(block => (
          <div key={block.title} style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 20, padding: 18 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: P[900] }}>{block.title}</div>
            <ul style={{ margin: "10px 0 0", paddingLeft: 18, color: S.text, lineHeight: 1.75 }}>
              {block.bullets.map(item => <li key={item}>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <div style={{ background: "linear-gradient(135deg, #FBFAFF 0%, #F2F0FF 100%)", border: `1px solid ${S.border}`, borderRadius: 22, padding: 20, display: "grid", gap: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>AI Autofill Preview</div>
        <div style={{ display: "grid", gap: 12 }}>
          {[
            {
              label: "Narrative Resonance Summary",
              value: "AI will summarize which narrative themes are producing the strongest wins, conversion signals, and repeat engagement.",
            },
            {
              label: "Pipeline Influence Story",
              value: "AI will connect product narrative, GTM execution, and influenced pipeline so PMM can prove business impact over time.",
            },
            {
              label: "Signal-to-Action Recommendation",
              value: "AI will recommend which message, proof point, or asset should be promoted, revised, or retired based on engagement patterns.",
            },
          ].map(item => (
            <div key={item.label} style={{ padding: 16, borderRadius: 16, background: "white", border: `1px solid ${S.border}` }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>{item.label}</div>
              <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.7, color: S.text }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConfidencePanel({ d }) {
  const approvedAssets = (d.assets?.rows || []).filter(asset => asset.status === "Approved").length;
  const totalAssets = d.assets?.rows?.length || 0;
  const reviewApproved = d.reviewAnalytics?.totals?.approved || 0;
  const reviewPending = d.reviewAnalytics?.totals?.pending || 0;
  const marketSignalsCount = d.feedbackSignals?.length || 0;
  const readinessScore = Math.round(
    Math.min(
      100,
      (
        (d.confidenceScore || 0) * 0.4 +
        (totalAssets ? (approvedAssets / totalAssets) * 100 : 0) * 0.25 +
        (reviewApproved + reviewPending ? (reviewApproved / Math.max(1, reviewApproved + reviewPending)) * 100 : 0) * 0.2 +
        Math.min(100, marketSignalsCount * 20) * 0.15
      )
    )
  );

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <div style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 22, padding: 20, display: "grid", gap: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>Loop Readiness</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: P[900], letterSpacing: "-0.04em" }}>How close this narrative loop is to a measurable launch-ready system</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        {[
          { label: "Readiness Score", value: `${readinessScore}/100`, note: "A blended view of confidence, approved assets, review progress, and market signal coverage." },
          { label: "Approved Assets", value: `${approvedAssets}/${totalAssets || 0}`, note: "Approved assets indicate how much of the enablement layer is genuinely ready." },
          { label: "Internal Approval", value: `${reviewApproved}`, note: "Approved review sections show how much of the story is aligned internally." },
          { label: "Market Signals", value: `${marketSignalsCount}`, note: "Signal coverage shows how much external evidence is feeding the next iteration." },
        ].map(card => (
          <div key={card.label} style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 18, padding: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>{card.label}</div>
            <div style={{ marginTop: 10, fontSize: 24, fontWeight: 800, color: P[900] }}>{card.value}</div>
            <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6, color: S.muted }}>{card.note}</div>
          </div>
        ))}
      </div>

      <ConfidenceScoreCard factors={d.factors} score={d.confidenceScore} decisionNotes={d.decisionNotes} />
      <NarrativeHealth metrics={d.narrativeHealth} />
      <AlignmentScore alignment={d.alignment} />
      <AIInsights context={d.aiContext} />
    </div>
  );
}

const NAV = [
  { group: "Product Truth", icon: "⬡", items: [
    { id: "productOverview", label: "Product Overview", icon: "◦" },
    { id: "problemStatementSection", label: "Problem Statement", icon: "◉" },
    { id: "solutionSection", label: "Solution", icon: "◎" },
    { id: "audienceTruth", label: "Audience", icon: "⊙" },
    { id: "differentiationTruth", label: "Differentiation", icon: "✦" },
    { id: "featuresTruth", label: "Features", icon: "⊞" },
    { id: "capabilitiesTruth", label: "Capabilities", icon: "≡" },
    { id: "competitorsTruth", label: "Competitors", icon: "◌" },
    { id: "addSection", label: "Add Section", icon: "+" },
  ]},
  { group: "Narrative", icon: "◈", items: [
    { id: "positioningStatementSection", label: "Positioning Statement", icon: "◈" },
    { id: "valuePropSection", label: "Value Proposition", icon: "◔" },
    { id: "headlineSection", label: "Headline Message", icon: "▣" },
    { id: "messagingPillarsSection", label: "Messaging Pillars", icon: "▦" },
    { id: "elevatorPitchSection", label: "Elevator Pitch", icon: "◫" },
    { id: "taglineSection", label: "Tagline + Options", icon: "✦" },
    { id: "keyValueSection", label: "Key Value", icon: "◌" },
    { id: "primaryPersonaSection", label: "Primary Persona", icon: "⊙" },
    { id: "secondaryPersonaSection", label: "Secondary Persona", icon: "◍" },
    { id: "buyerPersonaSection", label: "Detailed Buyer Persona", icon: "▤" },
    { id: "addNarrativeSection", label: "Add Section", icon: "+" },
  ]},
  { group: "GTM Readiness", icon: "◎", items: [
    { id: "strategy", label: "GTM Strategy", icon: "◎" },
    { id: "story", label: "Story", icon: "≡" },
  ]},
  { group: "Resources", icon: "◉", items: [
    { id: "assets", label: "Assets", icon: "≡" },
    { id: "reviewCenter", label: "Internal Feedback", icon: "◈" },
    { id: "analytics", label: "Market Feedback", icon: "◔" },
    { id: "confidence", label: "Loop Readiness", icon: "◌" },
  ]},
];

const WORKFLOW_STEPS = [
  { id: "login", label: "Login", workspace: "Product Truth", summary: "Create the workspace and collect basic launch context." },
  { id: "onboarding", label: "Onboarding", workspace: "Product Truth", summary: "Define the launch type, deadline, and starting materials." },
  { id: "productTruth", label: "Product Truth", workspace: "Product Truth", summary: "Build the factual source of truth section by section." },
  { id: "narrative", label: "Narrative", workspace: "Narrative", summary: "Turn product truth into approved positioning and messaging." },
  { id: "gtm", label: "GTM Readiness", workspace: "GTM Readiness", summary: "Translate the narrative into launch strategy and channel messaging." },
  { id: "assets", label: "Assets", workspace: "Resources", summary: "Generate launch assets, validate them, and package approved kits." },
  { id: "review", label: "Internal Feedback", workspace: "Resources", summary: "Resolve flags, request approval, and manage review in one place." },
  { id: "launch", label: "Market Feedback", workspace: "Resources", summary: "Track launch outcomes and external signal from one operational view." },
  { id: "feedback", label: "Resources Intelligence", workspace: "Resources", summary: "Capture signal, analytics, and recommendations for the next cycle." },
  { id: "complete", label: "Loop Closed", workspace: "Resources", summary: "Approved resources, internal feedback, and market signal feed the next version." },
];

const MVP_NAV = [
  {
    group: "Product Truth",
    items: [
      { id: "productTruth", label: "Product Truth", icon: "PT" },
    ],
  },
  {
    group: "Narrative",
    items: [
      { id: "narrative", label: "Narrative", icon: "CN" },
    ],
  },
  {
    group: "GTM Readiness",
    items: [
      { id: "strategy", label: "GTM Readiness", icon: "GT" },
    ],
  },
  {
    group: "Resources",
    items: [
      { id: "assets", label: "Assets", icon: "AS" },
      { id: "reviewCenter", label: "Internal Feedback", icon: "IF" },
      { id: "analytics", label: "Market Feedback", icon: "MF" },
      { id: "confidence", label: "Loop Readiness", icon: "LR" },
    ],
  },
];

const LEGACY_ACTIVE_SECTION_MAP = {
  feedback: "confidence",
  review: "reviewCenter",
  launch: "analytics",
  complete: "confidence",
};

function normalizeWorkspaceActive(activeId) {
  if (!activeId) return "productTruth";
  if (LEGACY_ACTIVE_SECTION_MAP[activeId]) return LEGACY_ACTIVE_SECTION_MAP[activeId];
  return activeId;
}

function normalizeWorkflowStage(stageId) {
  if (!stageId) return "productTruth";
  if (stageId === "review") return "review";
  if (stageId === "feedback" || stageId === "complete") return "feedback";
  if (stageId === "launch") return "launch";
  return stageId;
}

const WORKFLOW_CHECKLISTS = {
  login: [
    "User has entered the Loop platform",
    "Workspace access path is clear",
  ],
  onboarding: [
    "Product or launch name is defined",
    "Launch date is captured",
    "The workspace has a starting direction",
  ],
  productTruth: [
    "Problem is defined",
    "Solution is defined",
    "Audience is identified",
    "Differentiation or competitor context exists",
  ],
  narrative: [
    "Positioning statement exists",
    "Value proposition exists",
    "Messaging pillars exist",
  ],
  gtm: [
    "Launch goal is defined",
    "ICP or audience focus exists",
    "Channels are outlined",
  ],
  assets: [
    "Assets or launch outputs are generated",
    "Alignment check can be run",
  ],
  review: [
    "Review flags are resolved or accepted",
    "Version is ready to publish",
  ],
  launch: [
    "Narrative version is published",
    "Product launch status is live",
  ],
  feedback: [
    "Post-launch signals are captured",
    "Recommendations exist for the next version",
  ],
  complete: [
    "User achieved the launch outcome",
    "Platform captured feedback and closed the loop",
  ],
};

function WorkflowCommandCenter({
  stage,
  launchComplete,
  feedbackCaptured,
  stepCompletion,
  checklistStatus,
  primaryAction,
  secondaryAction,
  tertiaryAction,
  events,
  reviewCount,
}) {
  const currentStep = WORKFLOW_STEPS.find(step => step.id === stage) || WORKFLOW_STEPS[0];
  const checklist = WORKFLOW_CHECKLISTS[stage] || [];

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(244,243,255,0.96) 100%)",
      border: `1px solid ${S.border}`,
      borderRadius: 22,
      padding: 20,
      marginBottom: 18,
      boxShadow: "0 18px 40px rgba(83, 74, 183, 0.06)",
      display: "grid",
      gap: 18,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 18, flexWrap: "wrap" }}>
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: P[600], textTransform: "uppercase", letterSpacing: "0.08em" }}>Guided Workflow</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: P[900], letterSpacing: "-0.04em", lineHeight: 1.05 }}>
            {currentStep.label}
          </div>
          <div style={{ maxWidth: 720, fontSize: 14, lineHeight: 1.65, color: S.muted }}>
            {currentStep.summary}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ padding: "8px 12px", borderRadius: 999, background: launchComplete ? "#E8F7EE" : P[50], color: launchComplete ? "#177A51" : P[700], fontSize: 12, fontWeight: 800 }}>
            User Loop: {launchComplete ? "Complete" : "Open"}
          </span>
          <span style={{ padding: "8px 12px", borderRadius: 999, background: feedbackCaptured ? "#E8F7EE" : "#FFF7E8", color: feedbackCaptured ? "#177A51" : "#C77812", fontSize: 12, fontWeight: 800 }}>
            Platform Loop: {feedbackCaptured ? "Closed" : "Waiting for feedback"}
          </span>
          {!!reviewCount && (
            <span style={{ padding: "8px 12px", borderRadius: 999, background: "#FFF7E8", color: "#C77812", fontSize: 12, fontWeight: 800 }}>
              {reviewCount} review items
            </span>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 10 }}>
        {WORKFLOW_STEPS.slice(0, 9).map(step => {
          const complete = stepCompletion[step.id];
          const active = step.id === stage;
          return (
            <div
              key={step.id}
              style={{
                padding: "12px 12px 10px",
                borderRadius: 16,
                border: `1px solid ${active ? P[200] : S.border}`,
                background: active ? P[50] : complete ? "#F7FFFB" : "rgba(255,255,255,0.78)",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, color: active ? P[700] : complete ? "#177A51" : S.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {complete ? "Done" : active ? "Current" : "Next"}
              </div>
              <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700, color: S.text }}>{step.label}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {primaryAction && (
          <button
            onClick={primaryAction.onClick}
            style={{ border: "none", background: P[600], color: "white", borderRadius: 12, padding: "11px 16px", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}
          >
            {primaryAction.label}
          </button>
        )}
        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            style={{ border: `1px solid ${S.border}`, background: "white", color: S.text, borderRadius: 12, padding: "11px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
          >
            {secondaryAction.label}
          </button>
        )}
        {tertiaryAction && (
          <button
            onClick={tertiaryAction.onClick}
            style={{ border: `1px solid ${P[100]}`, background: P[50], color: P[700], borderRadius: 12, padding: "11px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
          >
            {tertiaryAction.label}
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.05fr) minmax(280px, 0.95fr)", gap: 14 }}>
        <div style={{ border: `1px solid ${S.border}`, borderRadius: 18, background: "white", padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: P[600], textTransform: "uppercase", letterSpacing: "0.08em" }}>Current Stage Checklist</div>
          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            {checklist.map((item, index) => {
              const done = checklistStatus[index];
              return (
                <div key={item} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "11px 12px", borderRadius: 14, background: done ? "#F4FEF8" : "#F8F7FF", border: `1px solid ${S.border}` }}>
                  <div style={{
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    background: done ? "#1E9E63" : "white",
                    border: `1px solid ${done ? "#1E9E63" : S.border}`,
                    color: done ? "white" : S.muted,
                    fontSize: 12,
                    fontWeight: 800,
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    marginTop: 1,
                  }}>
                    {done ? "✓" : index + 1}
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.55, color: done ? S.text : S.muted, fontWeight: done ? 700 : 500 }}>{item}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ border: `1px solid ${S.border}`, borderRadius: 18, background: "white", padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: P[600], textTransform: "uppercase", letterSpacing: "0.08em" }}>Automation Log</div>
          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            {events.length === 0 && (
              <div style={{ fontSize: 13, color: S.muted }}>No workflow automation has run yet.</div>
            )}
            {events.slice(0, 4).map(event => (
              <div key={event.id} style={{ padding: "12px 14px", borderRadius: 14, background: "#F8F7FF", border: `1px solid ${S.border}` }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: S.text }}>{event.title}</div>
                <div style={{ marginTop: 5, fontSize: 12, lineHeight: 1.55, color: S.muted }}>{event.note}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ border: `1px solid ${S.border}`, borderRadius: 18, background: "white", padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: P[600], textTransform: "uppercase", letterSpacing: "0.08em" }}>Completion Logic</div>
          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            <div style={{ padding: "12px 14px", borderRadius: 14, background: "#F8F7FF", border: `1px solid ${S.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: S.text }}>User loop closes when launch is achieved</div>
              <div style={{ marginTop: 4, fontSize: 12, lineHeight: 1.55, color: S.muted }}>
                Once the version is published and the product is launched, the user finishes the primary job-to-be-done.
              </div>
            </div>
            <div style={{ padding: "12px 14px", borderRadius: 14, background: "#F8F7FF", border: `1px solid ${S.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: S.text }}>Platform loop closes when feedback updates the next cycle</div>
              <div style={{ marginTop: 4, fontSize: 12, lineHeight: 1.55, color: S.muted }}>
                Feedback, analytics, and recommendations feed back into Product Truth and Narrative so the next version starts stronger.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompactWorkflowStrip({
  stage,
  checklistStatus,
  primaryAction,
  secondaryAction,
  reviewCount,
}) {
  const currentStep = WORKFLOW_STEPS.find(step => step.id === stage) || WORKFLOW_STEPS[0];
  const checklist = WORKFLOW_CHECKLISTS[stage] || [];
  const activeStepIndex = Math.max(0, WORKFLOW_STEPS.findIndex(step => step.id === stage));
  const progressPercent = Math.max(10, Math.round(((activeStepIndex + 1) / WORKFLOW_STEPS.length) * 100));
  const nextStep = WORKFLOW_STEPS[activeStepIndex + 1] || null;
  const completedChecklist = checklistStatus.filter(Boolean).length;

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(247,246,255,0.96) 100%)",
      border: `1px solid ${S.border}`,
      borderRadius: 18,
      padding: "14px 16px",
      marginBottom: 18,
      boxShadow: "0 12px 28px rgba(83, 74, 183, 0.05)",
      display: "grid",
      gap: 12,
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.25fr) auto", gap: 14, alignItems: "center" }}>
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: P[600], textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Workflow
            </span>
            {!!reviewCount && (
              <span style={{ padding: "6px 10px", borderRadius: 999, background: "#FFF7E8", color: "#C77812", fontSize: 12, fontWeight: 800 }}>
                {reviewCount} review item{reviewCount === 1 ? "" : "s"}
              </span>
            )}
          </div>
          <div style={{ fontSize: 18, lineHeight: 1.35, color: S.text, fontWeight: 800 }}>
            {currentStep.label}
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.55, color: S.muted }}>
            {currentStep.summary}{nextStep ? ` Next: ${nextStep.label}.` : ""}
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 12, color: S.muted, fontWeight: 700 }}>
                Progress {progressPercent}%
              </span>
              <span style={{ fontSize: 12, color: S.muted }}>
                Checklist {completedChecklist}/{checklist.length || 0}
              </span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: "#ECE9FF", overflow: "hidden" }}>
              <div style={{ width: `${progressPercent}%`, height: "100%", background: "linear-gradient(90deg, #534AB7 0%, #7F77DD 100%)" }} />
            </div>
          </div>
        </div>
        <div />
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        {primaryAction && (
          <button
            onClick={primaryAction.onClick}
            style={{ border: "none", background: P[600], color: "white", borderRadius: 12, padding: "11px 16px", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}
          >
            {primaryAction.label}
          </button>
        )}
        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            style={{ border: `1px solid ${S.border}`, background: "white", color: S.text, borderRadius: 12, padding: "11px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
          >
            {secondaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
}

function AppTabsHeader({ screen, onChangeScreen }) {
  const tabs = [
    { id: "landing", label: "Loop" },
    { id: "intelligence", label: "Narrative Intelligence" },
    { id: "brand", label: "Brand Guideline" },
  ];

  return (
    <div style={{
      position: "sticky",
      top: 0,
      zIndex: 20,
      display: "flex",
      justifyContent: "center",
      padding: "14px 24px",
      background: "rgba(255,255,255,0.94)",
      borderBottom: `1px solid ${S.border}`,
      backdropFilter: "blur(10px)",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 1600,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, minWidth: 0 }}>
          <button
            onClick={() => onChangeScreen("landing")}
            style={{ display: "flex", alignItems: "center", gap: 10, border: "none", background: "transparent", color: P[900], cursor: "pointer", fontFamily: "inherit", padding: 0 }}
          >
            <span style={{ width: 18, height: 18, borderRadius: 5, border: `3px solid ${P[900]}`, boxSizing: "border-box", display: "inline-block" }} />
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em" }}>Loop</span>
          </button>

          <div style={{ width: 1, alignSelf: "stretch", background: S.border }} />

          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            {tabs.map(tab => {
              const active = ((screen === "workspace" || screen === "projectSetup") ? "landing" : screen) === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onChangeScreen(tab.id)}
                  style={{
                    border: "none",
                    background: active ? P[50] : "transparent",
                    color: active ? P[700] : S.muted,
                    borderRadius: 12,
                    padding: "10px 14px",
                    fontSize: 14,
                    fontWeight: active ? 700 : 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <button
            aria-label="Notifications"
            style={{ width: 38, height: 38, borderRadius: 12, border: `1px solid ${S.border}`, background: "white", color: P[700], cursor: "pointer", fontSize: 16, fontFamily: "inherit", position: "relative" }}
          >
                  🔔
                </button>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #2E265E 0%, #5C52C7 100%)", color: "white", display: "grid", placeItems: "center", fontSize: 13, fontWeight: 800 }}>
            MT
          </div>
        </div>
      </div>
    </div>
  );
}

function MainWebsiteHeader({ onOpenLoop, onViewProjects, activeTab, setActiveTab }) {
  const tabs = ["Who We Are", "What Is Loop", "Why Loop", "Projects"];

  return (
    <div style={{
      position: "sticky",
      top: 0,
      zIndex: 20,
      padding: "18px 28px",
      background: "rgba(255,255,255,0.94)",
      borderBottom: `1px solid ${S.border}`,
      backdropFilter: "blur(10px)",
      display: "grid",
      gridTemplateColumns: "1fr auto 1fr",
      alignItems: "center",
      gap: 12,
    }}>
      <div />
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 6, background: S.sidebar, border: `1px solid ${S.border}`, borderRadius: 18 }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => {
              if (tab === "What Is Loop") {
                onOpenLoop();
                return;
              }
              if (tab === "Projects") {
                onViewProjects();
                return;
              }
              setActiveTab(tab);
            }}
            style={{
              border: "none",
              background: activeTab === tab ? "white" : "transparent",
              color: activeTab === tab ? P[600] : S.muted,
              borderRadius: 12,
              padding: "10px 16px",
              fontSize: 14,
              fontWeight: activeTab === tab ? 700 : 500,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button
          onClick={onOpenLoop}
          style={{ border: "none", background: P[600], color: "white", borderRadius: 12, padding: "12px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
        >
          Open Loop
        </button>
      </div>
    </div>
  );
}

function SignUpModal({ open, form, setForm, onClose, onSubmit }) {
  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(34, 27, 86, 0.24)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 520, background: "white", border: `1px solid ${S.border}`, borderRadius: 28, boxShadow: "0 28px 64px rgba(83, 74, 183, 0.18)", padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: P[600], textTransform: "uppercase", letterSpacing: "0.08em" }}>Create Account</div>
            <div style={{ marginTop: 10, fontSize: 34, lineHeight: 1.04, fontWeight: 800, letterSpacing: "-0.05em", color: P[900] }}>Sign up for Loop</div>
            <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6, color: S.muted }}>
              Create your Loop access with the basics you need to log in and start your first product project.
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ border: "none", background: "transparent", color: S.muted, fontSize: 24, lineHeight: 1, cursor: "pointer", fontFamily: "inherit" }}
            aria-label="Close sign up"
          >
            x
          </button>
        </div>

        <div style={{ display: "grid", gap: 14, marginTop: 22 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: S.muted, marginBottom: 6 }}>Full name</div>
            <input
              value={form.fullName}
              onChange={e => setForm(prev => ({ ...prev, fullName: e.target.value }))}
              placeholder="Mayank Trivedi"
              style={{ width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 14, border: `1px solid ${S.border}`, background: S.bg, color: S.text, fontSize: 14, outline: "none", fontFamily: "inherit" }}
            />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: S.muted, marginBottom: 6 }}>Work email</div>
            <input
              value={form.workEmail}
              onChange={e => setForm(prev => ({ ...prev, workEmail: e.target.value }))}
              placeholder="founder@company.com"
              style={{ width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 14, border: `1px solid ${S.border}`, background: S.bg, color: S.text, fontSize: 14, outline: "none", fontFamily: "inherit" }}
            />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: S.muted, marginBottom: 6 }}>Company name</div>
            <input
              value={form.companyName}
              onChange={e => setForm(prev => ({ ...prev, companyName: e.target.value }))}
              placeholder="Loop AI"
              style={{ width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 14, border: `1px solid ${S.border}`, background: S.bg, color: S.text, fontSize: 14, outline: "none", fontFamily: "inherit" }}
            />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: S.muted, marginBottom: 6 }}>Password</div>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Create a password"
              style={{ width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 14, border: `1px solid ${S.border}`, background: S.bg, color: S.text, fontSize: 14, outline: "none", fontFamily: "inherit" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 }}>
          <button
            onClick={onSubmit}
            style={{ border: "none", background: P[600], color: "white", borderRadius: 14, padding: "13px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flex: 1, minWidth: 180 }}
          >
            Create Account
          </button>
          <button
            onClick={onClose}
            style={{ border: `1px solid ${S.border}`, background: "white", color: S.text, borderRadius: 14, padding: "13px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function GuidedWalkthroughModal({
  open,
  mode,
  stepIndex,
  steps,
  onClose,
  onStart,
  onSkip,
}) {
  if (!open) return null;

  const currentStep = steps[stepIndex] || steps[0];
  const introMode = mode === "intro";
  const completeMode = mode === "complete";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 85, background: "rgba(34, 27, 86, 0.26)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", padding: 24 }}>
      <div
        style={{
          width: "100%",
          maxWidth: 780,
          maxHeight: "min(86vh, 920px)",
          background: "white",
          border: `1px solid ${S.border}`,
          borderRadius: 30,
          boxShadow: "0 32px 72px rgba(83, 74, 183, 0.2)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "26px 28px 20px", borderBottom: `1px solid ${S.border}`, background: "linear-gradient(135deg, #FFFFFF 0%, #F3F1FF 100%)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: P[600], textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Guided Walkthrough
              </div>
              <div style={{ marginTop: 10, fontSize: 34, lineHeight: 1.04, fontWeight: 800, letterSpacing: "-0.05em", color: P[900] }}>
                Build a mock product in under 30 seconds
              </div>
              <div style={{ marginTop: 10, maxWidth: 620, fontSize: 14, lineHeight: 1.7, color: S.muted }}>
                Loop will show what each workspace does, where to start, and auto-fill a realistic example so first-time users can understand the flow fast.
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ border: "none", background: "transparent", color: S.muted, fontSize: 24, lineHeight: 1, cursor: "pointer", fontFamily: "inherit" }}
              aria-label="Close walkthrough"
            >
              x
            </button>
          </div>
        </div>

        <div style={{ padding: 28, display: "grid", gap: 20, overflowY: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(124px, 1fr))", gap: 10 }}>
            {steps.map((step, index) => {
              const active = index === stepIndex;
              const complete = index < stepIndex || mode === "complete";
              return (
                <div
                  key={step.id}
                  style={{
                    padding: "12px 12px 10px",
                    borderRadius: 16,
                    border: `1px solid ${active ? P[200] : S.border}`,
                    background: active ? P[50] : complete ? "#F5FFF9" : "#FBFAFF",
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 800, color: active ? P[700] : complete ? "#177A51" : S.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {complete ? "Done" : active ? "Current" : "Next"}
                  </div>
                  <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700, color: S.text }}>{step.workspace}</div>
                </div>
              );
            })}
          </div>

          {introMode && (
            <>
              <div style={{ display: "grid", gap: 12 }}>
                {steps.map(step => (
                  <div key={step.id} style={{ padding: "14px 16px", borderRadius: 18, border: `1px solid ${S.border}`, background: S.bg }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: P[900] }}>{step.workspace}</div>
                    <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.6, color: S.muted }}>{step.description}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {mode === "running" && (
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ padding: "18px 18px", borderRadius: 22, border: `1px solid ${P[100]}`, background: "linear-gradient(135deg, #F8F7FF 0%, #F1EFFF 100%)" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: P[600], textTransform: "uppercase", letterSpacing: "0.08em" }}>Now Building</div>
                <div style={{ marginTop: 10, fontSize: 26, lineHeight: 1.08, fontWeight: 800, color: P[900] }}>{currentStep.workspace}</div>
                <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.65, color: S.muted }}>{currentStep.description}</div>
              </div>
              <div style={{ padding: "14px 16px", borderRadius: 18, background: "white", border: `1px solid ${S.border}`, fontSize: 13, lineHeight: 1.7, color: S.text }}>
                Loop is auto-filling this workspace so the user can see the right flow, understand what each tab does, and then edit everything manually afterward.
              </div>
            </div>
          )}

          {completeMode && (
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ padding: "18px 18px", borderRadius: 22, border: "1px solid #CFEFD9", background: "linear-gradient(135deg, #F5FFF9 0%, #EEFFF5 100%)" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#177A51", textTransform: "uppercase", letterSpacing: "0.08em" }}>Walkthrough Complete</div>
                <div style={{ marginTop: 10, fontSize: 28, lineHeight: 1.08, fontWeight: 800, color: P[900] }}>Your mock Loop project is ready</div>
                <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.7, color: S.muted }}>
                  Product Truth, Core Narrative, GTM, Assets, and Feedback were filled in so the user can inspect the complete MVP flow and then change any section manually.
                </div>
              </div>
            </div>
          )}
        </div>

        {(introMode || completeMode) && (
          <div
            style={{
              padding: "0 28px 28px",
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              borderTop: `1px solid ${S.border}`,
              background: "white",
            }}
          >
            {introMode && (
              <>
                <button
                  onClick={onStart}
                  style={{ border: "none", background: P[600], color: "white", borderRadius: 14, padding: "13px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: 20 }}
                >
                  Start 30-sec Walkthrough
                </button>
                <button
                  onClick={onSkip}
                  style={{ border: `1px solid ${S.border}`, background: "white", color: S.text, borderRadius: 14, padding: "13px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: 20 }}
                >
                  I&apos;ll build it myself
                </button>
              </>
            )}

            {completeMode && (
              <button
                onClick={onClose}
                style={{ border: "none", background: P[600], color: "white", borderRadius: 14, padding: "13px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: 20 }}
              >
                Open Workspace
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MainWebsitePage({ onOpenLoop, onViewProjects, onStartProject }) {
  const [activeTab, setActiveTab] = useState("What Is Loop");
  const content = {
    "Who We Are": {
      eyebrow: "Who We Are",
      title: "Loop is building the narrative operating system for product-led teams.",
      body: "We believe founders, PMMs, product teams, and sales teams need one shared system to align product truth, messaging, go-to-market execution, and feedback over time.",
    },
    "What Is Loop": {
      eyebrow: "What Is Loop",
      title: "Loop helps teams move from product truth to launch with one guided workflow.",
      body: "Instead of scattering strategy across docs, decks, and prompts, Loop gives teams one place to define product truth, shape core narrative, create GTM outputs, and improve with post-launch feedback.",
    },
    "Why Loop": {
      eyebrow: "Why Loop",
      title: "Because launches break when the story breaks.",
      body: "Loop exists to reduce narrative drift, shorten review cycles, align teams around one approved story, and turn every launch into a feedback loop that improves the next version.",
    },
  }[activeTab];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #FBFAFF 0%, #F4F3FF 100%)" }}>
      <MainWebsiteHeader
        onOpenLoop={onOpenLoop}
        onViewProjects={onViewProjects}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "52px 28px 64px", display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(340px, 0.9fr)", gap: 24, alignItems: "stretch" }}>
        <div style={{ background: "linear-gradient(135deg, #FFFFFF 0%, #F1EFFF 100%)", border: `1px solid ${S.border}`, borderRadius: 28, padding: "42px 40px", minHeight: 470, display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 18px 40px rgba(83, 74, 183, 0.08)" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 999, background: P[50], color: P[600], fontSize: 12, fontWeight: 700, marginBottom: 20 }}>
              {content.eyebrow}
            </div>
            <h1 style={{ margin: 0, fontSize: 56, lineHeight: 1.02, letterSpacing: "-0.06em", color: P[900], maxWidth: 780 }}>
              {content.title}
            </h1>
            <p style={{ margin: "22px 0 0", maxWidth: 680, fontSize: 19, lineHeight: 1.68, color: S.muted }}>
              {content.body}
            </p>
          </div>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 28 }}>
            <button
              onClick={onStartProject}
              style={{ border: "none", background: P[600], color: "white", borderRadius: 14, padding: "14px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
            >
              Start Project
            </button>
            <button
              onClick={onOpenLoop}
              style={{ border: `1px solid ${S.border}`, background: "white", color: S.text, borderRadius: 14, padding: "14px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
            >
              Open Loop Workspace
            </button>
            <div style={{ display: "inline-flex", alignItems: "center", padding: "14px 16px", borderRadius: 14, background: "white", border: `1px solid ${S.border}`, fontSize: 14, color: S.text }}>
              One product · many versions · one shared source of truth
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 18 }}>
          <div style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 24, padding: 24, boxShadow: "0 12px 28px rgba(83, 74, 183, 0.06)" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: P[600], textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>What you get in Loop</div>
            <div style={{ display: "grid", gap: 12 }}>
              {[
                ["Product Truth", "Define the product, customer problem, solution, audience, and differentiation."],
                ["Core Narrative", "Create positioning, value proposition, messaging, and launch story."],
                ["GTM + Assets", "Translate the approved narrative into channel messaging and launch assets."],
                ["Narrative Intelligence", "Track what changed, what landed, and what should improve next."],
              ].map(([title, text]) => (
                <div key={title} style={{ padding: "14px 16px", borderRadius: 16, background: S.bg, border: `1px solid ${S.border}` }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: S.text, marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.55, color: S.muted }}>{text}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "linear-gradient(135deg, #534AB7 0%, #7F77DD 100%)", borderRadius: 24, padding: 24, color: "white", minHeight: 180, display: "grid", gap: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.78 }}>Next Step</div>
            <div style={{ fontSize: 24, lineHeight: 1.2, fontWeight: 700, maxWidth: 380 }}>
              Start one product project, run the full Loop workflow, and inspect the reports end to end.
            </div>
            <button
              onClick={onStartProject}
              style={{ justifySelf: "start", border: "none", background: "white", color: P[600], borderRadius: 12, padding: "12px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
            >
              Start Testing Loop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MainWebsitePageSimple({ onOpenLoop, pd, setPd, onSaveProject, onViewProjects }) {
  const [activeTab, setActiveTab] = useState("What Is Loop");
  const content = {
    "Who We Are": {
      eyebrow: "Who We Are",
      title: "Loop is building the narrative operating system for product-led teams.",
      body: "We believe founders, PMMs, product teams, and sales teams need one shared system to align product truth, messaging, go-to-market execution, and feedback over time.",
    },
    "What Is Loop": {
      eyebrow: "Build Your Narrative",
      title: "Turn your product into a clear, launch-ready narrative in minutes.",
      body: "Loop drafts the first narrative for you, then gives PMMs and founders a simple workspace to refine the story, generate assets, and close the loop with feedback.",
    },
    "Why Loop": {
      eyebrow: "Why Loop",
      title: "Because launches break when the story breaks.",
      body: "Loop exists to reduce narrative drift, shorten review cycles, align teams around one approved story, and turn every launch into a feedback loop that improves the next version.",
    },
  }[activeTab];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #FBFAFF 0%, #F4F3FF 100%)" }}>
      <MainWebsiteHeader onOpenLoop={onOpenLoop} onViewProjects={onViewProjects} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "52px 28px 64px", display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(360px, 0.9fr)", gap: 24, alignItems: "stretch" }}>
        <div style={{ background: "linear-gradient(135deg, #FFFFFF 0%, #F1EFFF 100%)", border: `1px solid ${S.border}`, borderRadius: 28, padding: "42px 40px", minHeight: 470, display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 18px 40px rgba(83, 74, 183, 0.08)" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 999, background: P[50], color: P[600], fontSize: 12, fontWeight: 700, marginBottom: 20 }}>
              {content.eyebrow}
            </div>
            <h1 style={{ margin: 0, fontSize: 56, lineHeight: 1.02, letterSpacing: "-0.06em", color: P[900], maxWidth: 780 }}>
              {content.title}
            </h1>
            <p style={{ margin: "22px 0 0", maxWidth: 680, fontSize: 19, lineHeight: 1.68, color: S.muted }}>
              {content.body}
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gap: 18 }}>
          <div style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 24, padding: 24, boxShadow: "0 12px 28px rgba(83, 74, 183, 0.06)" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: P[600], textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Build Your Narrative</div>
            <div style={{ fontSize: 30, lineHeight: 1.08, fontWeight: 800, color: P[900], letterSpacing: "-0.05em" }}>Build your first AI draft</div>
            <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.65, color: S.muted }}>
              Add a product name and short description. Loop will draft Product Truth, Core Narrative, and GTM direction, then take you straight into the workspace to refine it.
            </div>
            <div style={{ marginTop: 18, display: "grid", gap: 14 }}>
              <label style={{ display: "grid", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: S.muted }}>Product Name</span>
                <input value={pd.name} onChange={e => setPd(prev => ({ ...prev, name: e.target.value }))} placeholder="Loop AI Launch Pilot" style={{ width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 14, border: `1px solid ${S.border}`, background: S.bg, color: S.text, outline: "none", fontFamily: "inherit" }} />
              </label>
              <label style={{ display: "grid", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: S.muted }}>Product Description</span>
                <textarea value={pd.description} onChange={e => setPd(prev => ({ ...prev, description: e.target.value }))} placeholder="Narrative operating system for launches" rows={6} style={{ width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 14, border: `1px solid ${S.border}`, background: S.bg, color: S.text, outline: "none", fontFamily: "inherit", resize: "vertical" }} />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
                <label style={{ display: "grid", gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: S.muted }}>Audience</span>
                  <input value={pd.audience} onChange={e => setPd(prev => ({ ...prev, audience: e.target.value }))} placeholder="PMM teams at B2B SaaS companies" style={{ width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 14, border: `1px solid ${S.border}`, background: S.bg, color: S.text, outline: "none", fontFamily: "inherit" }} />
                </label>
                <label style={{ display: "grid", gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: S.muted }}>Category</span>
                  <input value={pd.category} onChange={e => setPd(prev => ({ ...prev, category: e.target.value }))} placeholder="Narrative intelligence platform" style={{ width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 14, border: `1px solid ${S.border}`, background: S.bg, color: S.text, outline: "none", fontFamily: "inherit" }} />
                </label>
              </div>
              <label style={{ display: "grid", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: S.muted }}>Wow Factor</span>
                <textarea value={pd.wowFactor} onChange={e => setPd(prev => ({ ...prev, wowFactor: e.target.value }))} placeholder="What feels special, surprising, or unusually useful about this product?" rows={3} style={{ width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 14, border: `1px solid ${S.border}`, background: S.bg, color: S.text, outline: "none", fontFamily: "inherit", resize: "vertical" }} />
              </label>
              <div style={{ padding: "12px 14px", borderRadius: 16, background: "#F8F7FF", border: `1px solid ${S.border}`, fontSize: 13, lineHeight: 1.6, color: S.muted }}>
                Loop will first infer product context, then draft Product Truth, Core Narrative, GTM, and starter assets. You will refine the draft and keep control over what becomes final.
              </div>
            </div>
            <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: 12 }}>
              <button
                onClick={onSaveProject}
                style={{ border: "none", background: P[600], color: "white", borderRadius: 14, padding: "14px 18px", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", width: "100%" }}
              >
                Generate Narrative
              </button>
              <button
                onClick={onViewProjects}
                style={{ border: `1px solid ${S.border}`, background: "white", color: S.text, borderRadius: 14, padding: "14px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", width: "100%" }}
              >
                View Projects
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectSection({ title, subtitle, items, emptyState, onOpenProject, onDeleteProject, onAddProject, onDownloadProject, onNextVersion }) {
  const [selectedVersions, setSelectedVersions] = useState({});
  return (
    <div style={{ width: "100%", display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: P[600], textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</div>
        <div style={{ fontSize: 14, lineHeight: 1.6, color: S.muted }}>{subtitle}</div>
      </div>
      <div style={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}>
        {items.length === 0 && title !== "Open Narratives" && (
          <div style={{ padding: "22px 20px", borderRadius: 22, border: `1px dashed ${S.border}`, background: "rgba(255,255,255,0.72)", fontSize: 13, lineHeight: 1.7, color: S.muted }}>
            {emptyState}
          </div>
        )}
        {items.map(family => (
          (() => {
            const selectedVersionId = selectedVersions[family.id] || family.rootProject?.id || family.latestVersion?.id;
            const project = family.versions.find(version => version.id === selectedVersionId) || family.rootProject || family.latestVersion;
            const familyLifecycle = getProjectLifecycle(family.latestVersion || family.rootProject);
            const selectedLifecycle = getProjectLifecycle(project);
            const statusLabel = familyLifecycle.label;
            const statusColor = familyLifecycle.key === "closed" ? "#177A51" : familyLifecycle.key === "live" ? "#1F6FEB" : "#8A5CF6";
            const statusBg = familyLifecycle.key === "closed" ? "#ECFDF3" : familyLifecycle.key === "live" ? "#EEF4FF" : "#F6F1FF";
            const eyebrowLabel = familyLifecycle.key === "closed" ? "Closed Loop" : "Open Narrative";
            return (
          <div
            key={family.id}
            style={{
              border: `1px solid ${S.border}`,
              background: "white",
              borderRadius: 24,
              padding: "24px 22px",
              boxShadow: "0 16px 36px rgba(83, 74, 183, 0.08)",
              display: "grid",
              gap: 14,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: P[600], textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {eyebrowLabel}
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 999, background: statusBg, color: statusColor, fontSize: 11, fontWeight: 800 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: statusColor, display: "inline-block" }} />
                  {statusLabel}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  onClick={event => {
                    event.stopPropagation();
                    onNextVersion(project);
                  }}
                  style={{ border: `1px solid ${S.border}`, background: "white", color: S.muted, borderRadius: 12, padding: "8px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                >
                  Next Version
                </button>
                <button
                  onClick={event => {
                    event.stopPropagation();
                    onDownloadProject(project);
                  }}
                  title="Download report"
                  style={{ border: `1px solid ${S.border}`, background: "white", color: S.muted, borderRadius: 12, padding: "8px 10px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", lineHeight: 1 }}
                >
                  ↓
                </button>
                <button
                  onClick={event => {
                    event.stopPropagation();
                    onDeleteProject(project.id);
                  }}
                  style={{ border: `1px solid ${S.border}`, background: "white", color: S.muted, borderRadius: 12, padding: "8px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                >
                  Delete
                </button>
              </div>
            </div>
            <button
              onClick={() => onOpenProject(project)}
              style={{ textAlign: "left", border: "none", background: "transparent", padding: 0, cursor: "pointer", fontFamily: "inherit" }}
            >
              <div style={{ fontSize: 24, lineHeight: 1.15, fontWeight: 800, color: P[900] }}>
                {family.rootProject?.name || project.name || "Untitled Project"}
              </div>
              <div style={{ marginTop: 10, fontSize: 13, lineHeight: 1.6, color: S.muted }}>
                {project.description || "Loop product workspace"}
              </div>
              <div style={{ marginTop: 10, fontSize: 12, lineHeight: 1.6, color: P[600], fontWeight: 700 }}>
                {family.versions.length} saved version{family.versions.length === 1 ? "" : "s"}
              </div>
            </button>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <select
                value={project.id}
                onChange={event => setSelectedVersions(prev => ({ ...prev, [family.id]: event.target.value }))}
                style={{ padding: "8px 10px", borderRadius: 999, background: P[50], color: P[700], fontSize: 11, fontWeight: 800, border: `1px solid ${P[200]}`, outline: "none", fontFamily: "inherit" }}
              >
                {family.versions.map(version => (
                  <option key={version.id} value={version.id}>
                    {(version.version || "v1.0")}{version.id === family.rootProject?.id ? " - Base" : version.name && version.name !== family.rootProject?.name ? ` - ${version.name}` : ""}
                  </option>
                ))}
              </select>
              <span style={{ padding: "8px 10px", borderRadius: 999, background: "#F8F7FF", color: S.text, fontSize: 11, fontWeight: 700 }}>
                {statusLabel}
              </span>
              {project.id !== family.latestVersion?.id && (
                <span style={{ padding: "8px 10px", borderRadius: 999, background: "#FFF7E8", color: "#A05A00", fontSize: 11, fontWeight: 700 }}>
                  Viewing {selectedLifecycle.label}
                </span>
              )}
            </div>
          </div>
            );
          })()
        ))}
        {title === "Open Narratives" && (
          <button
            onClick={onAddProject}
            style={{
              border: `1px dashed ${P[200]}`,
              background: "rgba(255,255,255,0.78)",
              borderRadius: 24,
              padding: "24px 22px",
              boxShadow: "0 16px 36px rgba(83, 74, 183, 0.05)",
              cursor: "pointer",
              fontFamily: "inherit",
              display: "grid",
              placeItems: "center",
              minHeight: 220,
              color: P[700],
              textAlign: "center",
            }}
          >
            <div style={{ display: "grid", gap: 10, justifyItems: "center" }}>
              <div style={{ width: 58, height: 58, borderRadius: 18, background: P[50], display: "grid", placeItems: "center", fontSize: 32, fontWeight: 500 }}>+</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>Add Project</div>
              <div style={{ fontSize: 13, lineHeight: 1.6, color: S.muted, maxWidth: 180 }}>
                Start another product narrative and add it to your Loop project list.
              </div>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

function ProjectsHubPage({ onOpenLoop, projects, onOpenProject, onAddProject, onDeleteProject, onDownloadProject, onNextVersion }) {
  const [activeTab, setActiveTab] = useState("What Is Loop");
  const [sortBy, setSortBy] = useState("lastModified");
  const visibleProjects = [...projects].sort((a, b) => {
    const left = new Date(a.updatedAt || 0).getTime();
    const right = new Date(b.updatedAt || 0).getTime();
    return right - left;
  });
  const visibleFamilies = groupProjectsIntoFamilies(visibleProjects);
  const sortedFamilies = [...visibleFamilies].sort((left, right) => {
    if (sortBy === "productName") {
      return String(left.rootProject?.name || "").localeCompare(String(right.rootProject?.name || ""));
    }
    if (sortBy === "dateCreated") {
      return (right.createdAt || 0) - (left.createdAt || 0);
    }
    return (right.updatedAt || 0) - (left.updatedAt || 0);
  });
  const closedLoopProjects = sortedFamilies.filter(family => getProjectLifecycle(family.latestVersion || family.rootProject).key === "closed");
  const openNarrativeProjects = sortedFamilies.filter(family => getProjectLifecycle(family.latestVersion || family.rootProject).key !== "closed");
  const shouldShowOpenSection = openNarrativeProjects.length > 0;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #FBFAFF 0%, #F4F3FF 100%)" }}>
      <MainWebsiteHeader onOpenLoop={onOpenLoop} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "72px 28px 64px", display: "grid", gap: 28, justifyItems: "center" }}>
        <div style={{ textAlign: "center", display: "grid", gap: 10, maxWidth: 720 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: P[600], textTransform: "uppercase", letterSpacing: "0.08em" }}>Projects</div>
          <div style={{ fontSize: 44, lineHeight: 1.04, fontWeight: 800, color: P[900], letterSpacing: "-0.05em" }}>
            Choose a project to enter Loop
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.7, color: S.muted }}>
            View your active narrative projects and all saved versions for each product. Select a tile to reopen the exact version you want inside Loop.
          </div>
        </div>
        <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
          <label style={{ display: "grid", gap: 6, minWidth: 220 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: S.muted }}>Sort Projects By</span>
            <select
              value={sortBy}
              onChange={event => setSortBy(event.target.value)}
              style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 14, border: `1px solid ${S.border}`, background: "white", color: S.text, outline: "none", fontFamily: "inherit" }}
            >
              <option value="lastModified">Last Modified</option>
              <option value="dateCreated">Date Created</option>
              <option value="productName">Product Name</option>
            </select>
          </label>
        </div>
        {shouldShowOpenSection ? (
          <ProjectSection
            title="Open Narratives"
            subtitle="Projects still being refined, reviewed, or prepared for launch."
            items={openNarrativeProjects}
            emptyState="No open narratives yet. Generate a new narrative to see it here."
            onOpenProject={onOpenProject}
            onDeleteProject={onDeleteProject}
            onAddProject={onAddProject}
            onDownloadProject={onDownloadProject}
            onNextVersion={onNextVersion}
          />
        ) : (
          <div style={{ width: "100%", display: "grid", gap: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: P[600], textTransform: "uppercase", letterSpacing: "0.08em" }}>Start A New Narrative</div>
            <button
              onClick={onAddProject}
              style={{
                width: "100%",
                border: `1px dashed ${P[200]}`,
                background: "rgba(255,255,255,0.78)",
                borderRadius: 24,
                padding: "24px 22px",
                boxShadow: "0 16px 36px rgba(83, 74, 183, 0.05)",
                cursor: "pointer",
                fontFamily: "inherit",
                display: "grid",
                placeItems: "center",
                color: P[700],
                textAlign: "center",
              }}
            >
              <div style={{ display: "grid", gap: 10, justifyItems: "center" }}>
                <div style={{ width: 58, height: 58, borderRadius: 18, background: P[50], display: "grid", placeItems: "center", fontSize: 32, fontWeight: 500 }}>+</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>Add Project</div>
                <div style={{ fontSize: 13, lineHeight: 1.6, color: S.muted, maxWidth: 220 }}>
                  Start another product narrative and add it to your Loop project list.
                </div>
              </div>
            </button>
          </div>
        )}
        <ProjectSection
          title="Closed Loop Projects"
          subtitle="Projects that reached launch and feedback completion."
          items={closedLoopProjects}
          emptyState="No closed-loop projects yet. Once a project reaches feedback completion, it will appear here."
          onOpenProject={onOpenProject}
          onDeleteProject={onDeleteProject}
          onAddProject={onAddProject}
          onDownloadProject={onDownloadProject}
          onNextVersion={onNextVersion}
        />
      </div>
    </div>
  );
}

function ReviewRoutingPage({
  reviewSections,
  reviewRouting,
  onSelectTeam,
  onAssignSection,
  onRemoveSection,
  onAiAssign,
  onBack,
  onSend,
}) {
  const groupedSections = reviewSections.reduce((groups, section) => {
    groups[section.workspace] = [...(groups[section.workspace] || []), section];
    return groups;
  }, {});
  const activeTeam = reviewRouting.selectedTeam || "Sales";
  const assignedIds = new Set(REVIEW_TEAMS.flatMap(team => reviewRouting.assignments?.[team] || []));
  const activeSections = (reviewRouting.assignments?.[activeTeam] || [])
    .map(id => reviewSections.find(section => section.id === id))
    .filter(Boolean);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #FBFAFF 0%, #F4F3FF 100%)", padding: "42px 28px 56px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gap: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: P[600], textTransform: "uppercase", letterSpacing: "0.08em" }}>Submit For Review</div>
            <div style={{ marginTop: 8, fontSize: 38, fontWeight: 800, color: P[900], letterSpacing: "-0.05em" }}>Route sections before review starts</div>
            <div style={{ marginTop: 10, maxWidth: 760, fontSize: 15, lineHeight: 1.7, color: S.muted }}>
              Loop can suggest which sections belong to Sales, Product, or PMM. You can override the routing before opening the review workspace.
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={onAiAssign} style={{ border: `1px solid ${S.border}`, background: "white", color: P[700], borderRadius: 14, padding: "12px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              AI Assign Sections
            </button>
            <button onClick={onBack} style={{ border: `1px solid ${S.border}`, background: "white", color: S.text, borderRadius: 14, padding: "12px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Back to Workspace
            </button>
            <button onClick={onSend} style={{ border: "none", background: P[600], color: "white", borderRadius: 14, padding: "12px 18px", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
              Send
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "360px minmax(0, 1fr)", gap: 22, alignItems: "start" }}>
          <div style={{ background: "linear-gradient(180deg, #F4F1FF 0%, #EFEAFF 100%)", border: `1px solid ${S.border}`, borderRadius: 26, padding: 20, display: "grid", gap: 16 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: P[900] }}>Section Library</div>
              <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.6, color: S.muted }}>
                All sections remain visible here. Assign any section to a team at any time.
              </div>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              {Object.entries(groupedSections).map(([workspace, sections]) => (
                <div key={workspace} style={{ display: "grid", gap: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: P[600], textTransform: "uppercase", letterSpacing: "0.08em" }}>{workspace}</div>
                  {sections.map(section => {
                    const isAssigned = assignedIds.has(section.id);
                    return (
                      <div
                        key={section.id}
                        draggable
                        onDragStart={event => event.dataTransfer.setData("text/review-section-id", section.id)}
                        style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 16, padding: 14, display: "grid", gap: 10, opacity: isAssigned ? 0.78 : 1 }}
                      >
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: S.text }}>{section.label}</div>
                          <div style={{ marginTop: 4, fontSize: 12, lineHeight: 1.5, color: S.muted }}>
                            Suggested: {section.suggestedTeam}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {REVIEW_TEAMS.map(team => (
                            <button
                              key={team}
                              onClick={() => onAssignSection(section.id, team)}
                              style={{ border: `1px solid ${S.border}`, background: team === section.suggestedTeam ? P[50] : "white", color: team === section.suggestedTeam ? P[700] : S.text, borderRadius: 999, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                            >
                              {team}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 26, padding: 20, display: "grid", gap: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              {REVIEW_TEAMS.map(team => (
                <button
                  key={team}
                  onClick={() => onSelectTeam(team)}
                  style={{ border: team === activeTeam ? "none" : `1px solid ${S.border}`, background: team === activeTeam ? P[600] : "white", color: team === activeTeam ? "white" : P[700], borderRadius: 14, padding: "10px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                >
                  {team} ({reviewRouting.assignments?.[team]?.length || 0})
                </button>
              ))}
              <div style={{ marginLeft: "auto", fontSize: 12, color: S.muted }}>
                For MVP, the same user reviews on behalf of all selected teams.
              </div>
            </div>

            <div
              onDragOver={event => event.preventDefault()}
              onDrop={event => {
                event.preventDefault();
                const sectionId = event.dataTransfer.getData("text/review-section-id");
                if (sectionId) onAssignSection(sectionId, activeTeam);
              }}
              style={{ minHeight: 540, borderRadius: 22, border: `1px dashed ${P[200]}`, background: "linear-gradient(180deg, #FBFAFF 0%, #F7F5FF 100%)", padding: 18, display: "grid", gap: 12, alignContent: "start" }}
            >
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: P[900] }}>{activeTeam} Review Queue</div>
                <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.6, color: S.muted }}>
                  Drop sections here or assign them from the library. These are the sections this team will review.
                </div>
              </div>

              {activeSections.length === 0 ? (
                <div style={{ padding: "18px 16px", borderRadius: 18, background: "white", border: `1px dashed ${S.border}`, fontSize: 13, lineHeight: 1.7, color: S.muted }}>
                  No sections assigned yet. Use AI Assign or move sections here manually.
                </div>
              ) : activeSections.map(section => (
                <div key={section.id} style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 18, padding: 16, display: "grid", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: S.text }}>{section.label}</div>
                      <div style={{ marginTop: 4, fontSize: 12, color: S.muted }}>{section.workspace}</div>
                    </div>
                    <button
                      onClick={() => onRemoveSection(section.id)}
                      style={{ border: `1px solid ${S.border}`, background: "white", color: S.muted, borderRadius: 12, padding: "7px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                    >
                      Remove
                    </button>
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.6, color: S.muted }}>
                    {section.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function _LegacyLandingPage({ onChooseOriginal, onChooseTest, onStartProject, onUpgradeProject, platformMode }) {
  return (
    <div style={{ padding: "40px 28px 56px", background: "linear-gradient(180deg, #F8F7FF 0%, #F4F3FF 100%)" }}>
      <div style={{
        maxWidth: 1320,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.1fr) minmax(340px, 0.9fr)",
        gap: 24,
        alignItems: "stretch",
      }}>
        <div style={{
          background: "linear-gradient(135deg, #FFFFFF 0%, #F1EFFF 100%)",
          border: `1px solid ${S.border}`,
          borderRadius: 28,
          padding: "40px 38px",
          minHeight: 440,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "0 18px 40px rgba(83, 74, 183, 0.08)",
        }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 999, background: P[50], color: P[600], fontSize: 12, fontWeight: 700, marginBottom: 20 }}>
              Loop Platform
            </div>
            <h1 style={{ margin: 0, fontSize: 54, lineHeight: 1.02, letterSpacing: "-0.06em", color: P[900], maxWidth: 760 }}>
              Log in to Loop and move from product truth to launch with one guided workflow.
            </h1>
            <p style={{ margin: "20px 0 0", maxWidth: 640, fontSize: 18, lineHeight: 1.6, color: S.muted }}>
              Loop is the access point for founders, PMM teams, and early GTM operators who need one place to define product truth, build narrative, create launch assets, and close the loop with feedback.
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 28 }}>
              <button
                onClick={onChooseOriginal}
                style={{
                  border: "none",
                  background: platformMode === "original" ? P[600] : "white",
                  color: platformMode === "original" ? "white" : S.text,
                  borderRadius: 14,
                  padding: "14px 20px",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Log In to Loop
              </button>
              <button
                onClick={onChooseTest}
                style={{
                  border: `1px solid ${platformMode === "test" ? P[200] : S.border}`,
                  background: platformMode === "test" ? P[50] : "white",
                  color: platformMode === "test" ? P[700] : S.text,
                  borderRadius: 14,
                  padding: "14px 20px",
                  fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Load Test Workspace
            </button>
            <div style={{ display: "inline-flex", alignItems: "center", padding: "14px 16px", borderRadius: 14, background: "white", border: `1px solid ${S.border}`, fontSize: 14, color: S.text }}>
              Sign in → Start Project → Build in Loop
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 18 }}>
          <div style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 24, padding: 24, boxShadow: "0 12px 28px rgba(83, 74, 183, 0.06)", display: "grid", gap: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: P[600], textTransform: "uppercase", letterSpacing: "0.08em" }}>Choose Platform</div>
            <div style={{ fontSize: 26, lineHeight: 1.12, fontWeight: 800, color: P[900] }}>Access the Loop platform</div>
            <div style={{ fontSize: 14, lineHeight: 1.6, color: S.muted }}>
              Choose whether you want the classic Loop workspace or the guided test platform, then start your single supported MVP project.
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={onChooseOriginal}
                style={{ border: "none", background: platformMode === "original" ? P[600] : "white", color: platformMode === "original" ? "white" : S.text, borderRadius: 12, padding: "12px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flex: 1, minWidth: 150 }}
              >
                Open Original Platform
              </button>
              <button
                onClick={onChooseTest}
                style={{ border: `1px solid ${platformMode === "test" ? P[200] : S.border}`, background: platformMode === "test" ? P[50] : "white", color: platformMode === "test" ? P[700] : S.text, borderRadius: 12, padding: "12px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flex: 1, minWidth: 150 }}
              >
                Open Test Platform
              </button>
            </div>
            <div style={{ padding: "14px 16px", borderRadius: 16, background: S.bg, border: `1px solid ${S.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: S.text, marginBottom: 4 }}>What changes between the two modes</div>
              <div style={{ fontSize: 13, lineHeight: 1.55, color: S.muted }}>
                Original Platform keeps the classic workspace structure. Test Platform adds guided workflow steps, seeded sample data, CTA-driven progression, and automated feedback loops for MVP evaluation.
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <button
                onClick={onStartProject}
                style={{ textAlign: "left", border: `1px solid ${S.border}`, background: "white", borderRadius: 18, padding: 18, cursor: "pointer", fontFamily: "inherit" }}
              >
                <div style={{ fontSize: 12, fontWeight: 800, color: P[600], textTransform: "uppercase", letterSpacing: "0.08em" }}>Project Access</div>
                <div style={{ marginTop: 10, fontSize: 20, fontWeight: 800, color: P[900] }}>Start Project</div>
                <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.55, color: S.muted }}>
                  Create your one supported MVP product and enter the platform.
                </div>
              </button>
              <button
                onClick={onUpgradeProject}
                style={{ textAlign: "left", border: `1px solid ${S.border}`, background: S.bg, borderRadius: 18, padding: 18, cursor: "pointer", fontFamily: "inherit" }}
              >
                <div style={{ fontSize: 12, fontWeight: 800, color: P[600], textTransform: "uppercase", letterSpacing: "0.08em" }}>Upgrade</div>
                <div style={{ marginTop: 10, fontSize: 20, fontWeight: 800, color: P[900] }}>Start Another Project</div>
                <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.55, color: S.muted }}>
                  MVP supports one product only. Upgrade to Plus to manage multiple projects.
                </div>
              </button>
            </div>
          </div>

          <div style={{ background: "linear-gradient(135deg, #534AB7 0%, #7F77DD 100%)", borderRadius: 24, padding: 24, color: "white", minHeight: 160, display: "grid", gap: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.78 }}>Loop Access</div>
            <div style={{ fontSize: 24, lineHeight: 1.2, fontWeight: 700, maxWidth: 360 }}>
              This is the main Loop page where a user chooses the original workspace or the guided test platform.
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={onStartProject}
                style={{
                  border: "none",
                  background: "white",
                  color: P[600],
                  borderRadius: 12,
                  padding: "12px 16px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Start Project
              </button>
              <button
                onClick={onUpgradeProject}
                style={{
                  border: "1px solid rgba(255,255,255,0.34)",
                  background: "rgba(255,255,255,0.1)",
                  color: "white",
                  borderRadius: 12,
                  padding: "12px 16px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Upgrade to Plus
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LandingPage({ onStartProject }) {
  return (
    <div style={{ padding: "48px 28px 72px", background: "linear-gradient(180deg, #F8F7FF 0%, #F4F3FF 100%)", minHeight: "calc(100vh - 73px)" }}>
      <div style={{ maxWidth: 980, margin: "0 auto", minHeight: "calc(100vh - 169px)", display: "grid", placeItems: "center" }}>
        <div style={{ width: "100%", maxWidth: 760, background: "linear-gradient(135deg, #FFFFFF 0%, #F1EFFF 100%)", border: `1px solid ${S.border}`, borderRadius: 34, padding: "54px 52px", minHeight: 380, display: "grid", placeItems: "center", textAlign: "center", boxShadow: "0 24px 54px rgba(83, 74, 183, 0.1)" }}>
          <div style={{ display: "grid", gap: 20, justifyItems: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 999, background: P[50], color: P[600], fontSize: 12, fontWeight: 700 }}>
              Loop Landing
            </div>
            <h1 style={{ margin: 0, fontSize: 62, lineHeight: 0.96, letterSpacing: "-0.08em", color: P[900], maxWidth: 620 }}>
              Start Project
            </h1>
            <p style={{ margin: 0, maxWidth: 560, fontSize: 17, lineHeight: 1.75, color: S.muted }}>
              Workflow starts here. Create a test project, walk through the Loop MVP, and then revisit all started test projects inside the Test Platform view in Loop.
            </p>
            <button
              onClick={onStartProject}
              style={{ border: "none", background: P[600], color: "white", borderRadius: 22, padding: "22px 34px", fontSize: 26, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 18px 36px rgba(83, 74, 183, 0.24)" }}
            >
              Start Project
            </button>
            <div style={{ fontSize: 13, lineHeight: 1.7, color: S.muted }}>
              The Loop header tab opens the original platform. Test Platform inside Loop is where started test projects live.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectSetupPage({ pd, setPd, onSaveProject, onBack, platformMode, versionDraft, onVersionModeChange }) {
  const isVersionFlow = !!versionDraft?.sourceProjectId;
  const versionMode = versionDraft?.mode || "minor";
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #FBFAFF 0%, #F4F3FF 100%)", padding: "42px 28px 56px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gap: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: P[600], textTransform: "uppercase", letterSpacing: "0.08em" }}>{isVersionFlow ? "Build Next Version" : "Start Project"}</div>
            <div style={{ marginTop: 8, fontSize: 38, fontWeight: 800, color: P[900], letterSpacing: "-0.05em" }}>{isVersionFlow ? "Create the next version of this narrative" : "Create your first Loop project"}</div>
            <div style={{ marginTop: 10, maxWidth: 760, fontSize: 15, lineHeight: 1.7, color: S.muted }}>
              {isVersionFlow
                ? "Choose whether this is a minor or major change, update the product info, and tell Loop what changed before continuing into the next version."
                : `Add the product information that appears in the Loop platform header. Once saved, you will be taken directly into the ${platformMode === "test" ? "Test Platform" : "Original Platform"} workspace.`}
            </div>
          </div>
          <button
            onClick={onBack}
            style={{ border: `1px solid ${S.border}`, background: "white", color: S.text, borderRadius: 12, padding: "12px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
          >
            Back
          </button>
        </div>

        <div style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 26, overflow: "hidden", boxShadow: "0 18px 40px rgba(83, 74, 183, 0.08)" }}>
          <div style={{ padding: "24px 26px", borderBottom: `1px solid ${S.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: P[600], textTransform: "uppercase", letterSpacing: "0.08em" }}>Header Preview</div>
              <div style={{ marginTop: 10, fontSize: 26, fontWeight: 800, color: P[900] }}>{pd.name || "Product Name"}</div>
            </div>
            <div style={{ fontSize: 13, color: S.muted }}>
              {platformMode === "test" ? "Test Platform" : "Original Platform"}
            </div>
          </div>
          <div style={{ padding: 26, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
            {isVersionFlow && (
              <>
                <label style={{ display: "grid", gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: S.muted }}>Version Type</span>
                  <select value={versionMode} onChange={e => onVersionModeChange?.(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 14, border: `1px solid ${S.border}`, background: S.bg, color: S.text, outline: "none", fontFamily: "inherit" }}>
                    <option value="minor">Minor Change</option>
                    <option value="major">Major Change</option>
                  </select>
                </label>
                <label style={{ display: "grid", gap: 8, gridColumn: "1 / -1" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: S.muted }}>What Changed</span>
                  <textarea value={pd.whatChanged || ""} onChange={e => setPd(prev => ({ ...prev, whatChanged: e.target.value }))} placeholder="Describe what changed in the product, audience, market, or positioning for this next version." rows={4} style={{ width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 14, border: `1px solid ${S.border}`, background: S.bg, color: S.text, outline: "none", fontFamily: "inherit", resize: "vertical" }} />
                </label>
              </>
            )}
            <label style={{ display: "grid", gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: S.muted }}>Product Name</span>
              <input value={pd.name} onChange={e => setPd(prev => ({ ...prev, name: e.target.value }))} placeholder="Loop AI Launch Pilot" style={{ width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 14, border: `1px solid ${S.border}`, background: S.bg, color: S.text, outline: "none", fontFamily: "inherit" }} />
            </label>
            <label style={{ display: "grid", gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: S.muted }}>One-line description</span>
              <input value={pd.description} onChange={e => setPd(prev => ({ ...prev, description: e.target.value }))} placeholder="Narrative operating system for launches" style={{ width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 14, border: `1px solid ${S.border}`, background: S.bg, color: S.text, outline: "none", fontFamily: "inherit" }} />
            </label>
            <label style={{ display: "grid", gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: S.muted }}>Launch date</span>
              <input type="date" value={pd.launchDate} onChange={e => setPd(prev => ({ ...prev, launchDate: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 14, border: `1px solid ${S.border}`, background: S.bg, color: S.text, outline: "none", fontFamily: "inherit" }} />
            </label>
            <label style={{ display: "grid", gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: S.muted }}>Version</span>
              <input value={pd.version} onChange={e => setPd(prev => ({ ...prev, version: e.target.value }))} placeholder="v1.0" style={{ width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 14, border: `1px solid ${S.border}`, background: S.bg, color: S.text, outline: "none", fontFamily: "inherit" }} />
            </label>
            <label style={{ display: "grid", gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: S.muted }}>Status</span>
              <select value={pd.status} onChange={e => setPd(prev => ({ ...prev, status: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 14, border: `1px solid ${S.border}`, background: S.bg, color: S.text, outline: "none", fontFamily: "inherit" }}>
                <option>Planned</option>
                <option>Started</option>
                <option>Work-In-Progress</option>
                <option>ready</option>
                <option>live</option>
              </select>
            </label>
          </div>
          <div style={{ padding: "0 26px 26px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: S.muted }}>
              {isVersionFlow
                ? versionMode === "minor"
                  ? "Minor Change keeps the previous workspace content and opens a duplicated next-version workspace so you can update it."
                  : "Major Change reuses the prior product info, adds what changed, and lets Loop regenerate the next version from the updated context."
                : "MVP supports one product project. You can create more versions inside Loop, but additional projects require an upgrade."}
            </div>
            <button
              onClick={onSaveProject}
              style={{ border: "none", background: P[600], color: "white", borderRadius: 14, padding: "13px 18px", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}
            >
              {isVersionFlow ? "Build Next Version" : "Save Project and Enter Loop"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BrandGuidelinePage({ brand, setBrand }) {
  const toneOptions = ["Professional", "Friendly", "Bold", "Minimalist", "Playful", "Technical", "Empathetic"];
  const fontOptions = ["Sora", "Space Grotesk", "DM Sans", "Manrope", "Outfit", "Merriweather"];

  const toggleTone = tone => {
    setBrand(prev => ({
      ...prev,
      tones: prev.tones.includes(tone) ? prev.tones.filter(item => item !== tone) : [...prev.tones, tone],
    }));
  };

  const updateColor = (index, key, value) => {
    setBrand(prev => ({
      ...prev,
      colors: prev.colors.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)),
    }));
  };

  const addColor = () => {
    setBrand(prev => ({
      ...prev,
      colors: [...prev.colors, { label: `Color ${prev.colors.length + 1}`, value: "#F7B8D8" }],
    }));
  };

  return (
    <div style={{ padding: "34px 28px 56px", background: "linear-gradient(180deg, #FBFAFF 0%, #F4F3FF 100%)" }}>
      <div style={{ maxWidth: 1360, margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0, 1.15fr) 340px", gap: 22, alignItems: "start" }}>
        <div style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #FCFBFF 100%)", border: `1px solid ${S.border}`, borderRadius: 28, overflow: "hidden", boxShadow: "0 18px 44px rgba(83, 74, 183, 0.08)" }}>
          <div style={{ padding: "28px 30px 18px", borderBottom: `1px solid ${S.border}`, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #D9D5FF 0%, #F8D8E8 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: P[800] }}>
              ◇
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 32, lineHeight: 1.05, letterSpacing: "-0.04em", color: P[900] }}>Brand Guidelines</h1>
              <p style={{ margin: "6px 0 0", fontSize: 15, color: S.muted }}>Identity and voice of your product, shaped into a calm, usable system.</p>
            </div>
          </div>

          <div style={{ padding: 30, display: "grid", gap: 24 }}>
            <div style={{ background: "linear-gradient(135deg, #F6F3FF 0%, #FFF6FB 100%)", border: `1px solid ${S.border}`, borderRadius: 22, padding: 22 }}>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 260px", gap: 18, alignItems: "start" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Brand Tagline</div>
                  <input
                    value={brand.tagline}
                    onChange={e => setBrand(prev => ({ ...prev, tagline: e.target.value }))}
                    placeholder="Your brand's memorable phrase..."
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "14px 16px",
                      borderRadius: 16,
                      border: `1px solid ${S.border}`,
                      background: "white",
                      fontSize: 18,
                      color: S.text,
                      outline: "none",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
                <div style={{ background: "rgba(255,255,255,0.75)", border: `1px solid ${S.border}`, borderRadius: 18, padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Live Snapshot</div>
                  <div style={{ fontSize: 22, lineHeight: 1.2, fontWeight: 700, color: P[900] }}>{brand.tagline || "Your brand phrase lives here."}</div>
                  <div style={{ marginTop: 10, fontSize: 13, lineHeight: 1.55, color: S.muted }}>
                    {brand.tones.length ? `${brand.tones.slice(0, 3).join(" • ")} voice` : "Choose a tone profile to shape how the brand feels."}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: 22, alignItems: "start" }}>
              <div style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 22, padding: 22 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Tone of Voice</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  {toneOptions.map(tone => {
                    const active = brand.tones.includes(tone);
                    return (
                      <button
                        key={tone}
                        onClick={() => toggleTone(tone)}
                        style={{
                          border: `1px solid ${active ? P[400] : S.border}`,
                          background: active ? P[50] : "white",
                          color: active ? P[700] : S.muted,
                          borderRadius: 999,
                          padding: "10px 14px",
                          fontSize: 14,
                          fontWeight: active ? 700 : 500,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          boxShadow: active ? "0 6px 18px rgba(127, 119, 221, 0.12)" : "none",
                        }}
                      >
                        {tone}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ background: "linear-gradient(135deg, #FFF9ED 0%, #FFF1D6 100%)", border: `1px solid #F2D7A7`, borderRadius: 22, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#A76B00", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Voice Feel</div>
                <div style={{ fontSize: 15, lineHeight: 1.7, color: "#7A5A1A" }}>
                  {brand.tones.length ? `This brand feels ${brand.tones.join(", ").toLowerCase()}.` : "Select 2-4 tones to define how the brand should sound across touchpoints."}
                </div>
              </div>
            </div>

            <div style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 22, padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>Color Palette</div>
                <button
                  onClick={addColor}
                  style={{
                    border: `1px dashed ${P[200]}`,
                    background: P[50],
                    color: P[600],
                    borderRadius: 12,
                    padding: "8px 14px",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  + Add
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
                {brand.colors.map((color, index) => (
                  <div key={`${color.label}-${index}`} style={{ display: "grid", gridTemplateColumns: "40px minmax(0, 1fr) 120px", gap: 10, alignItems: "center", padding: 12, borderRadius: 16, background: S.bg, border: `1px solid ${S.border}` }}>
                    <input
                      type="color"
                      value={color.value}
                      onChange={e => updateColor(index, "value", e.target.value)}
                      style={{ width: 40, height: 40, border: "none", background: "transparent", padding: 0, cursor: "pointer" }}
                    />
                    <input
                      value={color.label}
                      onChange={e => updateColor(index, "label", e.target.value)}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: `1px solid ${S.border}`,
                        background: "white",
                        fontSize: 14,
                        color: S.text,
                        outline: "none",
                        fontFamily: "inherit",
                      }}
                    />
                    <div style={{ fontSize: 13, fontWeight: 700, color: S.muted }}>{color.value.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 22 }}>
              <div style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 22, padding: 22 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Heading Font</div>
                <select
                  value={brand.headingFont}
                  onChange={e => setBrand(prev => ({ ...prev, headingFont: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 16,
                    border: `1px solid ${S.border}`,
                    background: S.bg,
                    fontSize: 16,
                    color: S.text,
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                >
                  {fontOptions.map(option => <option key={option}>{option}</option>)}
                </select>
              </div>
              <div style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 22, padding: 22 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Body Font</div>
                <select
                  value={brand.bodyFont}
                  onChange={e => setBrand(prev => ({ ...prev, bodyFont: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 16,
                    border: `1px solid ${S.border}`,
                    background: S.bg,
                    fontSize: 16,
                    color: S.text,
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                >
                  {fontOptions.map(option => <option key={option}>{option}</option>)}
                </select>
              </div>
            </div>

            <div style={{ background: "linear-gradient(135deg, #F7F4FF 0%, #FFFFFF 100%)", border: `1px solid ${S.border}`, borderRadius: 22, padding: 22 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Logo</div>
              <label style={{ display: "grid", placeItems: "center", minHeight: 124, borderRadius: 18, border: `2px dashed ${P[200]}`, background: "rgba(255,255,255,0.8)", color: P[600], fontSize: 18, fontWeight: 600, cursor: "pointer" }}>
                <input type="file" accept=".png,.svg,.jpg,.jpeg" style={{ display: "none" }} onChange={e => setBrand(prev => ({ ...prev, logoName: e.target.files?.[0]?.name || "" }))} />
                <div style={{ textAlign: "center" }}>
                  <div>{brand.logoName || "Click to upload logo"}</div>
                  <div style={{ marginTop: 8, fontSize: 13, fontWeight: 500, color: S.muted }}>PNG, SVG, JPG</div>
                </div>
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 22 }}>
              <div style={{ background: "linear-gradient(135deg, #ECFFF3 0%, #F8FFFB 100%)", border: "1px solid #BFE8CF", borderRadius: 22, padding: 22 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#1A8D4B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Do's</div>
                <textarea
                  value={brand.dos}
                  onChange={e => setBrand(prev => ({ ...prev, dos: e.target.value }))}
                  placeholder="e.g. Use active voice, lead with benefits..."
                  rows={6}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px 14px",
                    borderRadius: 16,
                    border: "1px solid #BFE8CF",
                    background: "rgba(255,255,255,0.82)",
                    fontSize: 15,
                    color: "#2D6841",
                    outline: "none",
                    resize: "vertical",
                    fontFamily: "inherit",
                    lineHeight: 1.6,
                  }}
                />
              </div>
              <div style={{ background: "linear-gradient(135deg, #FFF1F4 0%, #FFF9FA 100%)", border: "1px solid #F3C0CB", borderRadius: 22, padding: 22 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#D14363", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Don'ts</div>
                <textarea
                  value={brand.donts}
                  onChange={e => setBrand(prev => ({ ...prev, donts: e.target.value }))}
                  placeholder="e.g. Avoid jargon, never use passive voice..."
                  rows={6}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px 14px",
                    borderRadius: 16,
                    border: "1px solid #F3C0CB",
                    background: "rgba(255,255,255,0.82)",
                    fontSize: 15,
                    color: "#8F3C52",
                    outline: "none",
                    resize: "vertical",
                    fontFamily: "inherit",
                    lineHeight: 1.6,
                  }}
                />
              </div>
            </div>

            <div style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 22, padding: 22 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Legal Constraints</div>
              <textarea
                value={brand.legal}
                onChange={e => setBrand(prev => ({ ...prev, legal: e.target.value }))}
                placeholder="Trademarks, compliance requirements, restricted terminology..."
                rows={4}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 14px",
                  borderRadius: 16,
                  border: `1px solid ${S.border}`,
                  background: S.bg,
                  fontSize: 15,
                  color: S.text,
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit",
                  lineHeight: 1.6,
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 18 }}>
          <div style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 24, padding: 22, boxShadow: "0 12px 30px rgba(83, 74, 183, 0.06)" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: P[600], textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Brand Preview</div>
            <div style={{ borderRadius: 20, padding: 22, background: `linear-gradient(135deg, ${brand.colors[0]?.value || "#7F77DD"} 0%, ${brand.colors[1]?.value || "#F3C6E8"} 100%)`, color: "white", minHeight: 220 }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.82 }}>Loop Brand</div>
              <div style={{ marginTop: 16, fontSize: 30, lineHeight: 1.1, fontWeight: 800 }}>{brand.tagline || "Your memorable phrase appears here."}</div>
              <div style={{ marginTop: 14, fontSize: 14, lineHeight: 1.6, opacity: 0.9 }}>
                {brand.tones.length ? `Tone: ${brand.tones.join(", ")}` : "Choose a tone mix to preview the brand personality."}
              </div>
            </div>
          </div>

          <div style={{ background: "linear-gradient(135deg, #FFF7E8 0%, #FFFDF5 100%)", border: "1px solid #F0DFC0", borderRadius: 24, padding: 22 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#AE7B10", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>System Check</div>
            <div style={{ display: "grid", gap: 10 }}>
              {[
                ["Tagline", !!brand.tagline],
                ["Tone Profile", brand.tones.length > 0],
                ["Palette", brand.colors.length >= 2],
                ["Typography", !!brand.headingFont && !!brand.bodyFont],
                ["Usage Guidance", !!brand.dos || !!brand.donts],
              ].map(([label, complete]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, color: S.text }}>
                  <span>{label}</span>
                  <span style={{ color: complete ? "#1A8D4B" : "#C38B21", fontWeight: 700 }}>{complete ? "Ready" : "Needs input"}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 24, padding: 22 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: P[600], textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Quick Reminders</div>
            <div style={{ display: "grid", gap: 10 }}>
              {[
                "Keep the tone choices focused so the voice stays consistent.",
                "Use two to four core colors to avoid visual noise.",
                "Make the tagline short enough to remember and flexible enough to reuse.",
              ].map(note => (
                <div key={note} style={{ padding: "12px 14px", borderRadius: 16, background: S.bg, border: `1px solid ${S.border}`, fontSize: 14, lineHeight: 1.55, color: S.muted }}>
                  {note}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoPage({ title, eyebrow, description }) {
  return (
    <div style={{ padding: "40px 28px 56px" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div style={{
          background: "linear-gradient(135deg, #FFFFFF 0%, #F1EFFF 100%)",
          border: `1px solid ${S.border}`,
          borderRadius: 28,
          padding: "36px 34px",
          minHeight: 320,
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: P[600], textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>{eyebrow}</div>
          <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1.08, letterSpacing: "-0.05em", color: P[900] }}>{title}</h1>
          <p style={{ margin: "16px 0 0", maxWidth: 760, fontSize: 17, lineHeight: 1.65, color: S.muted }}>{description}</p>
        </div>
      </div>
    </div>
  );
}

function WorkspaceAIPanel({
  collapsed,
  onToggle,
  activeLabel,
  activeSummary,
  aiTab,
  setAiTab,
  quickActions,
  onRunQuickAction,
  reviewItems,
  onOpenSection,
  onMarkReviewed,
  askPrompt,
  setAskPrompt,
  onAsk,
  askOutput,
  askLoading,
  chatDocked = false,
  showChat = true,
}) {
  const [contextCollapsed, setContextCollapsed] = useState(false);
  const tabs = [
    { id: "changes", label: "Changes", count: reviewItems.length },
    { id: "review", label: "Review", count: reviewItems.filter(item => item.severity === "review").length },
  ];
  const panelBodyPadding = chatDocked ? 16 : 0;
  const conversationCard = (
    <div
      style={{
        display: "grid",
        gridTemplateRows: chatDocked ? "minmax(0, 1fr) auto" : "auto auto",
        height: chatDocked ? "100%" : "auto",
        minHeight: 0,
        overflow: "hidden",
        background: "white",
        border: chatDocked ? "none" : `1px solid ${S.border}`,
        borderRadius: chatDocked ? 0 : 18,
      }}
    >
      <div style={{ minHeight: 0, overflowY: chatDocked ? "auto" : "visible", padding: "16px 16px 14px", display: "grid", gap: 10, alignContent: "start" }}>
        {!askOutput && (
          <div style={{ padding: "16px 16px", borderRadius: 16, background: S.bg, border: `1px solid ${S.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>AI Conversation</div>
            <div style={{ fontSize: 13, lineHeight: 1.7, color: S.muted }}>
              Ask AI about the current section, request refinements, or pressure-test the narrative from here.
            </div>
          </div>
        )}
        {askOutput && (
          <>
            <div style={{ justifySelf: "start", maxWidth: "96%", padding: "14px 14px", borderRadius: "18px 18px 18px 6px", background: S.bg, border: `1px solid ${S.border}` }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>AI Conversation</div>
              <div style={{ fontSize: 13, lineHeight: 1.7, color: S.muted }}>
                Ask AI about the current section, request refinements, or pressure-test the narrative from here.
              </div>
            </div>
            <div style={{ justifySelf: "end", maxWidth: "92%", padding: "12px 14px", borderRadius: "18px 18px 6px 18px", background: P[50], border: `1px solid ${S.border}`, fontSize: 13, lineHeight: 1.6, color: P[800] }}>
              {askPrompt}
            </div>
            <div style={{ justifySelf: "start", maxWidth: "96%", padding: "14px 14px", borderRadius: "18px 18px 18px 6px", background: "white", border: `1px solid ${S.border}`, fontSize: 13, lineHeight: 1.7, color: S.text }}>
              {askOutput}
            </div>
          </>
        )}
      </div>

      <div style={{ flexShrink: 0, borderTop: `1px solid ${S.border}`, padding: "14px 16px calc(18px + env(safe-area-inset-bottom, 0px))", background: "white" }}>
        <div style={{ display: "grid", gap: 10 }}>
          <textarea
            value={askPrompt}
            onChange={e => setAskPrompt(e.target.value)}
            placeholder={`Ask AI about ${activeLabel.toLowerCase()}...`}
            rows={4}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "14px 14px",
              borderRadius: 16,
              border: `1px solid ${S.border}`,
              background: S.bg,
              fontSize: 14,
              lineHeight: 1.65,
              color: S.text,
              outline: "none",
              resize: "none",
              fontFamily: "inherit",
            }}
          />
          <button onClick={onAsk} disabled={askLoading || !askPrompt.trim()} style={{ border: "none", background: P[600], color: "white", borderRadius: 12, padding: "12px 14px", fontSize: 13, fontWeight: 700, cursor: askLoading || !askPrompt.trim() ? "default" : "pointer", opacity: askLoading || !askPrompt.trim() ? 0.55 : 1, fontFamily: "inherit" }}>
            {askLoading ? "Thinking..." : "Ask AI"}
          </button>
        </div>
      </div>
    </div>
  );

  if (collapsed) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, height: "100%", padding: "18px 10px", background: "linear-gradient(180deg, #FFFFFF 0%, #FCFBFF 100%)", borderLeft: `1px solid ${S.border}` }}>
        <button
          onClick={onToggle}
          aria-label="Expand AI assistant"
          style={{ width: 44, height: 44, borderRadius: 16, border: `1px solid ${S.border}`, background: "#F6F3FF", color: P[700], cursor: "pointer", fontSize: 16, fontWeight: 800, fontFamily: "inherit", boxShadow: "0 12px 24px rgba(83, 74, 183, 0.08)" }}
        >
          ✦
        </button>
        <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", color: P[700], textTransform: "uppercase" }}>
          AI Assistant
        </div>
        <div style={{ minWidth: 26, height: 26, borderRadius: 999, background: "#FFF7E8", color: "#D97706", fontSize: 11, fontWeight: 800, display: "grid", placeItems: "center" }}>
          {reviewItems.length}
        </div>
      </div>
    );
  }

  return (
    <>
    <div style={{ display: "flex", flexDirection: "column", minWidth: 0, height: chatDocked ? "100%" : "auto", minHeight: 0, background: "white", borderLeft: chatDocked ? `1px solid ${S.border}` : "none", overflow: "hidden" }}>
      <div style={{ background: "white", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ padding: "18px 18px 16px", borderBottom: `1px solid ${S.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, background: "linear-gradient(180deg, #FFFFFF 0%, #FCFBFF 100%)" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: P[900] }}>AI Assistant</div>
            <div style={{ marginTop: 4, fontSize: 12, color: S.muted }}>Selection-aware guidance for the current workspace.</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 999, background: P[50], color: P[600], fontSize: 12, fontWeight: 700 }}>
              {reviewItems.length} open
            </div>
            <button
              onClick={onToggle}
              aria-label="Collapse AI assistant"
              style={{ width: 34, height: 34, borderRadius: 12, border: `1px solid ${S.border}`, background: "white", color: S.muted, cursor: "pointer", fontSize: 13, fontWeight: 800, fontFamily: "inherit" }}
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: panelBodyPadding, minHeight: 0, flex: 1, overflow: chatDocked ? "hidden" : "visible", background: chatDocked ? "transparent" : S.bg }}>
        <div
          style={{
            display: "grid",
            gridTemplateRows: showChat ? (chatDocked ? "auto minmax(280px, 1fr)" : "auto auto") : "auto",
            minHeight: 0,
            height: chatDocked ? "100%" : "auto",
            border: `1px solid ${S.border}`,
            borderRadius: 18,
            overflow: "hidden",
            background: "white",
            boxShadow: "0 14px 40px rgba(38, 33, 92, 0.08)",
            gap: chatDocked ? 0 : 14,
          }}
        >
          <div style={{ overflow: "hidden", borderBottom: `1px solid ${S.border}` }}>
            <button
              onClick={() => setContextCollapsed(v => !v)}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                border: "none",
                background: "#FCFBFF",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>Workspace Context</div>
                <div style={{ marginTop: 4, fontSize: 13, color: S.muted }}>Focus, suggested updates, and quick actions</div>
                {contextCollapsed && (
                  <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 999, background: P[50], border: `1px solid ${S.border}`, color: P[700], fontSize: 11, fontWeight: 800 }}>
                      Changes ({reviewItems.length})
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 999, background: "#FFF7E8", border: "1px solid #F3D48C", color: "#D97706", fontSize: 11, fontWeight: 800 }}>
                      Review ({reviewItems.filter(item => item.severity === "review").length})
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 999, background: "#EEF8FF", border: "1px solid #BFDBFE", color: "#1D4ED8", fontSize: 11, fontWeight: 800 }}>
                      Updates
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 999, background: "#F6F3FF", border: `1px solid ${S.border}`, color: P[700], fontSize: 11, fontWeight: 800 }}>
                      Actions ({quickActions.length})
                    </span>
                  </div>
                )}
              </div>
              <span style={{ fontSize: 11, color: S.muted, transform: contextCollapsed ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 120ms ease" }}>▾</span>
            </button>

            {!contextCollapsed && (
              <div style={{ padding: 16, display: "grid", gap: 14, maxHeight: "38vh", overflowY: "auto" }}>
                <div style={{ padding: "14px 14px", borderRadius: 16, background: "linear-gradient(135deg, #F7F4FF 0%, #FFF9FC 100%)", border: `1px solid ${S.border}` }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>Current Focus</div>
                  <div style={{ marginTop: 8, fontSize: 16, fontWeight: 700, color: P[900] }}>{activeLabel}</div>
                  <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.6, color: S.muted }}>{activeSummary || "Select a section to see AI guidance, review flags, and suggested updates."}</div>
                </div>

                <div style={{ padding: "14px 14px", borderRadius: 16, background: "white", border: `1px solid ${S.border}` }}>
                  <div style={{ paddingBottom: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {tabs.map(tab => {
                      const active = aiTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setAiTab(tab.id)}
                          style={{
                            border: `1px solid ${active ? P[200] : S.border}`,
                            background: active ? P[50] : "white",
                            color: active ? P[700] : S.muted,
                            borderRadius: 999,
                            padding: "8px 12px",
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          {tab.label}{typeof tab.count === "number" ? ` (${tab.count})` : ""}
                        </button>
                      );
                    })}
                  </div>

                  {aiTab === "changes" && (
                    <div style={{ display: "grid", gap: 14 }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Suggested Updates</div>
                        <div style={{ display: "grid", gap: 10 }}>
                          {reviewItems.length === 0 && (
                            <div style={{ padding: "14px 14px", borderRadius: 16, background: S.bg, border: `1px solid ${S.border}`, fontSize: 13, color: S.muted }}>
                              No narrative drift detected right now. The workspace looks aligned.
                            </div>
                          )}
                          {reviewItems.map(item => (
                            <div key={item.id} style={{ padding: "14px 14px", borderRadius: 16, background: "white", border: `1px solid ${S.border}` }}>
                              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                                <div>
                                  <div style={{ fontSize: 14, fontWeight: 700, color: P[900] }}>{item.title}</div>
                                  <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.6, color: S.muted }}>{item.body}</div>
                                </div>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 999, background: item.severity === "review" ? "#FFF7E8" : "#EEF8FF", color: item.severity === "review" ? "#D97706" : "#1D4ED8", fontSize: 11, fontWeight: 800 }}>
                                  {item.severity === "review" ? "Review needed" : "Suggested"}
                                </span>
                              </div>
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                                <button onClick={() => onOpenSection(item.target)} style={{ border: "none", background: P[600], color: "white", borderRadius: 10, padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                                  Open {item.targetLabel}
                                </button>
                                <button onClick={() => onMarkReviewed(item.id)} style={{ border: `1px solid ${S.border}`, background: "white", color: S.text, borderRadius: 10, padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                                  Mark reviewed
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Quick Actions</div>
                        <div style={{ display: "grid", gap: 8 }}>
                          {quickActions.map(action => (
                            <button
                              key={action.id}
                              onClick={() => onRunQuickAction(action)}
                              style={{
                                border: `1px solid ${S.border}`,
                                background: S.bg,
                                color: S.text,
                                borderRadius: 12,
                                padding: "10px 12px",
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: "pointer",
                                fontFamily: "inherit",
                                textAlign: "left",
                              }}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {aiTab === "review" && (
                    <div style={{ display: "grid", gap: 10 }}>
                      {reviewItems.filter(item => item.severity === "review").length === 0 && (
                        <div style={{ padding: "14px 14px", borderRadius: 16, background: S.bg, border: `1px solid ${S.border}`, fontSize: 13, color: S.muted }}>
                          Nothing urgent needs review right now.
                        </div>
                      )}
                      {reviewItems.filter(item => item.severity === "review").map(item => (
                        <div key={item.id} style={{ padding: "14px 14px", borderRadius: 16, background: "#FFF9EF", border: "1px solid #F3D48C" }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: P[900] }}>{item.title}</div>
                          <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.6, color: S.muted }}>{item.body}</div>
                          <button onClick={() => onOpenSection(item.target)} style={{ marginTop: 10, border: "none", background: "#F59E0B", color: "white", borderRadius: 10, padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                            Review in {item.targetLabel}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {showChat && (
            <div style={{ minHeight: 0, borderTop: chatDocked ? "none" : `1px solid ${S.border}` }}>
              {conversationCard}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

function AskAIRail({
  collapsed,
  onToggle,
  activeLabel,
  askPrompt,
  setAskPrompt,
  onAsk,
  askOutput,
  askLoading,
}) {
  if (collapsed) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, height: "100%", padding: "16px 10px", background: "white", borderLeft: `1px solid ${S.border}` }}>
        <button
          onClick={onToggle}
          aria-label="Expand Ask AI"
          style={{ width: 42, height: 42, borderRadius: 14, border: `1px solid ${S.border}`, background: "#F6F3FF", color: P[700], cursor: "pointer", fontSize: 16, fontWeight: 800, fontFamily: "inherit" }}
        >
          ✎
        </button>
        <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", color: P[700], textTransform: "uppercase" }}>
          Ask AI
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", width: 320, flexShrink: 0, background: "white", borderLeft: `1px solid ${S.border}`, minHeight: 0 }}>
      <div style={{ padding: "16px 18px", borderBottom: `1px solid ${S.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: P[900] }}>Ask AI</div>
          <div style={{ marginTop: 4, fontSize: 12, color: S.muted }}>{activeLabel}</div>
        </div>
        <button
          onClick={onToggle}
          aria-label="Collapse Ask AI"
          style={{ width: 34, height: 34, borderRadius: 12, border: `1px solid ${S.border}`, background: "white", color: S.muted, cursor: "pointer", fontSize: 13, fontWeight: 800, fontFamily: "inherit" }}
        >
          →
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateRows: "minmax(0, 1fr) auto", minHeight: 0, flex: 1 }}>
        <div style={{ minHeight: 0, overflowY: "auto", padding: "16px 16px 14px", display: "grid", gap: 10, alignContent: "start", background: S.bg }}>
          {!askOutput && (
            <div style={{ padding: "16px 16px", borderRadius: 16, background: "white", border: `1px solid ${S.border}` }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Ask AI</div>
              <div style={{ fontSize: 13, lineHeight: 1.7, color: S.muted }}>
                Use this space for freeform questions, rewrites, and ad hoc prompting.
              </div>
            </div>
          )}
          {askOutput && (
            <>
              <div style={{ justifySelf: "end", maxWidth: "92%", padding: "12px 14px", borderRadius: "18px 18px 6px 18px", background: P[50], border: `1px solid ${S.border}`, fontSize: 13, lineHeight: 1.6, color: P[800] }}>
                {askPrompt}
              </div>
              <div style={{ justifySelf: "start", maxWidth: "96%", padding: "14px 14px", borderRadius: "18px 18px 18px 6px", background: "white", border: `1px solid ${S.border}`, fontSize: 13, lineHeight: 1.7, color: S.text }}>
                {askOutput}
              </div>
            </>
          )}
        </div>

        <div style={{ flexShrink: 0, borderTop: `1px solid ${S.border}`, padding: "14px 16px calc(18px + env(safe-area-inset-bottom, 0px))", background: "white" }}>
          <div style={{ display: "grid", gap: 10 }}>
            <textarea
              value={askPrompt}
              onChange={e => setAskPrompt(e.target.value)}
              placeholder={`Ask AI about ${activeLabel.toLowerCase()}...`}
              rows={4}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "14px 14px",
                borderRadius: 16,
                border: `1px solid ${S.border}`,
                background: S.bg,
                fontSize: 14,
                lineHeight: 1.65,
                color: S.text,
                outline: "none",
                resize: "none",
                fontFamily: "inherit",
              }}
            />
            <button onClick={onAsk} disabled={askLoading || !askPrompt.trim()} style={{ border: "none", background: P[600], color: "white", borderRadius: 12, padding: "12px 14px", fontSize: 13, fontWeight: 700, cursor: askLoading || !askPrompt.trim() ? "default" : "pointer", opacity: askLoading || !askPrompt.trim() ? 0.55 : 1, fontFamily: "inherit" }}>
              {askLoading ? "Thinking..." : "Ask AI"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkspaceActionRail({
  collapsed,
  onToggle,
  activeLabel,
  aiTab,
  setAiTab,
  suggestions = [],
  quickActions,
  onRunQuickAction,
  reviewItems,
  onOpenSection,
  onMarkReviewed,
  askPrompt,
  setAskPrompt,
  onAsk,
  askOutput,
  askLoading,
  chatDocked = false,
}) {
  const tabs = [
    { id: "alerts", label: "Alerts", count: reviewItems.length },
    { id: "suggestions", label: "Suggestions", count: suggestions.length + quickActions.length },
    { id: "chat", label: "AI Chat" },
  ];

  const conversationCard = (
    <div
      style={{
        display: "grid",
        gridTemplateRows: chatDocked ? "minmax(0, 1fr) auto" : "auto auto",
        height: chatDocked ? "100%" : "auto",
        minHeight: 0,
        overflow: "hidden",
        background: "white",
        border: chatDocked ? "none" : `1px solid ${S.border}`,
        borderRadius: chatDocked ? 0 : 18,
      }}
    >
      <div style={{ minHeight: 0, overflowY: chatDocked ? "auto" : "visible", padding: "16px 16px 14px", display: "grid", gap: 10, alignContent: "start" }}>
        {!askOutput && (
          <div style={{ padding: "16px 16px", borderRadius: 16, background: S.bg, border: `1px solid ${S.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>AI Conversation</div>
            <div style={{ fontSize: 13, lineHeight: 1.7, color: S.muted }}>
              Ask AI about this section, request refinements, or generate a useful asset from here.
            </div>
          </div>
        )}
        {askOutput && (
          <>
            <div style={{ justifySelf: "end", maxWidth: "92%", padding: "12px 14px", borderRadius: "18px 18px 6px 18px", background: P[50], border: `1px solid ${S.border}`, fontSize: 13, lineHeight: 1.6, color: P[800] }}>
              {askPrompt}
            </div>
            <div style={{ justifySelf: "start", maxWidth: "96%", padding: "14px 14px", borderRadius: "18px 18px 18px 6px", background: "white", border: `1px solid ${S.border}`, fontSize: 13, lineHeight: 1.7, color: S.text }}>
              {askOutput}
            </div>
          </>
        )}
      </div>

      <div style={{ flexShrink: 0, borderTop: `1px solid ${S.border}`, padding: "14px 16px calc(18px + env(safe-area-inset-bottom, 0px))", background: "white" }}>
        <div style={{ display: "grid", gap: 10 }}>
          <textarea
            value={askPrompt}
            onChange={e => setAskPrompt(e.target.value)}
            placeholder={`Ask AI about ${activeLabel.toLowerCase()}...`}
            rows={4}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "14px 14px",
              borderRadius: 16,
              border: `1px solid ${S.border}`,
              background: S.bg,
              fontSize: 14,
              lineHeight: 1.65,
              color: S.text,
              outline: "none",
              resize: "none",
              fontFamily: "inherit",
            }}
          />
          <button onClick={onAsk} disabled={askLoading || !askPrompt.trim()} style={{ border: "none", background: P[600], color: "white", borderRadius: 12, padding: "12px 14px", fontSize: 13, fontWeight: 700, cursor: askLoading || !askPrompt.trim() ? "default" : "pointer", opacity: askLoading || !askPrompt.trim() ? 0.55 : 1, fontFamily: "inherit" }}>
            {askLoading ? "Thinking..." : "Ask AI"}
          </button>
        </div>
      </div>
    </div>
  );

  if (collapsed) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, height: "100%", padding: "16px 10px", background: "white", borderLeft: `1px solid ${S.border}` }}>
        <button
          onClick={onToggle}
          aria-label="Expand AI assistant"
          style={{ width: 42, height: 42, borderRadius: 14, border: `1px solid ${S.border}`, background: P[50], color: P[700], cursor: "pointer", fontSize: 16, fontWeight: 800, fontFamily: "inherit" }}
        >
          ✦
        </button>
        <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", color: P[700], textTransform: "uppercase" }}>
          AI Assistant
        </div>
        <div style={{ minWidth: 26, height: 26, borderRadius: 999, background: "#FFF7E8", color: "#D97706", fontSize: 11, fontWeight: 800, display: "grid", placeItems: "center" }}>
          {reviewItems.length}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minWidth: 0, height: chatDocked ? "100%" : "auto", minHeight: 0, background: "white", borderLeft: chatDocked ? `1px solid ${S.border}` : "none", overflow: "hidden" }}>
      <div style={{ background: "white", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ padding: "16px 18px", borderBottom: `1px solid ${S.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: P[900] }}>AI Assistant</div>
            <div style={{ marginTop: 4, fontSize: 12, color: S.muted }}>{activeLabel}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 999, background: P[50], color: P[600], fontSize: 12, fontWeight: 700 }}>
              {reviewItems.length} open
            </div>
            <button
              onClick={onToggle}
              aria-label="Collapse AI assistant"
              style={{ width: 34, height: 34, borderRadius: 12, border: `1px solid ${S.border}`, background: "white", color: S.muted, cursor: "pointer", fontSize: 13, fontWeight: 800, fontFamily: "inherit" }}
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: chatDocked ? 16 : 0, minHeight: 0, flex: 1, overflow: chatDocked ? "hidden" : "visible", background: chatDocked ? "transparent" : S.bg }}>
        <div style={{ display: "grid", gridTemplateRows: "auto minmax(0, 1fr)", minHeight: 0, height: chatDocked ? "100%" : "auto", border: `1px solid ${S.border}`, borderRadius: 18, overflow: "hidden", background: "white", boxShadow: "0 14px 40px rgba(38, 33, 92, 0.08)" }}>
          <div style={{ overflow: "hidden", borderBottom: `1px solid ${S.border}`, background: "#FCFBFF" }}>
            <div style={{ padding: "14px 16px", display: "flex", gap: 8, flexWrap: "wrap" }}>
              {tabs.map(tab => {
                const isActive = aiTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setAiTab(tab.id)}
                    style={{
                      border: `1px solid ${isActive ? P[200] : S.border}`,
                      background: isActive ? P[50] : "white",
                      color: isActive ? P[700] : S.muted,
                      borderRadius: 999,
                      padding: "8px 12px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {tab.label}{typeof tab.count === "number" ? ` (${tab.count})` : ""}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ minHeight: 0, overflowY: "auto", padding: aiTab === "chat" ? 0 : 16, background: aiTab === "chat" ? "white" : S.bg }}>
            {aiTab === "alerts" && (
              <div style={{ display: "grid", gap: 12 }}>
                {reviewItems.length === 0 && (
                  <div style={{ padding: "14px 14px", borderRadius: 16, background: "white", border: `1px solid ${S.border}`, fontSize: 13, color: S.muted }}>
                    No open flags or notifications right now.
                  </div>
                )}
                {reviewItems.map(item => (
                  <div key={item.id} style={{ padding: "14px 14px", borderRadius: 16, background: "white", border: `1px solid ${S.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: P[900] }}>{item.title}</div>
                        <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.6, color: S.muted }}>{item.body}</div>
                      </div>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 999, background: item.severity === "review" ? "#FFF7E8" : "#EEF8FF", color: item.severity === "review" ? "#D97706" : "#1D4ED8", fontSize: 11, fontWeight: 800, whiteSpace: "nowrap" }}>
                        {item.severity === "review" ? "Review needed" : "Suggested"}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                      <button onClick={() => onOpenSection(item.target)} style={{ border: "none", background: P[600], color: "white", borderRadius: 10, padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                        Open {item.targetLabel}
                      </button>
                      <button onClick={() => onMarkReviewed(item.id)} style={{ border: `1px solid ${S.border}`, background: "white", color: S.text, borderRadius: 10, padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                        Mark reviewed
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {aiTab === "suggestions" && (
              <div style={{ display: "grid", gap: 16 }}>
                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>Quick Actions</div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {quickActions.map(action => (
                      <button
                        key={action.id}
                        onClick={() => onRunQuickAction(action)}
                        style={{
                          border: `1px solid ${S.border}`,
                          background: "white",
                          color: S.text,
                          borderRadius: 12,
                          padding: "10px 12px",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          textAlign: "left",
                        }}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: P[700], textTransform: "uppercase", letterSpacing: "0.08em" }}>Relevant Suggestions</div>
                  {!suggestions.length && (
                    <div style={{ padding: "14px 14px", borderRadius: 16, background: "white", border: `1px solid ${S.border}`, fontSize: 13, color: S.muted }}>
                      No section-specific suggestions yet for this view.
                    </div>
                  )}
                  <div style={{ display: "grid", gap: 10 }}>
                    {suggestions.map(suggestion => (
                      <div key={`${suggestion.type}-${suggestion.title}`} style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 16, padding: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                          <div style={{ fontSize: 18, lineHeight: 1 }}>{suggestion.icon || "+"}</div>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 9px", borderRadius: 999, background: suggestion.type === "asset" ? "#EEF8FF" : P[50], color: suggestion.type === "asset" ? "#1D4ED8" : P[700], fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                            {suggestion.type === "asset" ? "Generate Asset" : "Add Section"}
                          </span>
                        </div>
                        <div style={{ marginTop: 14, fontSize: 16, fontWeight: 700, color: P[900], lineHeight: 1.25 }}>+ {suggestion.title}</div>
                        <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.55, color: S.muted }}>{suggestion.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {aiTab === "chat" && (
              <div style={{ minHeight: 0, height: chatDocked ? "100%" : "auto" }}>
                {conversationCard}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AskAIFloating({
  open,
  onToggle,
  activeLabel,
  askPrompt,
  setAskPrompt,
  onAsk,
  askOutput,
  askLoading,
  rightOffset = 24,
}) {
  return (
    <div style={{ position: "fixed", right: rightOffset, bottom: 26, zIndex: 35, display: "grid", gap: 12, alignItems: "end" }}>
      {open && (
        <div style={{ width: 332, maxWidth: "calc(100vw - 32px)", background: "white", border: `1px solid ${S.border}`, borderRadius: 22, boxShadow: "0 24px 60px rgba(38, 33, 92, 0.16)", overflow: "hidden" }}>
          <div style={{ padding: "16px 18px", borderBottom: `1px solid ${S.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: P[900] }}>Ask AI</div>
              <div style={{ marginTop: 4, fontSize: 12, color: S.muted }}>{activeLabel}</div>
            </div>
            <button
              onClick={onToggle}
              aria-label="Close Ask AI"
              style={{ width: 34, height: 34, borderRadius: 12, border: `1px solid ${S.border}`, background: "white", color: S.muted, cursor: "pointer", fontSize: 14, fontWeight: 800, fontFamily: "inherit" }}
            >
              ×
            </button>
          </div>
          <div style={{ maxHeight: 280, overflowY: "auto", padding: "16px 16px 12px", display: "grid", gap: 10, background: S.bg }}>
            {!askOutput && (
              <div style={{ padding: "16px", borderRadius: 16, background: "white", border: `1px solid ${S.border}` }}>
                <div style={{ fontSize: 13, lineHeight: 1.7, color: S.muted }}>
                  Use Ask AI anywhere in Loop for freeform prompting, rewrites, and quick thinking support.
                </div>
              </div>
            )}
            {askOutput && (
              <>
                <div style={{ justifySelf: "end", maxWidth: "92%", padding: "12px 14px", borderRadius: "18px 18px 6px 18px", background: P[50], border: `1px solid ${S.border}`, fontSize: 13, lineHeight: 1.6, color: P[800] }}>
                  {askPrompt}
                </div>
                <div style={{ justifySelf: "start", maxWidth: "96%", padding: "14px 14px", borderRadius: "18px 18px 18px 6px", background: "white", border: `1px solid ${S.border}`, fontSize: 13, lineHeight: 1.7, color: S.text }}>
                  {askOutput}
                </div>
              </>
            )}
          </div>
          <div style={{ padding: "14px 16px 18px", borderTop: `1px solid ${S.border}`, background: "white", display: "grid", gap: 10 }}>
            <textarea
              value={askPrompt}
              onChange={e => setAskPrompt(e.target.value)}
              placeholder={`Ask AI about ${activeLabel.toLowerCase()}...`}
              rows={4}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "14px 14px",
                borderRadius: 16,
                border: `1px solid ${S.border}`,
                background: S.bg,
                fontSize: 14,
                lineHeight: 1.65,
                color: S.text,
                outline: "none",
                resize: "none",
                fontFamily: "inherit",
              }}
            />
            <button onClick={onAsk} disabled={askLoading || !askPrompt.trim()} style={{ border: "none", background: P[600], color: "white", borderRadius: 12, padding: "12px 14px", fontSize: 13, fontWeight: 700, cursor: askLoading || !askPrompt.trim() ? "default" : "pointer", opacity: askLoading || !askPrompt.trim() ? 0.55 : 1, fontFamily: "inherit" }}>
              {askLoading ? "Thinking..." : "Ask AI"}
            </button>
          </div>
        </div>
      )}

      <button
        onClick={onToggle}
        aria-label="Open Ask AI"
        style={{
          justifySelf: "end",
          width: 62,
          height: 62,
          borderRadius: 999,
          border: "none",
          background: "linear-gradient(135deg, #6D5EF3 0%, #8D7EF8 100%)",
          color: "white",
          boxShadow: "0 18px 34px rgba(93, 88, 214, 0.28)",
          cursor: "pointer",
          fontSize: 22,
          fontWeight: 800,
          fontFamily: "inherit",
        }}
      >
        ✦
      </button>
    </div>
  );
}

export default function App() {
  const hasHydratedRef = useRef(false);
  const remoteSyncTimerRef = useRef(null);
  const restoringProjectRef = useRef(false);
  const deletedBrokenProjectsRef = useRef(new Set());
  const [screen, setScreen] = useState("home");
  const [platformMode, setPlatformMode] = useState("original");
  const [active, setActive] = useState("productTruth");
  const [workflowStage, setWorkflowStage] = useState("login");
  const [workflowEvents, setWorkflowEvents] = useState([]);
  const [launchComplete, setLaunchComplete] = useState(false);
  const [feedbackCaptured, setFeedbackCaptured] = useState(false);
  const [testScenarioLoaded, setTestScenarioLoaded] = useState(false);
  const [platformNotice, setPlatformNotice] = useState("");
  const [collapsed, setCollapsed] = useState({});
  const [aiOpen, setAiOpen] = useState(false);
  const [aiRailCollapsed, setAiRailCollapsed] = useState(false);
  const [leftRailCollapsed, setLeftRailCollapsed] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [askAiOpen, setAskAiOpen] = useState(false);
  const [aiTab, setAiTab] = useState("changes");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiOutput, setAiOutput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [reviewDismissed, setReviewDismissed] = useState({});
  const [approvedChanges, setApprovedChanges] = useState({});
  const [compareVersionId, setCompareVersionId] = useState("");
  const [starredTiles, setStarredTiles] = useState({});
  const [testProjects, setTestProjects] = useState([]);
  const [currentTestProjectId, setCurrentTestProjectId] = useState("");
  const [versionDraft, setVersionDraft] = useState({ sourceProjectId: "", mode: "minor" });
  const [remoteProjectsLoaded, setRemoteProjectsLoaded] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(typeof window === "undefined" ? 1280 : window.innerWidth);
  const [pd, setPd] = useState({
    name: "",
    description: "",
    wowFactor: "",
    whatChanged: "",
    previousVersionId: "",
    previousVersionName: "",
    changeType: "",
    launchDate: "",
    version: "",
    status: "Planned",
    owner: "Project Owner",
    reviewTeams: "Product, Sales",
    category: "",
    whatItDoes: "",
    builtFor: "",
    problem: "",
    problemStatement: "",
    problemImpact: "",
    currentSolutionGaps: "",
    solution: "",
    solutionMechanism: "",
    whyNow: "",
    audience: "",
    diff: "",
  });
  const [aiDraft, setAiDraft] = useState(makeEmptyAiDraft());
  const [userEdits, setUserEdits] = useState({});
  const [narrativeUiState, setNarrativeUiState] = useState({
    isGenerated: false,
    improveMode: false,
    isGenerating: false,
    enhancingSection: "",
  });
  const [cap, setCap] = useState({
    features: "",
    featurePriorities: "",
    integrations: "",
    integrationValue: "",
    featureBenefits: [
      { feature: "", benefit: "" },
    ],
  });
  const [productOverviewLayout, setProductOverviewLayout] = useState(DEFAULT_PRODUCT_OVERVIEW_LAYOUT);
  const [problemStatementLayout, setProblemStatementLayout] = useState(DEFAULT_PROBLEM_STATEMENT_LAYOUT);
  const [solutionSectionLayout, setSolutionSectionLayout] = useState(DEFAULT_SOLUTION_SECTION_LAYOUT);
  const [audienceTruthLayout, setAudienceTruthLayout] = useState(DEFAULT_AUDIENCE_TRUTH_LAYOUT);
  const [differentiationLayout, setDifferentiationLayout] = useState(DEFAULT_DIFFERENTIATION_LAYOUT);
  const [featuresLayout, setFeaturesLayout] = useState(DEFAULT_FEATURES_LAYOUT);
  const [capabilitiesSectionLayout, setCapabilitiesSectionLayout] = useState(DEFAULT_CAPABILITIES_SECTION_LAYOUT);
  const [competitorsSectionLayout, setCompetitorsSectionLayout] = useState(DEFAULT_COMPETITORS_SECTION_LAYOUT);
  const [competitionComparisonLayout, setCompetitionComparisonLayout] = useState(DEFAULT_COMPETITION_COMPARISON_LAYOUT);
  const [competitionSalesLayout, setCompetitionSalesLayout] = useState(DEFAULT_COMPETITION_SALES_LAYOUT);
  const [comp, setComp] = useState({
    competitors: "",
    differentiators: "",
    proofPoints: "",
    proofMetrics: "",
    winLose: "",
    alternativeGaps: "",
    comparisonRows: [
      { category: "Ease of use", ourProduct: "", competitorOne: "", competitorTwo: "" },
      { category: "Implementation speed", ourProduct: "", competitorOne: "", competitorTwo: "" },
    ],
  });
  const [pos, setPos] = useState({ statement: "", valueProp: "", tagline: "", taglineOptions: "", keyValue: "" });
  const [msg, setMsg] = useState({ headline: "", pillars: "", elevator: "" });
  const [aud, setAud] = useState({ primary: "", secondary: "" });
  const [positioningStatementLayout, setPositioningStatementLayout] = useState(makeSingleTileLayout("statement", 220));
  const [valuePropLayout, setValuePropLayout] = useState(makeSingleTileLayout("valueProp", 190));
  const [headlineLayout, setHeadlineLayout] = useState(makeSingleTileLayout("headline", 150));
  const [messagingPillarsLayout, setMessagingPillarsLayout] = useState(makeSingleTileLayout("pillars", 220));
  const [elevatorPitchLayout, setElevatorPitchLayout] = useState(makeSingleTileLayout("elevator", 170));
  const [taglineLayout, setTaglineLayout] = useState(makeSingleTileLayout("tagline", 260));
  const [keyValueLayout, setKeyValueLayout] = useState(makeSingleTileLayout("keyValue", 160));
  const [primaryPersonaLayout, setPrimaryPersonaLayout] = useState(makeSingleTileLayout("primary", 220));
  const [secondaryPersonaLayout, setSecondaryPersonaLayout] = useState(makeSingleTileLayout("secondary", 160));
  const [buyerPersonaLayout, setBuyerPersonaLayout] = useState(makeSingleTileLayout("persona", 190));
  const [strat, setStrat] = useState({ goal: "", icp: "", channels: "", hooks: "" });
  const [_stratLayout, _setStratLayout] = useState(DEFAULT_STRATEGY_LAYOUT);
  const [story, setStory] = useState({ origin: "", customer: "", demo: "" });
  const [storyLayout, setStoryLayout] = useState(DEFAULT_STORY_LAYOUT);
  const [alignment, setAlignment] = useState({
    internal: [
      { id: "positioning", icon: "◉", title: "Positioning Statement", status: "In Review", sales: 3, product: 3, note: "No positioning statement entered yet — fill it in under Core Narrative → Positioning Statement." },
      { id: "messaging", icon: "▦", title: "Messaging", status: "In Review", sales: 3, product: 3, note: "No messaging pillars defined yet — add them under Core Narrative → Messaging Pillars." },
      { id: "diff", icon: "✶", title: "Top Differentiators", status: "In Review", sales: 3, product: 3, note: "No differentiators defined yet — add them under Competitive Intelligence and Positioning." },
      { id: "features", icon: "⊞", title: "Features vs Benefits", status: "In Review", sales: 3, product: 3, note: "No features or benefits defined yet — add them under Product Truth and Core Narrative tabs." },
    ],
    external: [
      { id: "market-message", icon: "◎", title: "Market Narrative", status: "In Review", sales: 3, product: 4, note: "Capture the message customers repeat back most clearly after seeing the story." },
      { id: "proof", icon: "✦", title: "Proof Points", status: "Needs Work", sales: 2, product: 3, note: "Document external proof like customer outcomes, adoption signals, and quotes." },
      { id: "objections", icon: "◌", title: "Objection Handling", status: "In Review", sales: 3, product: 2, note: "List recurring buyer objections and the strongest response for each." },
      { id: "resonance", icon: "◈", title: "Audience Resonance", status: "Aligned", sales: 4, product: 4, note: "Track what language and value messages resonate best with the target audience." },
    ],
  });
  const [analytics, setAnalytics] = useState(makeDefaultAnalyticsState());
  const [confidence, setConfidence] = useState(makeDefaultConfidenceState());
  const [assets, setAssets] = useState({ notes: "", rows: [] });
  const [brand, setBrand] = useState({
    tagline: "",
    tones: ["Professional", "Friendly"],
    colors: [
      { label: "Primary", value: "#7C4DFF" },
      { label: "Accent", value: "#4F46E5" },
    ],
    headingFont: "Sora",
    bodyFont: "DM Sans",
    logoName: "",
    dos: "",
    donts: "",
    legal: "",
  });
  const [workspaceSaves, setWorkspaceSaves] = useState({});
  const [projectReview, setProjectReview] = useState({
    status: "Draft",
    required: false,
    teams: ["Product", "Sales"],
    lastAction: "Project created",
  });
  const [reviewRouting, setReviewRouting] = useState(makeEmptyReviewRouting());
  const [sectionReviews, setSectionReviews] = useState({});
  const [reviewInsights, setReviewInsights] = useState({
    normalizedSignals: {},
    topIssues: [],
    weakestParameter: "",
    strongestParameter: "",
    crossSectionPatterns: [],
    suggestions: [],
    confidenceScore: 0,
    updatedAt: "",
  });
  const [feedbackEntries, setFeedbackEntries] = useState([]);
  const safePd = normalizePdState(pd);
  const safeCap = normalizeCapabilitiesState(cap);
  const safeComp = normalizeCompetitionState(comp);
  const safePos = normalizePositioningState(pos);
  const safeMsg = normalizeMessagingState(msg);
  const safeAud = normalizeAudienceState(aud);
  const safeStrat = normalizeStrategyState(strat);
  const safeStory = normalizeStoryState(story);
  const safeAssets = normalizeAssetsState(assets);
  const safeAnalytics = normalizeAnalyticsState(analytics);
  const safeAlignment = normalizeAlignmentState(alignment);
  const safeConfidence = normalizeConfidenceState(confidence);
  const useCanvasColumns = viewportWidth >= 980;
  const reviewSections = buildReviewableSections({ pd: safePd, comp: safeComp, pos: safePos, msg: safeMsg, aud: safeAud, strat: safeStrat, story: safeStory, assets: safeAssets, aiDraft });
  const currentReviewRouting = normalizeReviewRouting(reviewRouting, reviewSections);
  const currentSectionReviews = normalizeSectionReviews(sectionReviews, currentReviewRouting, reviewSections);
  const assignedReviewSections = REVIEW_TEAMS.flatMap(team =>
    (currentReviewRouting.assignments?.[team] || [])
      .map(sectionId => {
        const section = reviewSections.find(item => item.id === sectionId);
        return section ? { ...section, sectionId, reviewerTeam: team } : null;
      })
      .filter(Boolean)
  );
  const pmmActionQueue = buildPmmActionQueue(currentSectionReviews, reviewSections);
  const reviewAnalytics = buildReviewAnalytics(currentSectionReviews, assignedReviewSections);
  const narrativeHealthMetrics = {
    positioningClarity: boundedNarrativeScore(pos.statement, 4),
    messagingAlignment: boundedNarrativeScore(msg.pillars || msg.headline, 4),
    marketAdoption: Math.max(1, Math.min(10, Math.round(average(safeAnalytics.metrics.map(metric => Number.parseFloat(metric.value) || 0)) / 10))),
    storyResonance: boundedNarrativeScore(safeStory.customer || safeStory.origin, 4),
  };
  const feedbackSignals = safeAnalytics.signals.map((signal, index) => ({
    text: signal.note || signal.title,
    category: signal.title,
    frequency: Math.max(18, 40 - index * 6),
  }));
  const alignmentMatrix = {
    internal: [
      { label: "Product team", score: Math.round(average(safeAlignment.internal.map(section => section.product)) * 2) },
      { label: "Sales team", score: Math.round(average(safeAlignment.internal.map(section => section.sales)) * 2) },
      { label: "Marketing team", score: boundedNarrativeScore(safeMsg.headline + safeMsg.pillars + safePos.valueProp, 3) },
    ],
    external: [
      { label: "Customers", score: Math.round(average(safeAlignment.external.map(section => section.product)) * 2) },
      { label: "Prospects", score: Math.round(average(safeAlignment.external.map(section => section.sales)) * 2) },
      { label: "Partners", score: boundedNarrativeScore(safeComp.differentiators + safeComp.proofPoints, 2) },
    ],
  };
  const aiContext = {
    productTruth: safePd,
    capabilities: safeCap,
    narrative: { positioning: safePos, messaging: safeMsg, audience: safeAud, story: safeStory, strategy: safeStrat },
    feedbackSignals,
    performance: safeAnalytics.performance,
  };
  const narrativeHealthScore = Number((Object.values(narrativeHealthMetrics).reduce((sum, value) => sum + value, 0) / Object.values(narrativeHealthMetrics).length).toFixed(1));
  const confidenceScore = Number((average(safeConfidence.factors.map(factor => (Number(factor.score) || 0) * 2))).toFixed(1));
  const feedbackConfidenceScore = reviewInsights.confidenceScore || calculateFeedbackConfidence(currentSectionReviews);
  const activeFeedbackSignals = reviewInsights.topIssues.length
    ? reviewInsights.topIssues.map((issue, index) => ({
        text: issue,
        category: reviewInsights.weakestParameter || "Feedback signal",
        frequency: Math.max(18, 38 - index * 5),
      }))
    : feedbackSignals;
  const narrativeVersions = [
    {
      id: safeAnalytics.narrativePeriod.id,
      version: safeAnalytics.narrativePeriod.version.replace(/^v/i, "Narrative v"),
      startDate: safeAnalytics.narrativePeriod.startDate,
      endDate: safeAnalytics.narrativePeriod.endDate,
      performance: safeAnalytics.performance,
      signals: activeFeedbackSignals,
      alignment: alignmentMatrix,
      healthScore: narrativeHealthScore,
      confidenceScore: feedbackConfidenceScore,
    },
    ...(safeAnalytics.versions || []),
  ];
  const compareVersion = narrativeVersions.find(version => version.id === compareVersionId) || narrativeVersions[1] || null;
  const feedbackDashboardData = {
    narrativePeriod: safeAnalytics.narrativePeriod,
    narrativeHealth: narrativeHealthMetrics,
    performance: safeAnalytics.performance,
    feedbackSignals: activeFeedbackSignals,
    alignment: alignmentMatrix,
    versions: narrativeVersions,
    aiContext,
    confidence: safeConfidence,
    confidenceScore: feedbackConfidenceScore,
  };
  const toggleStarredTile = tileKey => {
    setStarredTiles(prev => ({ ...prev, [tileKey]: !prev[tileKey] }));
  };

  const previewMap = {
    productTruth: [safePd.problem, safePd.solution, safeComp.differentiators].filter(Boolean).join(" | "),
    productOverview: [safePd.category, safePd.whatItDoes, safePd.builtFor].filter(Boolean).join(" | "),
    problemStatementSection: [safePd.problem, safePd.problemImpact, safePd.currentSolutionGaps].filter(Boolean).join(" | "),
    solutionSection: [safePd.solution, safePd.solutionMechanism, safePd.whyNow].filter(Boolean).join(" | "),
    audienceTruth: [safePd.audience, safeAud.primary, safeAud.secondary].filter(Boolean).join(" | "),
    differentiationTruth: [safePd.diff, safeComp.differentiators, safeComp.alternativeGaps].filter(Boolean).join(" | "),
    featuresTruth: [safeCap.features, safeCap.featurePriorities].filter(Boolean).join(" | "),
    capabilitiesTruth: [(safeCap.featureBenefits || []).map(item => `${item.feature}: ${item.benefit}`).filter(Boolean).join(" | ")].filter(Boolean).join(" | "),
    competitorsTruth: [safeComp.competitors, safeComp.winLose].filter(Boolean).join(" | "),
    addSection: "Upgrade to unlock Proof Points, Integrations, and Competitive Comparison.",
    narrative: [safePos.statement, safeMsg.headline, safeAud.primary].filter(Boolean).join(" | "),
    positioningStatementSection: safePos.statement,
    valuePropSection: [safePos.valueProp, safePos.keyValue].filter(Boolean).join(" | "),
    headlineSection: safeMsg.headline,
    messagingPillarsSection: safeMsg.pillars,
    elevatorPitchSection: safeMsg.elevator,
    taglineSection: [safePos.tagline, safePos.taglineOptions].filter(Boolean).join(" | "),
    keyValueSection: safePos.keyValue,
    primaryPersonaSection: safeAud.primary,
    secondaryPersonaSection: safeAud.secondary,
    buyerPersonaSection: safePd.audience,
    addNarrativeSection: "Upgrade to unlock Story, Tagline Studio, and Message Testing.",
    competitionOverview: [safeComp.competitors, safeComp.alternativeGaps].filter(Boolean).join(" | "),
    competitionComparison: [safeComp.alternativeGaps, safeComp.proofMetrics].filter(Boolean).join(" | "),
    competitionSales: [comp.differentiators, comp.winLose].filter(Boolean).join(" | "),
    strategy: strat.goal,
    story: story.origin,
    reviewCenter: projectReview.lastAction || "Review the full project before launch.",
    analytics: feedbackSignals[1]?.text || safeAnalytics.signals[0]?.note,
    confidence: safeConfidence.decisionNotes || safeConfidence.factors[0]?.note,
    assets: assets.notes,
  };
  const sectionLabels = { productTruth: "Product Truth", narrative: "Narrative", ...Object.fromEntries(MVP_NAV.flatMap(group => group.items).map(item => [item.id, item.label])) };
  const rawReviewItems = [
    !pos.statement && pd.problem ? {
      id: "positioning-needs-update",
      title: "Positioning needs updating",
      body: "Product truth is taking shape, but the positioning statement is still empty. Review the narrative before it drifts.",
      target: "positioningStatementSection",
      targetLabel: sectionLabels.positioningStatementSection,
      severity: "review",
    } : null,
    (cap.features || cap.featureBenefits?.some(item => item.feature || item.benefit)) && !msg.pillars ? {
      id: "messaging-missing-pillars",
      title: "Messaging should reflect latest capabilities",
      body: "Capabilities include product detail, but messaging pillars are still light. The story may not reflect the newest value.",
      target: "messagingPillarsSection",
      targetLabel: sectionLabels.messagingPillarsSection,
      severity: "review",
    } : null,
    comp.differentiators && !pos.valueProp ? {
      id: "value-prop-gap",
      title: "Value proposition may be out of sync",
      body: "Differentiators are defined, but the value proposition does not yet carry them through.",
      target: "valuePropSection",
      targetLabel: sectionLabels.valuePropSection,
      severity: "suggested",
    } : null,
    pd.diff && !comp.proofPoints ? {
      id: "proof-points-gap",
      title: "Proof points are missing",
      body: "Product differentiation exists, but Competitive Intelligence still needs proof points to back it up.",
      target: "addSection",
      targetLabel: sectionLabels.addSection,
      severity: "review",
    } : null,
    brand.tagline && !assets.notes ? {
      id: "asset-rollout-gap",
      title: "Assets may need refreshing",
      body: "Brand guidance is evolving. Review launch assets so they stay aligned with the newest brand direction.",
      target: "assets",
      targetLabel: sectionLabels.assets,
      severity: "suggested",
    } : null,
  ].filter(Boolean).filter(item => !reviewDismissed[item.id]);
  const reportAlignmentScore = Math.max(42, 100 - rawReviewItems.length * 10 - (projectReview.status === "Requested" ? 6 : 0));
  const sectionFlagCounts = rawReviewItems.reduce((acc, item) => {
    acc[item.target] = (acc[item.target] || 0) + 1;
    return acc;
  }, {});
  const resourceAssetNotifications = (assets.rows || []).filter(item => item.status === "Needs Work" || item.status === "In Review").length;
  const internalFeedbackNotifications = (reviewAnalytics.totals.improve || 0) + (reviewAnalytics.totals.pending || 0);
  const marketFeedbackNotifications = feedbackEntries.length;
  const readinessNotifications = (assets.rows || []).some(item => item.status !== "Approved") || (reviewAnalytics.totals.pending || 0) > 0 ? 1 : 0;
  const itemNotificationCounts = {
    ...sectionFlagCounts,
    assets: resourceAssetNotifications,
    reviewCenter: internalFeedbackNotifications,
    analytics: marketFeedbackNotifications,
    confidence: readinessNotifications,
  };
  const resourcesNotificationCount = resourceAssetNotifications + internalFeedbackNotifications + marketFeedbackNotifications + readinessNotifications;
  const isCompact = viewportWidth < 1180;
  const isMobile = viewportWidth < 820;
  const showDesktopAiRail = !isMobile;
  const compressedCenterTables = showDesktopAiRail && !aiRailCollapsed && !leftRailCollapsed;

  const panelMap = {
    productTruth: <BuildNarrativeWorkspacePanel section="productTruth" pd={pd} pos={pos} msg={msg} strat={strat} aiDraft={aiDraft} userEdits={userEdits} improveMode={narrativeUiState.improveMode} enhancingSection={narrativeUiState.enhancingSection} onEnhanceSection={handleEnhanceSection} onFieldChange={updateNarrativeField} />,
    productOverview: <ProductOverviewSectionPanel d={pd} set={setPd} compact={!useCanvasColumns} layout={productOverviewLayout} setLayout={setProductOverviewLayout} starredTiles={starredTiles} onToggleStar={toggleStarredTile} starContext="productOverview" />,
    problemStatementSection: <ProblemStatementSectionPanel d={pd} set={setPd} compact={!useCanvasColumns} layout={problemStatementLayout} setLayout={setProblemStatementLayout} starredTiles={starredTiles} onToggleStar={toggleStarredTile} starContext="problemStatementSection" />,
    solutionSection: <SolutionSectionPanel d={pd} set={setPd} compact={!useCanvasColumns} layout={solutionSectionLayout} setLayout={setSolutionSectionLayout} starredTiles={starredTiles} onToggleStar={toggleStarredTile} starContext="solutionSection" />,
    audienceTruth: <AudienceTruthPanel pd={pd} setPd={setPd} aud={safeAud} setAud={setAud} compact={!useCanvasColumns} layout={audienceTruthLayout} setLayout={setAudienceTruthLayout} starredTiles={starredTiles} onToggleStar={toggleStarredTile} starContext="audienceTruth" />,
    differentiationTruth: <DifferentiationTruthPanel pd={pd} setPd={setPd} comp={comp} setComp={setComp} compact={!useCanvasColumns} layout={differentiationLayout} setLayout={setDifferentiationLayout} starredTiles={starredTiles} onToggleStar={toggleStarredTile} starContext="differentiationTruth" />,
    featuresTruth: <FeaturesTruthPanel d={cap} set={setCap} compact={!useCanvasColumns} layout={featuresLayout} setLayout={setFeaturesLayout} starredTiles={starredTiles} onToggleStar={toggleStarredTile} starContext="featuresTruth" />,
    capabilitiesTruth: <CapabilitiesTruthPanel d={cap} set={setCap} compact={!useCanvasColumns} layout={capabilitiesSectionLayout} setLayout={setCapabilitiesSectionLayout} starredTiles={starredTiles} onToggleStar={toggleStarredTile} starContext="capabilitiesTruth" />,
    competitorsTruth: <CompetitorsTruthPanel d={comp} set={setComp} compact={!useCanvasColumns} layout={competitorsSectionLayout} setLayout={setCompetitorsSectionLayout} starredTiles={starredTiles} onToggleStar={toggleStarredTile} starContext="competitorsTruth" />,
    addSection: <AddSectionPanel />,
    narrative: <BuildNarrativeWorkspacePanel section="narrative" pd={pd} pos={pos} msg={msg} strat={strat} aiDraft={aiDraft} userEdits={userEdits} improveMode={narrativeUiState.improveMode} enhancingSection={narrativeUiState.enhancingSection} onEnhanceSection={handleEnhanceSection} onFieldChange={updateNarrativeField} />,
    positioningStatementSection: <SingleNarrativeSectionPanel compact={!useCanvasColumns} layout={positioningStatementLayout} setLayout={setPositioningStatementLayout} minHeight={360} starredTiles={starredTiles} onToggleStar={toggleStarredTile} starContext="positioningStatementSection" tile={{ id: "statement", title: "Positioning Statement", render: tile => <CanvasField label="Positioning Statement (Geoffrey Moore Style)" value={pos.statement} onChange={value => setPos(prev => ({ ...prev, statement: value }))} placeholder="For [target customer] who [statement of need or opportunity], [product name] is a [product category] that [key benefit]. Unlike [primary competitive alternative], [product name] [primary differentiation]." rows={6} minHeight={Math.max(190, (tile?.h || 190) - 34)} accent="#F8F7FF" /> }} suggestions={[{ type: "section", icon: "◔", title: "Value Proposition", description: "Capture the strongest promise that supports this positioning." }, { type: "section", icon: "◫", title: "Category Design", description: "Add category framing to make the positioning more ownable." }, { type: "asset", icon: "▤", title: "Positioning Brief", description: "Generate a concise positioning brief for internal alignment." }]} />,
    valuePropSection: <SingleNarrativeSectionPanel compact={!useCanvasColumns} layout={valuePropLayout} setLayout={setValuePropLayout} minHeight={330} starredTiles={starredTiles} onToggleStar={toggleStarredTile} starContext="valuePropSection" tile={{ id: "valueProp", title: "Value Proposition", render: tile => <CanvasField label="Value Proposition" value={pos.valueProp} onChange={value => setPos(prev => ({ ...prev, valueProp: value }))} placeholder="Summarize the core promise and business value your product delivers..." rows={5} minHeight={Math.max(160, (tile?.h || 160) - 34)} /> }} suggestions={[{ type: "section", icon: "◌", title: "Key Value", description: "Break the value proposition into sharper value outcomes." }, { type: "section", icon: "▦", title: "Messaging Pillars", description: "Turn the value proposition into repeatable message themes." }, { type: "asset", icon: "▣", title: "Value Prop One-Pager", description: "Generate a short internal or investor-facing value summary." }]} />,
    headlineSection: <SingleNarrativeSectionPanel compact={!useCanvasColumns} layout={headlineLayout} setLayout={setHeadlineLayout} minHeight={300} starredTiles={starredTiles} onToggleStar={toggleStarredTile} starContext="headlineSection" tile={{ id: "headline", title: "Headline Message", render: tile => <CanvasField label="Headline Message" value={msg.headline} onChange={value => setMsg(prev => ({ ...prev, headline: value }))} placeholder="Your primary hero message..." rows={3} minHeight={Math.max(140, (tile?.h || 140) - 34)} /> }} suggestions={[{ type: "section", icon: "▦", title: "Messaging Pillars", description: "Build support messages under this headline." }, { type: "section", icon: "◫", title: "Elevator Pitch", description: "Expand this headline into a short verbal story." }, { type: "asset", icon: "!", title: "Homepage Hero Copy", description: "Generate homepage hero copy from the headline." }]} />,
    messagingPillarsSection: <SingleNarrativeSectionPanel compact={!useCanvasColumns} layout={messagingPillarsLayout} setLayout={setMessagingPillarsLayout} minHeight={360} starredTiles={starredTiles} onToggleStar={toggleStarredTile} starContext="messagingPillarsSection" tile={{ id: "pillars", title: "Messaging Pillars", render: tile => <CanvasField label="Messaging Pillars" value={msg.pillars} onChange={value => setMsg(prev => ({ ...prev, pillars: value }))} placeholder="3-4 core messages that support your headline..." rows={5} minHeight={Math.max(180, (tile?.h || 180) - 34)} accent="#F8F7FF" /> }} suggestions={[{ type: "section", icon: "◫", title: "Objection Handling", description: "Add responses to the objections these pillars are meant to address." }, { type: "section", icon: "▥", title: "Sales Enablement Brief", description: "Translate the pillars into what sales should actually say." }, { type: "asset", icon: "✉", title: "Launch Messaging Pack", description: "Generate website, email, and sales copy starters from these pillars." }]} />,
    elevatorPitchSection: <SingleNarrativeSectionPanel compact={!useCanvasColumns} layout={elevatorPitchLayout} setLayout={setElevatorPitchLayout} minHeight={320} starredTiles={starredTiles} onToggleStar={toggleStarredTile} starContext="elevatorPitchSection" tile={{ id: "elevator", title: "Elevator Pitch", render: tile => <CanvasField label="Elevator Pitch" value={msg.elevator} onChange={value => setMsg(prev => ({ ...prev, elevator: value }))} placeholder="30-second verbal pitch..." rows={4} minHeight={Math.max(150, (tile?.h || 150) - 34)} /> }} suggestions={[{ type: "section", icon: "▶", title: "Launch Narrative", description: "Expand the pitch into a fuller launch story." }, { type: "section", icon: "▥", title: "Sales Enablement Brief", description: "Turn the pitch into a practical sales talk track." }, { type: "asset", icon: "▣", title: "Pitch Card", description: "Generate a short pitch card for founder-led selling." }]} />,
    taglineSection: <SingleNarrativeSectionPanel compact={!useCanvasColumns} layout={taglineLayout} setLayout={setTaglineLayout} minHeight={420} starredTiles={starredTiles} onToggleStar={toggleStarredTile} starContext="taglineSection" tile={{ id: "tagline", title: "Tagline + Options", render: () => <TaglineStudio tagline={pos.tagline} taglineOptions={pos.taglineOptions} onTaglineChange={value => setPos(prev => ({ ...prev, tagline: value }))} onOptionsChange={value => setPos(prev => ({ ...prev, taglineOptions: value }))} prompt={pd.problem || pos.valueProp ? `Generate 5 distinct tagline options for this product. Problem: ${pd.problem}. Value proposition: ${pos.valueProp}. Keep each option 3-8 words and make them punchy.` : ""} /> }} suggestions={[{ type: "section", icon: "◔", title: "Category Design", description: "Strengthen the category language behind the tagline options." }, { type: "section", icon: "▣", title: "Headline Message", description: "Turn the strongest tagline into a clearer headline direction." }, { type: "asset", icon: "✉", title: "Tagline Options Sheet", description: "Generate a quick shortlist to review with the team." }]} />,
    keyValueSection: <SingleNarrativeSectionPanel compact={!useCanvasColumns} layout={keyValueLayout} setLayout={setKeyValueLayout} minHeight={300} starredTiles={starredTiles} onToggleStar={toggleStarredTile} starContext="keyValueSection" tile={{ id: "keyValue", title: "Key Value", render: tile => <CanvasField label="Key Value" value={pos.keyValue} onChange={value => setPos(prev => ({ ...prev, keyValue: value }))} placeholder="List the most important customer or business value outcomes in short, clear terms..." rows={4} minHeight={Math.max(140, (tile?.h || 140) - 34)} accent="#F3F1FF" /> }} suggestions={[{ type: "section", icon: "◔", title: "Value Proposition", description: "Roll these value outcomes into a sharper value proposition." }, { type: "section", icon: "✶", title: "Proof Points", description: "Add proof for the value claims you want the market to believe." }, { type: "asset", icon: "▤", title: "Value Snapshot", description: "Generate a short value summary for deck or website use." }]} />,
    primaryPersonaSection: <SingleNarrativeSectionPanel compact={!useCanvasColumns} layout={primaryPersonaLayout} setLayout={setPrimaryPersonaLayout} minHeight={360} starredTiles={starredTiles} onToggleStar={toggleStarredTile} starContext="primaryPersonaSection" tile={{ id: "primary", title: "Primary Persona", render: tile => <CanvasField label="Primary Persona" value={safeAud.primary} onChange={value => setAud(prev => ({ ...prev, primary: value }))} placeholder="Job title, company size, key pain points, goals..." rows={6} minHeight={Math.max(200, (tile?.h || 200) - 34)} /> }} suggestions={[{ type: "section", icon: "◈", title: "Positioning Statement", description: "Make sure the positioning clearly reflects this persona's need." }, { type: "section", icon: "▦", title: "Messaging Pillars", description: "Build messaging that maps to this persona's pain and motivation." }, { type: "asset", icon: "▣", title: "Persona Snapshot", description: "Generate a concise persona card for internal use." }]} />,
    secondaryPersonaSection: <SingleNarrativeSectionPanel compact={!useCanvasColumns} layout={secondaryPersonaLayout} setLayout={setSecondaryPersonaLayout} minHeight={300} starredTiles={starredTiles} onToggleStar={toggleStarredTile} starContext="secondaryPersonaSection" tile={{ id: "secondary", title: "Secondary Persona", render: tile => <CanvasField label="Secondary Persona" value={safeAud.secondary} onChange={value => setAud(prev => ({ ...prev, secondary: value }))} placeholder="Additional buyer or influencer persona..." rows={4} minHeight={Math.max(130, (tile?.h || 130) - 34)} accent="#F8F7FF" /> }} suggestions={[{ type: "section", icon: "⊙", title: "Primary Persona", description: "Clarify how this persona differs from the primary audience." }, { type: "section", icon: "◫", title: "Objection Handling", description: "Capture concerns this persona is likely to raise." }, { type: "asset", icon: "▤", title: "Influencer Brief", description: "Generate a short brief on how to message to this persona." }]} />,
    buyerPersonaSection: <SingleNarrativeSectionPanel compact={!useCanvasColumns} layout={buyerPersonaLayout} setLayout={setBuyerPersonaLayout} minHeight={340} starredTiles={starredTiles} onToggleStar={toggleStarredTile} starContext="buyerPersonaSection" tile={{ id: "persona", title: "Detailed Buyer Persona", render: () => <GenBlock label="Detailed Buyer Persona" prompt={pd.audience ? `Create a buyer persona for: ${pd.audience}. Include: name/title, day-in-the-life challenge, what they care about (3 things), key objections, how they discover tools.` : ""} /> }} suggestions={[{ type: "section", icon: "▦", title: "Messaging Pillars", description: "Translate persona detail into stronger message framing." }, { type: "section", icon: "◫", title: "Sales Enablement Brief", description: "Give sales a more usable understanding of this buyer." }, { type: "asset", icon: "▣", title: "Buyer Persona Card", description: "Generate a polished buyer persona summary asset." }]} />,
    addNarrativeSection: <NarrativeAddSectionPanel />,
    strategy: <BuildNarrativeWorkspacePanel section="gtm" pd={pd} pos={pos} msg={msg} strat={strat} aiDraft={aiDraft} userEdits={userEdits} improveMode={narrativeUiState.improveMode} enhancingSection={narrativeUiState.enhancingSection} onEnhanceSection={handleEnhanceSection} onFieldChange={updateNarrativeField} />,
    story: <StoryPanel d={safeStory} set={setStory} pd={pd} compact={!useCanvasColumns} layout={storyLayout} setLayout={setStoryLayout} starredTiles={starredTiles} onToggleStar={toggleStarredTile} starContext="story" />,
    alignment: <AlignmentPanel d={{
      ...feedbackDashboardData,
      reviewItems: rawReviewItems,
      approvedChanges,
      compareVersion,
      onChangeCompare: setCompareVersionId,
      onOpenSection: sectionId => setActive(sectionId),
      onApproveChange: approveReviewItem,
      onDismissChange: dismissReviewItem,
      onPublishVersion: publishNarrativeVersion,
    }} set={setAlignment} compact={!useCanvasColumns} />,
    analytics: <AnalyticsPanel d={feedbackDashboardData} set={setAnalytics} compact={!useCanvasColumns} />,
    confidence: <ConfidencePanel d={{ ...confidence, confidenceScore: feedbackConfidenceScore, narrativeHealth: narrativeHealthMetrics, alignment: alignmentMatrix, aiContext: { ...aiContext, feedbackInsights: reviewInsights }, assets, reviewAnalytics, feedbackSignals: activeFeedbackSignals }} set={setConfidence} compact={!useCanvasColumns} />,
    competitionOverview: <CompetitionOverviewPanel comp={comp} />,
    competitionComparison: <CompetitionComparisonPanel comp={comp} setComp={setComp} compact={!useCanvasColumns} layout={competitionComparisonLayout} setLayout={setCompetitionComparisonLayout} starredTiles={starredTiles} onToggleStar={toggleStarredTile} starContext="competitionComparison" />,
    competitionSales: <CompetitionSalesPanel comp={comp} setComp={setComp} compact={!useCanvasColumns} layout={competitionSalesLayout} setLayout={setCompetitionSalesLayout} starredTiles={starredTiles} onToggleStar={toggleStarredTile} starContext="competitionSales" />,
    reviewCenter: <ProjectReviewCenter reviewState={projectReview.status} reviewTeams={projectReview.teams} reviewSections={reviewSections} reviewRouting={currentReviewRouting} assignedSections={assignedReviewSections} sectionReviews={currentSectionReviews} reviewInsights={reviewInsights} confidenceScore={feedbackConfidenceScore} reviewAnalytics={reviewAnalytics} pmmActionQueue={pmmActionQueue} onAssignTeam={assignSectionToReviewTeam} onUpdateScore={updateSectionReviewScore} onUpdateComment={updateSectionReviewComment} onChooseImprove={markSectionReviewForImprove} onChooseApprove={approveSectionReview} onSubmitFeedback={submitCurrentTeamReview} onSendReview={sendReviewRouting} feedbackCount={feedbackEntries.length} compactView={compressedCenterTables} />,
    assets: <AssetsPanel d={assets} set={setAssets} pd={pd} msg={msg} strat={strat} aiDraft={aiDraft} compactView={compressedCenterTables} />,
  };

  const groupOverviewMap = {
    "Product Truth": "productTruth",
    Narrative: "narrative",
    Competition: "competitionOverview",
    "GTM Readiness": "strategy",
    Resources: "assets",
  };
  const activeGroup = Object.entries(groupOverviewMap).find(([, id]) => id === active)?.[0] || MVP_NAV.find(g => g.items.some(i => i.id === active))?.group || "";
  const activeLabel =
    active === "productTruth"
      ? "Product Truth"
      : active === "narrative"
        ? "Narrative"
        : active === "strategy"
          ? "GTM Readiness"
        : MVP_NAV.flatMap(g => g.items).find(i => i.id === active)?.label || "";
  const activeSummary = previewMap[active];
  const quickActions = [
    { id: "summarize", label: `Summarize ${activeLabel}` },
    { id: "sharpen", label: `Sharpen ${activeLabel}` },
    { id: "risks", label: `Find risks in ${activeLabel}` },
  ];

  function dismissReviewItem(itemId) {
    setReviewDismissed(prev => ({ ...prev, [itemId]: true }));
  }

  function approveReviewItem(item) {
    if (!item) return;

    if (item.id === "positioning-needs-update") {
      setPos(prev => ({
        ...prev,
        statement: prev.statement || `For ${pd.audience || "modern teams"} who need a clearer way to solve ${pd.problem || "this problem"}, ${pd.name || "this product"} is the solution that delivers ${pd.solution || "a sharper outcome"} with less narrative drift.`,
      }));
    }

    if (item.id === "messaging-missing-pillars") {
      const topBenefits = (cap.featureBenefits || [])
        .filter(entry => entry.feature || entry.benefit)
        .slice(0, 3)
        .map(entry => `${entry.feature || "Feature"}: ${entry.benefit || "Customer benefit"}`)
        .join(" | ");
      setMsg(prev => ({
        ...prev,
        pillars: prev.pillars || topBenefits || `Clear value, proof-backed differentiation, and launch-ready messaging for ${pd.audience || "the target audience"}.`,
      }));
    }

    if (item.id === "value-prop-gap") {
      setPos(prev => ({
        ...prev,
        valueProp: prev.valueProp || `${pd.name || "Loop"} helps ${pd.audience || "go-to-market teams"} turn product truth into a clear story with stronger differentiation and measurable feedback.`,
      }));
    }

    if (item.id === "proof-points-gap") {
      setComp(prev => ({
        ...prev,
        proofPoints: prev.proofPoints || `${pd.diff || "Differentiation"} supported by ${analytics.performance.revenue} influenced revenue, ${analytics.performance.wins} wins, and ${analytics.performance.downloads} asset downloads.`,
      }));
    }

    if (item.id === "asset-rollout-gap") {
      setAssets(prev => ({
        ...prev,
        notes: prev.notes || `Refresh launch assets to align with ${brand.tagline || "the latest brand direction"} and updated narrative claims.`,
      }));
    }

    setApprovedChanges(prev => ({ ...prev, [item.id]: true }));
    dismissReviewItem(item.id);
    setActive(item.target);
  }

  function publishNarrativeVersion() {
    const current = narrativeVersions[0];
    const nextStartDate = addDays(analytics.narrativePeriod.endDate, 1);
    const nextEndDate = addDays(nextStartDate, 89);

    setAnalytics(prev => ({
      ...prev,
      versions: [
        current,
        ...(prev.versions || []).filter(version => version.id !== current.id),
      ],
      narrativePeriod: {
        id: `narrative-period-${Date.now()}`,
        version: nextVersionLabel(prev.narrativePeriod.version),
        startDate: nextStartDate,
        endDate: nextEndDate,
      },
    }));

    setCompareVersionId(current.id);
  }

  async function refreshRemoteProjects(showNoticeOnFail = false, syncMode = "merge", allowEmptyReplace = false) {
    if (!isSupabaseConfigured()) {
      setRemoteProjectsLoaded(true);
      return [];
    }

    try {
      const projects = await listLoopProjects();
      const sanitizedRemoteProjects = sanitizeProjects(projects);
      setTestProjects(prev => (
        syncMode === "replace"
          ? (sanitizedRemoteProjects.length || allowEmptyReplace
              ? sanitizedRemoteProjects
              : sanitizeProjects(prev))
          : mergeProjectsById(sanitizeProjects(prev), sanitizedRemoteProjects)
      ));
      setRemoteProjectsLoaded(true);
      return sanitizedRemoteProjects;
    } catch {
      setRemoteProjectsLoaded(true);
      if (showNoticeOnFail) {
        setPlatformNotice("Loop could not refresh projects from Supabase. Check the connection and try again.");
      } else {
        setPlatformNotice("Supabase is connected, but Loop's database schema is not ready yet. Run the SQL in supabase/loop_mvp_schema.sql to enable live project saves.");
      }
      return [];
    }
  }

  useEffect(() => {
    function onResize() {
      setViewportWidth(window.innerWidth);
    }

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(LOOP_STORAGE_KEY);
      if (!raw) {
        hasHydratedRef.current = true;
        return;
      }
      const saved = JSON.parse(raw);
      if (saved.screen) setScreen(saved.screen);
      if (saved.platformMode) setPlatformMode(saved.platformMode);
      if (saved.active) setActive(normalizeWorkspaceActive(saved.active));
      if (saved.workflowStage) setWorkflowStage(normalizeWorkflowStage(saved.workflowStage));
      if (saved.workflowEvents) setWorkflowEvents(saved.workflowEvents);
      if (typeof saved.launchComplete === "boolean") setLaunchComplete(saved.launchComplete);
      if (typeof saved.feedbackCaptured === "boolean") setFeedbackCaptured(saved.feedbackCaptured);
      if (saved.testScenarioLoaded) setTestScenarioLoaded(saved.testScenarioLoaded);
      if (saved.platformNotice) setPlatformNotice(saved.platformNotice);
      if (saved.reviewDismissed) setReviewDismissed(saved.reviewDismissed);
      if (saved.approvedChanges) setApprovedChanges(saved.approvedChanges);
      if (saved.compareVersionId) setCompareVersionId(saved.compareVersionId);
      if (saved.starredTiles) setStarredTiles(saved.starredTiles);
      if (saved.testProjects) setTestProjects(sanitizeProjects(saved.testProjects));
      if (saved.currentTestProjectId) setCurrentTestProjectId(saved.currentTestProjectId);
      if (saved.versionDraft) setVersionDraft(saved.versionDraft);
      if (saved.pd) setPd(normalizePdState(saved.pd));
      if (saved.cap) setCap(normalizeCapabilitiesState(saved.cap));
      if (saved.comp) setComp(normalizeCompetitionState(saved.comp));
      if (saved.pos) setPos(normalizePositioningState(saved.pos));
      if (saved.msg) setMsg(normalizeMessagingState(saved.msg));
      if (saved.aud) setAud(normalizeAudienceState(saved.aud));
      if (saved.strat) setStrat(normalizeStrategyState(saved.strat));
      if (saved.story) setStory(normalizeStoryState(saved.story));
      if (saved.alignment) setAlignment(normalizeAlignmentState(saved.alignment));
      if (saved.assets) setAssets(normalizeAssetsState(saved.assets));
      if (saved.analytics) setAnalytics(normalizeAnalyticsState(saved.analytics));
      if (saved.confidence) setConfidence(normalizeConfidenceState(saved.confidence));
      if (saved.aiDraft) setAiDraft(saved.aiDraft);
      if (saved.userEdits) setUserEdits(saved.userEdits);
      if (saved.narrativeUiState) setNarrativeUiState(saved.narrativeUiState);
      if (saved.brand) setBrand(saved.brand);
      if (saved.workspaceSaves) setWorkspaceSaves(saved.workspaceSaves);
      if (saved.projectReview) setProjectReview(saved.projectReview);
      if (saved.reviewRouting) setReviewRouting(saved.reviewRouting);
      if (saved.sectionReviews) setSectionReviews(saved.sectionReviews);
      if (saved.reviewInsights) setReviewInsights(saved.reviewInsights);
      if (saved.feedbackEntries) setFeedbackEntries(saved.feedbackEntries);
    } catch {
      // Ignore malformed local state and fall back to defaults.
    } finally {
      hasHydratedRef.current = true;
    }
  }, []);

  useEffect(() => {
    refreshRemoteProjects(false, "replace", false);
  }, []);

  useEffect(() => {
    if (screen !== "projectsHub") return;
    refreshRemoteProjects(true, "replace", false);
  }, [screen]);

  useEffect(() => {
    if (screen !== "projectsHub" || !isSupabaseConfigured()) return;

    const syncProjects = () => {
      refreshRemoteProjects(false, "replace", false);
    };

    const intervalId = window.setInterval(syncProjects, 4000);
    window.addEventListener("focus", syncProjects);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", syncProjects);
    };
  }, [screen]);

  useEffect(() => {
    const brokenProjects = (testProjects || []).filter(shouldQuarantineProject);
    if (!brokenProjects.length) return;

    const brokenIds = new Set(brokenProjects.map(project => project.id));

    setTestProjects(prev => prev.filter(project => !brokenIds.has(project.id)));

    if (brokenIds.has(currentTestProjectId)) {
      setCurrentTestProjectId("");
      if (screen === "workspace") {
        setScreen("projectsHub");
      }
    }

    if (!isSupabaseConfigured()) return;

    brokenProjects.forEach(project => {
      if (!project?.id || deletedBrokenProjectsRef.current.has(project.id)) return;
      deletedBrokenProjectsRef.current.add(project.id);
      deleteRemoteLoopProject(project.id).catch(() => {
        deletedBrokenProjectsRef.current.delete(project.id);
      });
    });
  }, [currentTestProjectId, screen, testProjects]);

  useEffect(() => {
    if (typeof window === "undefined" || !hasHydratedRef.current) return;
    const snapshot = {
      screen,
      platformMode,
      active,
      workflowStage,
      workflowEvents,
      launchComplete,
      feedbackCaptured,
      testScenarioLoaded,
      platformNotice,
      reviewDismissed,
      approvedChanges,
      compareVersionId,
      starredTiles,
      testProjects: sanitizeProjects(testProjects),
      currentTestProjectId,
      versionDraft,
      pd,
      cap,
      comp,
      pos,
      msg,
      aud,
      strat,
      story,
      assets,
      analytics,
      confidence,
      aiDraft,
      userEdits,
      narrativeUiState,
      brand,
      workspaceSaves,
      projectReview,
      reviewRouting,
      sectionReviews: currentSectionReviews,
      reviewInsights,
      feedbackEntries,
    };
    window.localStorage.setItem(LOOP_STORAGE_KEY, JSON.stringify(snapshot));
  }, [
    screen,
    platformMode,
    active,
    workflowStage,
    workflowEvents,
    launchComplete,
    feedbackCaptured,
    testScenarioLoaded,
    platformNotice,
    reviewDismissed,
    approvedChanges,
    compareVersionId,
    starredTiles,
    testProjects,
    currentTestProjectId,
    versionDraft,
    pd,
    cap,
    comp,
    pos,
    msg,
    aud,
    strat,
    story,
    assets,
    analytics,
    confidence,
    aiDraft,
    userEdits,
    narrativeUiState,
    brand,
    workspaceSaves,
    projectReview,
    reviewRouting,
    currentSectionReviews,
    reviewInsights,
    feedbackEntries,
  ]);

  useEffect(() => {
    if (!currentTestProjectId) return;
    if (restoringProjectRef.current) return;
    if (!["workspace", "contextReview", "reviewRouting"].includes(screen)) return;
    const snapshot = buildTestProjectSnapshot(currentTestProjectId);
    setTestProjects(prev => mergeProjectsById(prev, [snapshot]));

    if (!remoteProjectsLoaded || !isSupabaseConfigured()) return;

    if (remoteSyncTimerRef.current) {
      clearTimeout(remoteSyncTimerRef.current);
    }

    remoteSyncTimerRef.current = setTimeout(async () => {
      try {
        const savedProject = await saveLoopProject(snapshot);
        if (savedProject) {
          setTestProjects(prev => mergeProjectsById(prev, [savedProject]));
        }
      } catch {
        setPlatformNotice("Loop could not save to Supabase. Check that the loop_projects table and public policies were created.");
      }
    }, 500);
  }, [
    currentTestProjectId,
    screen,
    remoteProjectsLoaded,
    pd,
    cap,
    comp,
    pos,
    msg,
    aud,
    strat,
    story,
    assets,
    analytics,
    confidence,
    aiDraft,
    userEdits,
    narrativeUiState,
    workspaceSaves,
    projectReview,
    currentSectionReviews,
    feedbackEntries,
    active,
    workflowStage,
    launchComplete,
    feedbackCaptured,
    reviewDismissed,
    approvedChanges,
    compareVersionId,
  ]);

  useEffect(() => {
    if (!isMobile) {
      setAiOpen(false);
    }
  }, [isMobile]);

  useEffect(() => () => {
    if (remoteSyncTimerRef.current) {
      clearTimeout(remoteSyncTimerRef.current);
    }
  }, []);

  async function runAssistantPrompt(promptText) {
    if (!promptText?.trim() || aiLoading) return;
    setAiLoading(true);
    try {
      const response = await callClaude(promptText);
      setAiOutput(response || "Loop AI did not return a response. Try asking with more product context.");
    } catch {
      setAiOutput("Loop AI could not answer right now. Check the OpenAI key, model access, and billing, then try again.");
      setPlatformNotice("Ask AI could not complete that request. Verify the OpenAI key and billing, then try again.");
    } finally {
      setAiLoading(false);
    }
  }

  function handleQuickAction(action) {
    const promptText = `${action.label}. Current section: ${activeLabel}. Current content: ${activeSummary || "No content yet."}`;
    setAiTab("changes");
    setAiPrompt(promptText);
    runAssistantPrompt(promptText);
  }

  function applyNarrativeDraftToWorkingState(draft, preserveEdited = false) {
    const shouldApply = key => !preserveEdited || !userEdits[key];
    const productInput = buildProductInput(pd);
    const legacy = buildLegacyCanvasValues(productInput, draft);

    if (shouldApply("productTruth.problem")) {
      setPd(prev => ({
        ...prev,
        category: prev.category || draft.context.productCategory || prev.category,
        whatItDoes: prev.whatItDoes || legacy.whatItDoes,
        builtFor: prev.builtFor || legacy.builtFor,
        problem: draft.productTruth.problem || prev.problem,
        problemStatement: draft.productTruth.problem || prev.problemStatement,
        problemImpact: prev.problemImpact || legacy.problemImpact,
        currentSolutionGaps: prev.currentSolutionGaps || legacy.currentSolutionGaps,
        solution: draft.productTruth.solution || prev.solution || prev.description || draft.sourceSummary || "",
        solutionMechanism: prev.solutionMechanism || legacy.solutionMechanism,
        whyNow: prev.whyNow || legacy.whyNow,
      }));
    }

    if (shouldApply("productTruth.icp")) {
      setPd(prev => ({ ...prev, audience: draft.productTruth.icp || prev.audience }));
      setStrat(prev => ({ ...prev, icp: draft.productTruth.icp || prev.icp }));
    }

    if (shouldApply("productTruth.value")) {
      setPos(prev => ({ ...prev, valueProp: draft.narrative.valueProposition || draft.productTruth.value || prev.valueProp }));
      setPd(prev => ({ ...prev, diff: draft.productTruth.differentiation || draft.productTruth.value || prev.diff }));
      setComp(prev => ({
        ...prev,
        differentiators: prev.differentiators || legacy.differentiators,
        alternativeGaps: prev.alternativeGaps || legacy.alternativeGaps,
        proofPoints: prev.proofPoints || legacy.proofPoints,
      }));
    }

    if (shouldApply("narrative.positioning")) {
      setPos(prev => ({ ...prev, statement: draft.narrative.positioning || prev.statement }));
    }

    if (shouldApply("narrative.messaging")) {
      const joinedMessages = normalizeDraftText(draft.narrative.topMessages);
      setMsg(prev => ({
        ...prev,
        pillars: draft.narrative.messaging || joinedMessages || prev.pillars,
        headline: draft.assets.headline || prev.headline || (draft.narrative.positioning || "").split(".")[0],
        elevator: draft.assets.elevatorPitch || prev.elevator || `${draft.productTruth.value || ""} ${draft.narrative.positioning || ""}`.trim(),
      }));
    }

    if (shouldApply("gtm.channels")) {
      setStrat(prev => ({ ...prev, channels: draft.gtm.channels || prev.channels }));
    }

    if (shouldApply("gtm.strategy") || shouldApply("gtm.launchStrategy")) {
      setStrat(prev => ({
        ...prev,
        goal: draft.gtm.strategy || prev.goal || "Validate the narrative with early launch feedback.",
        hooks: draft.gtm.launchApproach || draft.gtm.hooks || prev.hooks,
      }));
    }
  }

async function generateNarrativeDraft(productInput, contextOverride = null) {
  const fallback = buildLocalNarrativeDraft(productInput);
  const context = contextOverride || await generateContext(productInput);
    const productTruth = await generateProductTruth(context, productInput);
    const narrative = await generateNarrative(productTruth, context, productInput);
    const gtm = await generateGtm(narrative, productTruth, context, productInput);
    const assetsDraft = await generateAssets(narrative, gtm, productTruth, context, productInput);

    return {
      ...fallback,
      context,
      productTruth: { ...fallback.productTruth, ...productTruth },
      narrative: { ...fallback.narrative, ...narrative },
      gtm: { ...fallback.gtm, ...gtm },
      assets: { ...fallback.assets, ...assetsDraft },
      sourceSummary: productInput.description || fallback.sourceSummary,
    };
  }

async function generateCoreNarrativeDraft(productInput, contextOverride = null) {
  const fallback = buildLocalNarrativeDraft(productInput);
  const context = contextOverride || await generateContext(productInput);
  const productTruth = await generateProductTruth(context, productInput);
  const narrative = await generateNarrative(productTruth, context, productInput);

  return {
    ...fallback,
    context,
    productTruth: { ...fallback.productTruth, ...productTruth },
    narrative: { ...fallback.narrative, ...narrative },
    gtm: fallback.gtm,
    assets: fallback.assets,
    sourceSummary: productInput.description || fallback.sourceSummary,
  };
}

  async function _handleGenerateNarrative() {
    if (!(pd.name || "").trim() || !(pd.description || "").trim()) {
      setPlatformNotice("Add a product name and product description before generating a narrative.");
      return;
    }

    setPlatformNotice("");
    setNarrativeUiState(prev => ({ ...prev, isGenerating: true }));
    const nextProjectId = currentTestProjectId || `test-${Date.now()}`;
    const productInput = buildProductInput(pd);
    const draft = await generateNarrativeDraft(productInput);
    const nextLaunchDate = pd.launchDate || addDays(new Date().toISOString().slice(0, 10), 21);
    const legacy = buildLegacyCanvasValues(productInput, draft);

    setPlatformMode("test");
    setCurrentTestProjectId(nextProjectId);
    setAiDraft(draft);
    setUserEdits({});
    setPd(prev => ({
      ...prev,
      launchDate: nextLaunchDate,
      version: prev.version || "v1.0",
      status: "Started",
      whatItDoes: prev.description || prev.whatItDoes,
      category: prev.category || draft.context.productCategory || "",
    }));
    applyNarrativeDraftToWorkingState(draft, false);
    setAssets(prev => ({
      ...prev,
      notes: prev.notes || [
        draft.assets.headline ? `Homepage headline: ${draft.assets.headline}` : "",
        draft.assets.elevatorPitch ? `Elevator pitch: ${draft.assets.elevatorPitch}` : "",
        draft.assets.emailPitch ? `Email pitch: ${draft.assets.emailPitch}` : "",
        draft.assets.messagingAsset ? `Messaging asset: ${draft.assets.messagingAsset}` : "",
      ].filter(Boolean).join("\n\n") || "Generate launch-ready assets from the approved narrative draft.",
    }));
    setProjectReview(prev => ({ ...prev, status: "Draft", lastAction: "AI narrative draft generated" }));
    setWorkflowStage("productTruth");
    setActive("productTruth");
    setScreen("workspace");
    setNarrativeUiState({
      isGenerated: true,
      improveMode: false,
      isGenerating: false,
      enhancingSection: "",
    });
    setTestScenarioLoaded(false);
    setPlatformNotice("✨ Draft generated — refine it, generate assets, and close the loop with feedback.");

    const projectSnapshot = {
      id: nextProjectId,
      name: pd.name.trim(),
      description: pd.description.trim(),
      launchDate: nextLaunchDate,
      version: pd.version || "v1.0",
      status: "Started",
      updatedAt: new Date().toISOString(),
      snapshot: {
        pd: {
          ...pd,
          launchDate: nextLaunchDate,
          version: pd.version || "v1.0",
          status: "Started",
          whatItDoes: pd.whatItDoes || legacy.whatItDoes,
          builtFor: pd.builtFor || legacy.builtFor,
          category: pd.category || draft.context.productCategory || "",
          problem: draft.productTruth.problem,
          problemStatement: draft.productTruth.problem,
          problemImpact: pd.problemImpact || legacy.problemImpact,
          currentSolutionGaps: pd.currentSolutionGaps || legacy.currentSolutionGaps,
          audience: draft.productTruth.icp,
          solution: draft.productTruth.solution,
          solutionMechanism: pd.solutionMechanism || legacy.solutionMechanism,
          whyNow: pd.whyNow || legacy.whyNow,
          diff: draft.productTruth.differentiation || draft.productTruth.value,
        },
        cap,
        comp: {
          ...comp,
          differentiators: comp.differentiators || legacy.differentiators,
          alternativeGaps: comp.alternativeGaps || legacy.alternativeGaps,
          proofPoints: comp.proofPoints || legacy.proofPoints,
        },
        pos: {
          ...pos,
          statement: draft.narrative.positioning,
          valueProp: draft.narrative.valueProposition || draft.productTruth.value,
        },
        msg: {
          ...msg,
          pillars: draft.narrative.messaging || normalizeDraftText(draft.narrative.topMessages),
          headline: draft.assets.headline || msg.headline || (draft.narrative.positioning || "").split(".")[0],
          elevator: draft.assets.elevatorPitch || msg.elevator || `${draft.productTruth.value || ""} ${draft.narrative.positioning || ""}`.trim(),
        },
        aud,
        strat: {
          ...strat,
          icp: draft.productTruth.icp,
          goal: draft.gtm.strategy || strat.goal || "Validate the narrative with early launch feedback.",
          channels: draft.gtm.channels,
          hooks: draft.gtm.hooks,
        },
        story,
        assets: {
          ...assets,
          notes: assets.notes || [
            draft.assets.headline ? `Homepage headline: ${draft.assets.headline}` : "",
            draft.assets.elevatorPitch ? `Elevator pitch: ${draft.assets.elevatorPitch}` : "",
            draft.assets.emailPitch ? `Email pitch: ${draft.assets.emailPitch}` : "",
            draft.assets.messagingAsset ? `Messaging asset: ${draft.assets.messagingAsset}` : "",
          ].filter(Boolean).join("\n\n") || "Generate launch-ready assets from the approved narrative draft.",
        },
        analytics,
        confidence,
        workspaceSaves,
        projectReview: {
          ...projectReview,
          status: "Draft",
          lastAction: "AI narrative draft generated",
        },
        feedbackEntries,
        aiDraft: draft,
        userEdits: {},
        narrativeUiState: {
          isGenerated: true,
          improveMode: false,
          isGenerating: false,
          enhancingSection: "",
        },
        active: "productTruth",
        workflowStage: "productTruth",
        launchComplete: false,
        feedbackCaptured: false,
        reviewDismissed: {},
        approvedChanges: {},
        compareVersionId: "",
      },
    };

    setTestProjects(prev => mergeProjectsById(prev, [projectSnapshot]));
    if (isSupabaseConfigured()) {
      try {
        const savedProject = await saveLoopProject(projectSnapshot);
        if (savedProject) {
          setTestProjects(prev => mergeProjectsById(prev, [savedProject]));
          refreshRemoteProjects(false);
        }
      } catch {
        setPlatformNotice("Narrative generated, but Loop could not save the new project to Supabase. Check the connection and try again.");
      }
    }
  }

  async function handleGenerateNarrativeReliable() {
    if (!(pd.name || "").trim() || !(pd.description || "").trim()) {
      setPlatformNotice("Add a product name and product description before generating a narrative.");
      return;
    }

    if (versionDraft.sourceProjectId && versionDraft.mode === "minor") {
      await createMinorVersionFromSource();
      return;
    }

    setPlatformNotice("");
    setNarrativeUiState(prev => ({ ...prev, isGenerating: true }));

    const currentProject = testProjects.find(project => project.id === currentTestProjectId);
    const currentProjectName = (
      currentProject?.snapshot?.pd?.name ||
      currentProject?.name ||
      ""
    ).trim().toLowerCase();
    const requestedProjectName = (pd.name || "").trim().toLowerCase();
    const shouldCreateNewProject =
      !!versionDraft.sourceProjectId ||
      !currentTestProjectId ||
      screen !== "workspace" ||
      (requestedProjectName && currentProjectName && requestedProjectName !== currentProjectName);
    const nextProjectId = shouldCreateNewProject ? `test-${Date.now()}` : currentTestProjectId;
    const nextLaunchDate = pd.launchDate || addDays(new Date().toISOString().slice(0, 10), 21);

    setPlatformMode("test");
    setCurrentTestProjectId(nextProjectId);
    setUserEdits({});
    setWorkflowStage("productTruth");
    setActive("productTruth");
    setScreen("contextReview");
    setTestScenarioLoaded(false);
    setPd(prev => ({
      ...prev,
      launchDate: nextLaunchDate,
      version: prev.version || "v1.0",
      status: "Started",
      whatItDoes: prev.description || prev.whatItDoes,
      changeType: versionDraft.sourceProjectId ? versionDraft.mode : prev.changeType,
    }));
    setProjectReview(prev => ({ ...prev, status: "Draft", lastAction: "Narrative generation started" }));

    const baseProjectSnapshot = {
      id: nextProjectId,
      name: pd.name.trim(),
      description: pd.description.trim(),
      launchDate: nextLaunchDate,
      version: pd.version || "v1.0",
      status: "Started",
      updatedAt: new Date().toISOString(),
      snapshot: {
        pd: {
          ...pd,
          launchDate: nextLaunchDate,
          version: pd.version || "v1.0",
          status: "Started",
          whatItDoes: pd.description || pd.whatItDoes,
          previousVersionId: pd.previousVersionId || versionDraft.sourceProjectId || "",
          previousVersionName: pd.previousVersionName || "",
          changeType: versionDraft.sourceProjectId ? versionDraft.mode : pd.changeType || "",
        },
        cap,
        comp,
        pos,
        msg,
        aud,
        strat,
        story,
        assets,
        analytics,
        confidence,
        workspaceSaves,
        projectReview: {
          ...projectReview,
          status: "Draft",
          lastAction: "Narrative generation started",
        },
        feedbackEntries,
        aiDraft: makeEmptyAiDraft(),
        userEdits: {},
        narrativeUiState: {
          isGenerated: false,
          improveMode: false,
          isGenerating: true,
          enhancingSection: "",
        },
        active: "productTruth",
        workflowStage: "productTruth",
        launchComplete: false,
        feedbackCaptured: false,
        reviewDismissed: {},
        approvedChanges: {},
        compareVersionId: "",
      },
    };

    setTestProjects(prev => mergeProjectsById(prev, [baseProjectSnapshot]));
    if (isSupabaseConfigured()) {
      try {
        const savedProject = await saveLoopProject(baseProjectSnapshot);
        if (savedProject) {
          setTestProjects(prev => mergeProjectsById(prev, [savedProject]));
          refreshRemoteProjects(false);
        }
      } catch (error) {
        setPlatformNotice(`Loop started the project locally, but could not save the new project to Supabase yet: ${error?.message || "Unknown error"}`);
      }
    }

    try {
      const productInput = buildProductInput(pd);
      const context = await generateContext(productInput);
      setAiDraft(prev => ({ ...prev, context }));
      setNarrativeUiState(prev => ({ ...prev, isGenerating: false }));
      setPlatformNotice("AI context is ready. Confirm it, then Loop will draft Product Truth, Core Narrative, and GTM.");
    } catch {
      setNarrativeUiState(prev => ({ ...prev, isGenerating: false }));
      setPlatformNotice("Loop could not generate AI context right now. Check the OpenAI setup and try again.");
    }
  }

  async function handleConfirmAiContext() {
    if (!(pd.name || "").trim() || !(pd.description || "").trim()) {
      setPlatformNotice("Add a product name and product description before generating a narrative.");
      return;
    }

    const nextLaunchDate = pd.launchDate || addDays(new Date().toISOString().slice(0, 10), 21);
    const productInput = buildProductInput(pd);
    const reviewedContext = {
      ...makeEmptyAiDraft().context,
      ...(aiDraft.context || {}),
    };
    const baseProjectSnapshot = buildTestProjectSnapshot(currentTestProjectId || `test-${Date.now()}`);

    try {
      setNarrativeUiState(prev => ({ ...prev, isGenerating: true }));
      const coreDraft = await generateCoreNarrativeDraft(productInput, reviewedContext);
      const legacy = buildLegacyCanvasValues(productInput, coreDraft);
      const fallbackAssetNotes = "Generating GTM channels and starter assets in the background.";

      setAiDraft(coreDraft);
      setPd(prev => ({
        ...prev,
        launchDate: nextLaunchDate,
        version: prev.version || "v1.0",
        status: "Started",
        whatItDoes: prev.whatItDoes || legacy.whatItDoes,
        builtFor: prev.builtFor || legacy.builtFor,
        category: prev.category || coreDraft.context.productCategory || "",
        previousVersionId: prev.previousVersionId || versionDraft.sourceProjectId || "",
        previousVersionName: prev.previousVersionName || "",
        changeType: versionDraft.sourceProjectId ? versionDraft.mode : prev.changeType || "",
      }));
      applyNarrativeDraftToWorkingState(coreDraft, false);
      setAssets(prev => ({ ...prev, notes: prev.notes || fallbackAssetNotes }));
      setProjectReview(prev => ({ ...prev, status: "Draft", lastAction: "AI narrative draft generated" }));
      setScreen("workspace");
      setNarrativeUiState({
        isGenerated: true,
        improveMode: false,
        isGenerating: false,
        enhancingSection: "",
      });
      setPlatformNotice("Core draft is ready. Loop opened the workspace and is finishing GTM and assets in the background.");

      const rawProjectSnapshot = {
        ...baseProjectSnapshot,
        updatedAt: new Date().toISOString(),
        snapshot: {
          ...baseProjectSnapshot.snapshot,
          pd: {
            ...baseProjectSnapshot.snapshot.pd,
            whatItDoes: pd.whatItDoes || legacy.whatItDoes,
            builtFor: pd.builtFor || legacy.builtFor,
            category: pd.category || coreDraft.context.productCategory || "",
            problem: coreDraft.productTruth.problem,
            problemStatement: coreDraft.productTruth.problem,
            problemImpact: pd.problemImpact || legacy.problemImpact,
            currentSolutionGaps: pd.currentSolutionGaps || legacy.currentSolutionGaps,
            audience: coreDraft.productTruth.icp,
            solution: coreDraft.productTruth.solution,
            solutionMechanism: pd.solutionMechanism || legacy.solutionMechanism,
            whyNow: pd.whyNow || legacy.whyNow,
            diff: coreDraft.productTruth.differentiation || coreDraft.productTruth.value,
            previousVersionId: pd.previousVersionId || versionDraft.sourceProjectId || "",
            previousVersionName: pd.previousVersionName || "",
            changeType: versionDraft.sourceProjectId ? versionDraft.mode : pd.changeType || "",
            whatChanged: pd.whatChanged || "",
          },
          comp: {
            ...comp,
            differentiators: comp.differentiators || legacy.differentiators,
            alternativeGaps: comp.alternativeGaps || legacy.alternativeGaps,
            proofPoints: comp.proofPoints || legacy.proofPoints,
          },
          pos: {
            ...pos,
            statement: coreDraft.narrative.positioning,
            valueProp: coreDraft.narrative.valueProposition || coreDraft.productTruth.value,
          },
          msg: {
            ...msg,
            pillars: coreDraft.narrative.messaging || normalizeDraftText(coreDraft.narrative.topMessages),
            headline: msg.headline || (coreDraft.narrative.positioning || "").split(".")[0],
            elevator: msg.elevator || `${coreDraft.productTruth.value || ""} ${coreDraft.narrative.positioning || ""}`.trim(),
          },
          strat: {
            ...strat,
            icp: coreDraft.productTruth.icp,
            goal: strat.goal || "Validate the narrative with early launch feedback.",
            channels: strat.channels,
            hooks: strat.hooks,
          },
          assets: {
            ...assets,
            notes: assets.notes || fallbackAssetNotes,
          },
          projectReview: {
            ...projectReview,
            status: "Draft",
            lastAction: "AI narrative draft generated",
          },
          aiDraft: coreDraft,
          userEdits: {},
          narrativeUiState: {
            isGenerated: true,
            improveMode: false,
            isGenerating: false,
            enhancingSection: "",
          },
          compareVersionId: pd.previousVersionId || versionDraft.sourceProjectId || "",
        },
      };
      const hydratedProjectSnapshot = hydrateDraftSnapshot(rawProjectSnapshot.snapshot);
      const projectSnapshot = {
        ...rawProjectSnapshot,
        status: getProjectLifecycle(hydratedProjectSnapshot).label,
        snapshot: hydratedProjectSnapshot,
      };

      setTestProjects(prev => mergeProjectsById(prev, [projectSnapshot]));
      setVersionDraft({ sourceProjectId: "", mode: "minor" });
      if (isSupabaseConfigured()) {
        try {
          const savedProject = await saveLoopProject(projectSnapshot);
          if (savedProject) {
            setTestProjects(prev => mergeProjectsById(prev, [savedProject]));
            refreshRemoteProjects(false);
          }
        } catch (error) {
          setPlatformNotice(`Narrative generated, but Loop could not save the completed draft to Supabase: ${error?.message || "Unknown error"}. The local project is still available.`);
        }
      }

      generateNarrativeDraft(productInput, reviewedContext)
        .then(async fullDraft => {
          const fullAssetNotes = [
            fullDraft.assets.headline ? `Homepage headline: ${fullDraft.assets.headline}` : "",
            fullDraft.assets.elevatorPitch ? `Elevator pitch: ${fullDraft.assets.elevatorPitch}` : "",
            fullDraft.assets.emailPitch ? `Email pitch: ${fullDraft.assets.emailPitch}` : "",
            fullDraft.assets.messagingAsset ? `Messaging asset: ${fullDraft.assets.messagingAsset}` : "",
          ].filter(Boolean).join("\n\n") || "Generate launch-ready assets from the approved narrative draft.";

          setAiDraft(fullDraft);
          applyNarrativeDraftToWorkingState(fullDraft, true);
          setAssets(prev => ({
            ...prev,
            notes: prev.notes === fallbackAssetNotes || !prev.notes ? fullAssetNotes : prev.notes,
          }));
          setPlatformNotice("Loop finished GTM and starter assets in the background.");

          const refreshedSnapshot = buildTestProjectSnapshot(currentTestProjectId || baseProjectSnapshot.id);
          const enrichedSnapshot = hydrateDraftSnapshot({
            ...refreshedSnapshot.snapshot,
            aiDraft: fullDraft,
            assets: {
              ...refreshedSnapshot.snapshot.assets,
              notes:
                refreshedSnapshot.snapshot.assets?.notes === fallbackAssetNotes || !refreshedSnapshot.snapshot.assets?.notes
                  ? fullAssetNotes
                  : refreshedSnapshot.snapshot.assets?.notes,
            },
          });
          const finalProject = {
            ...refreshedSnapshot,
            updatedAt: new Date().toISOString(),
            snapshot: enrichedSnapshot,
          };
          setTestProjects(prev => mergeProjectsById(prev, [finalProject]));
          if (isSupabaseConfigured()) {
            try {
              const savedProject = await saveLoopProject(finalProject);
              if (savedProject) {
                setTestProjects(prev => mergeProjectsById(prev, [savedProject]));
                refreshRemoteProjects(false);
              }
            } catch {
              setPlatformNotice("Loop finished GTM and assets locally, but could not sync the background updates to Supabase yet.");
            }
          }
        })
        .catch(() => {
          setPlatformNotice("Loop opened the workspace with the core draft, but background GTM and asset generation did not finish. You can keep working and retry later.");
        });
    } catch {
      setNarrativeUiState({
        isGenerated: false,
        improveMode: false,
        isGenerating: false,
        enhancingSection: "",
      });
      setPlatformNotice("Loop could not finish the AI draft. Your project was still created, so you can continue manually and retry generation.");
    }
  }

  function updateAiContextField(key, value) {
    setAiDraft(prev => ({
      ...prev,
      context: {
        ...prev.context,
        [key]: value,
      },
    }));
  }

  function updateNarrativeField(fieldKey, value) {
    setUserEdits(prev => ({ ...prev, [fieldKey]: true }));

    if (fieldKey === "productTruth.overview") {
      setPd(prev => ({ ...prev, whatItDoes: value }));
      return;
    }
    if (fieldKey === "productTruth.problem") {
      setPd(prev => ({ ...prev, problem: value, problemStatement: value }));
      return;
    }
    if (fieldKey === "productTruth.solution") {
      setPd(prev => ({ ...prev, solution: value }));
      return;
    }
    if (fieldKey === "productTruth.icp") {
      setPd(prev => ({ ...prev, audience: value }));
      setStrat(prev => ({ ...prev, icp: value }));
      return;
    }
    if (fieldKey === "productTruth.differentiation") {
      setPd(prev => ({ ...prev, diff: value }));
      return;
    }
    if (fieldKey === "narrative.positioning") {
      setPos(prev => ({ ...prev, statement: value }));
      return;
    }
    if (fieldKey === "narrative.valueProposition") {
      setPos(prev => ({ ...prev, valueProp: value }));
      return;
    }
    if (fieldKey === "narrative.messaging") {
      setMsg(prev => ({ ...prev, pillars: value }));
      return;
    }
    if (fieldKey === "narrative.headline") {
      setMsg(prev => ({ ...prev, headline: value }));
      return;
    }
    if (fieldKey === "narrative.elevator") {
      setMsg(prev => ({ ...prev, elevator: value }));
      return;
    }
    if (fieldKey === "gtm.strategy") {
      setStrat(prev => ({ ...prev, goal: value }));
      return;
    }
    if (fieldKey === "gtm.channels") {
      setStrat(prev => ({ ...prev, channels: value }));
      return;
    }
    if (fieldKey === "gtm.launchStrategy") {
      setStrat(prev => ({ ...prev, hooks: value }));
    }
  }

  async function handleEnhanceSection(sectionId) {
    if (!narrativeUiState.isGenerated) return;
    setNarrativeUiState(prev => ({ ...prev, enhancingSection: sectionId, improveMode: true }));

    const productInput = buildProductInput(pd);
    const context = {
      productInput,
      aiDraft,
      currentState: {
        pd,
        pos,
        msg,
        strat,
      },
    };

    const fallback = buildLocalNarrativeDraft(productInput);
    try {
      const prompt = `You are improving one section of a product narrative. Return ONLY valid JSON for the requested section.
Section: ${sectionId}
Context:
${JSON.stringify(context, null, 2)}

If section is productTruth return:
{"problem":"string","icp":"string","value":"string","solution":"string","differentiation":"string"}

If section is narrative return:
{"positioning":"string","messaging":"string","valueProposition":"string","topMessages":["string","string","string"]}

If section is gtm return:
{"channels":"string","hooks":"string","strategy":"string","launchApproach":"string"}`;
      const raw = await generateOpenAiText(prompt);
      const parsed = parseJsonResponse(raw, sectionId === "productTruth" ? fallback.productTruth : sectionId === "narrative" ? fallback.narrative : fallback.gtm);
      setAiDraft(prev => {
        const next = { ...prev, [sectionId]: parsed };
        applyNarrativeDraftToWorkingState(next, true);
        return next;
      });
    } catch {
      setPlatformNotice("Loop could not enhance that section with AI right now. The current draft is still safe to refine manually.");
    } finally {
      setNarrativeUiState(prev => ({ ...prev, enhancingSection: "" }));
    }
  }

  const workspaceTabs = ["Product Truth", "Narrative", "GTM Readiness", "Resources"];
  const activeWorkspace = workspaceTabs.includes(activeGroup) ? activeGroup : "Product Truth";
  const sidebarGroups = MVP_NAV.filter(group =>
    ["Product Truth", "Narrative", "GTM Readiness", "Resources"].includes(group.group)
  );
  const askAiRightOffset = screen === "workspace" && showDesktopAiRail ? (aiRailCollapsed ? 92 : 354) : 24;

  function openWorkspaceTab(group) {
    setScreen("workspace");
    const overviewId = groupOverviewMap[group];
    if (overviewId) {
      setActive(overviewId);
      return;
    }
    const firstItem = MVP_NAV.find(navGroup => navGroup.group === group)?.items?.[0];
    if (firstItem) {
      setActive(firstItem.id);
    }
  }

  function buildTestProjectSnapshot(projectId = currentTestProjectId || `test-${Date.now()}`) {
    const existingProject = testProjects.find(project => project.id === projectId);
    const existingSnapshotPd = existingProject?.snapshot?.pd || {};
    const resolvedName = (pd.name || existingSnapshotPd.name || existingProject?.name || "").trim();
    const resolvedDescription = (pd.description || existingSnapshotPd.description || existingProject?.description || "").trim();
    const rawSnapshot = {
      pd: {
        ...pd,
        name: resolvedName || pd.name,
        description: resolvedDescription || pd.description,
      },
      cap,
      comp,
      pos,
      msg,
      aud,
      strat,
      story,
      assets,
      analytics,
      confidence,
      workspaceSaves,
      projectReview,
      reviewRouting,
      sectionReviews: currentSectionReviews,
      reviewInsights,
      feedbackEntries,
      aiDraft,
      userEdits,
      narrativeUiState,
      active,
      workflowStage,
      launchComplete,
      feedbackCaptured,
      reviewDismissed,
      approvedChanges,
      compareVersionId,
    };
    const hydratedSnapshot = mergeSnapshotPreservingContent(existingProject?.snapshot || {}, rawSnapshot);
    const lifecycle = getProjectLifecycle(hydratedSnapshot);

    return {
      id: projectId,
      name: resolvedName || "Untitled Test Project",
      description: resolvedDescription || "Loop MVP test workspace",
      launchDate: pd.launchDate,
      version: pd.version || "v1.0",
      status: lifecycle.label,
      updatedAt: new Date().toISOString(),
      snapshot: {
        ...hydratedSnapshot,
        pd: {
          ...hydratedSnapshot.pd,
          name: resolvedName || hydratedSnapshot.pd?.name || pd.name,
          description: resolvedDescription || hydratedSnapshot.pd?.description || pd.description,
        },
      },
    };
  }

  function openTestProject(project) {
    if (!project?.snapshot) return;
    const s = hydrateDraftSnapshot(project.snapshot);
    restoringProjectRef.current = true;
    setVersionDraft({ sourceProjectId: "", mode: "minor" });
    setPlatformMode("test");
    setCurrentTestProjectId(project.id);
    setScreen("workspace");
    setPd(normalizePdState(s.pd));
    setCap(normalizeCapabilitiesState(s.cap));
    setComp(normalizeCompetitionState(s.comp));
    setPos(normalizePositioningState(s.pos));
    setMsg(normalizeMessagingState(s.msg));
    setAud(normalizeAudienceState(s.aud));
    setStrat(normalizeStrategyState(s.strat));
    setStory(normalizeStoryState(s.story));
    setAlignment(normalizeAlignmentState(s.alignment));
    setAssets(normalizeAssetsState(s.assets));
    setAnalytics(normalizeAnalyticsState(s.analytics));
    setConfidence(normalizeConfidenceState(s.confidence));
    setAiDraft(s.aiDraft || makeEmptyAiDraft());
    setUserEdits(s.userEdits || {});
    setNarrativeUiState(s.narrativeUiState || { isGenerated: false, improveMode: false, isGenerating: false, enhancingSection: "" });
    setWorkspaceSaves(s.workspaceSaves || {});
    setProjectReview(s.projectReview || { status: "Draft", required: false, teams: ["Product", "Sales"], lastAction: "Project opened" });
    setReviewRouting(normalizeReviewRouting(s.reviewRouting || makeEmptyReviewRouting(), buildReviewableSections(s)));
    setSectionReviews(s.sectionReviews || {});
    setReviewInsights(s.reviewInsights || {
      normalizedSignals: {},
      topIssues: [],
      weakestParameter: "",
      strongestParameter: "",
      crossSectionPatterns: [],
      suggestions: [],
      confidenceScore: 0,
      updatedAt: "",
    });
    setFeedbackEntries(s.feedbackEntries || []);
    setActive(normalizeWorkspaceActive(s.active || "productTruth"));
    setWorkflowStage(normalizeWorkflowStage(s.workflowStage || "productTruth"));
    setLaunchComplete(!!s.launchComplete);
    setFeedbackCaptured(!!s.feedbackCaptured);
    setReviewDismissed(s.reviewDismissed || {});
    setApprovedChanges(s.approvedChanges || {});
    setCompareVersionId(s.compareVersionId || "");
    setTestProjects(prev => mergeProjectsById(prev, [{
      ...project,
      name: s.pd?.name || project.name,
      description: s.pd?.description || project.description,
      status: getProjectLifecycle(s).label,
      snapshot: s,
    }]));
    window.setTimeout(() => {
      restoringProjectRef.current = false;
    }, 200);
  }

  function deleteTestProject(projectId) {
    const remainingProjects = testProjects.filter(project => project.id !== projectId);
    setTestProjects(remainingProjects);

    if (isSupabaseConfigured()) {
      deleteRemoteLoopProject(projectId)
        .then(() => refreshRemoteProjects(true, "replace", true))
        .catch(() => {
          setPlatformNotice("Loop could not delete that project from Supabase. The platform will stay unchanged until the delete succeeds.");
          refreshRemoteProjects(true, "replace", false);
        });
    }

    if (currentTestProjectId !== projectId) return;

    setCurrentTestProjectId(remainingProjects[0]?.id || "");
    if (remainingProjects[0]) {
      openTestProject(remainingProjects[0]);
      return;
    }

    setPlatformMode("test");
    setScreen("workspace");
    setActive("productTruth");
    setWorkflowStage("productTruth");
    setLaunchComplete(false);
    setFeedbackCaptured(false);
    setWorkflowEvents([]);
    setReviewDismissed({});
    setApprovedChanges({});
    setCompareVersionId("");
    setWorkspaceSaves({});
    setAiDraft(makeEmptyAiDraft());
    setUserEdits({});
    setNarrativeUiState({ isGenerated: false, improveMode: false, isGenerating: false, enhancingSection: "" });
    setProjectReview({ status: "Draft", required: false, teams: ["Product", "Sales"], lastAction: "Project reset" });
    setReviewRouting(makeEmptyReviewRouting());
    setSectionReviews({});
    setReviewInsights({
      normalizedSignals: {},
      topIssues: [],
      weakestParameter: "",
      strongestParameter: "",
      crossSectionPatterns: [],
      suggestions: [],
      confidenceScore: 0,
      updatedAt: "",
    });
    setFeedbackEntries([]);
  }

  const onboardingReady = !!(pd.name && pd.launchDate);
  const narrativeReady = !!(pos.statement && pos.valueProp && msg.pillars);
  const assetsReady = !!assets.notes;
  const reviewReady = rawReviewItems.length === 0 && narrativeReady;

  const checklistStatusMap = {
    login: [screen !== "landing", screen !== "landing"],
    onboarding: [!!pd.name, !!pd.launchDate, onboardingReady || testScenarioLoaded],
    productTruth: [!!pd.problem, !!pd.solution, !!(pd.audience || aud.primary), !!(pd.diff || comp.differentiators)],
    narrative: [!!pos.statement, !!pos.valueProp, !!msg.pillars],
    competition: [!!comp.competitors, !!(comp.alternativeGaps || comp.differentiators)],
    gtm: [!!strat.goal, !!strat.icp, !!strat.channels],
    assets: [!!assets.notes, assetsReady],
    review: [rawReviewItems.length === 0, reviewReady],
    launch: [!!compareVersionId, launchComplete || pd.status === "live"],
    feedback: [!!analytics.signals?.length, !!confidence.decisionNotes],
    complete: [launchComplete, feedbackCaptured],
  };

  function logWorkflowEvent(title, note) {
    setWorkflowEvents(prev => [
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, title, note },
      ...prev,
    ].slice(0, 8));
  }

  function seedProductTruth(force = false) {
    setPd(prev => ({
      ...prev,
      name: force || !prev.name ? "Loop AI Launch Pilot" : prev.name,
      description: force || !prev.description ? "Narrative operating system for product launches" : prev.description,
      launchDate: force || !prev.launchDate ? addDays(new Date().toISOString().slice(0, 10), 21) : prev.launchDate,
      version: force || !prev.version ? "v1.0" : prev.version,
      status: force || prev.status === "Planned" ? "Started" : prev.status,
      category: force || !prev.category ? "B2B SaaS workflow platform" : prev.category,
      whatItDoes: force || !prev.whatItDoes ? "Loop turns product truth into aligned narrative, GTM execution, and feedback cycles." : prev.whatItDoes,
      builtFor: force || !prev.builtFor ? "Founders, PMM teams, and early GTM operators" : prev.builtFor,
      problem: force || !prev.problem ? "Teams launch with fragmented messaging and no shared source of truth." : prev.problem,
      problemStatement: force || !prev.problemStatement ? "Founders, product, sales, and marketing all describe the product differently, which slows launches and weakens conversion." : prev.problemStatement,
      problemImpact: force || !prev.problemImpact ? "Longer review cycles, lower confidence, message drift, and weaker launch outcomes." : prev.problemImpact,
      currentSolutionGaps: force || !prev.currentSolutionGaps ? "Teams rely on docs, decks, and scattered prompts, but none of them act like a live operating system." : prev.currentSolutionGaps,
      solution: force || !prev.solution ? "Loop creates one workspace for product truth, narrative, GTM, assets, and feedback." : prev.solution,
      solutionMechanism: force || !prev.solutionMechanism ? "Structured section workspaces, AI-guided drafting, review workflows, and alignment checks." : prev.solutionMechanism,
      whyNow: force || !prev.whyNow ? "AI makes synthesis easier, but teams still need governance and workflow to ship confidently." : prev.whyNow,
      audience: force || !prev.audience ? "B2B founders and PMM-led product teams" : prev.audience,
      diff: force || !prev.diff ? "Loop connects strategy, execution, and feedback instead of stopping at copy generation." : prev.diff,
    }));

    setAud(prev => ({
      ...prev,
      primary: force || !prev.primary ? "Founding PMM or founder-led marketer responsible for launch narrative" : prev.primary,
      secondary: force || !prev.secondary ? "Sales leader or product leader reviewing launch readiness" : prev.secondary,
    }));

    setCap(prev => ({
      ...prev,
      features: force || !prev.features ? "Guided workspaces, AI suggestions, review workflows, launch assets, feedback analytics" : prev.features,
      featurePriorities: force || !prev.featurePriorities ? "Product Truth first, Narrative second, GTM third" : prev.featurePriorities,
      integrations: force || !prev.integrations ? "Docs import, CRM notes, feedback channels" : prev.integrations,
      integrationValue: force || !prev.integrationValue ? "Bring source material and downstream signal into one workflow." : prev.integrationValue,
      featureBenefits: prev.featureBenefits?.some(item => item.feature || item.benefit) && !force ? prev.featureBenefits : [
        { feature: "Product Truth workspace", benefit: "Keeps product inputs grounded and reusable." },
        { feature: "Narrative workflow", benefit: "Turns messy inputs into approved messaging." },
        { feature: "Feedback loop", benefit: "Improves the next version after launch." },
      ],
    }));

    setComp(prev => ({
      ...prev,
      competitors: force || !prev.competitors ? "Notion, scattered ChatGPT prompts, launch docs, agency decks" : prev.competitors,
      differentiators: force || !prev.differentiators ? "Workflow-driven narrative alignment with feedback and approvals built in." : prev.differentiators,
      proofPoints: force ? "" : prev.proofPoints,
      proofMetrics: force || !prev.proofMetrics ? "Pilot target: 30% faster launch prep and fewer stakeholder revisions." : prev.proofMetrics,
      winLose: force || !prev.winLose ? "Win when teams need one source of truth. Lose when they only want one-off copy generation." : prev.winLose,
      alternativeGaps: force || !prev.alternativeGaps ? "Alternatives do not connect product truth, messaging, launch assets, and post-launch signal." : prev.alternativeGaps,
    }));
    setWorkspaceSaves(prev => ({ ...prev, productTruth: new Date().toISOString() }));
  }

  function seedNarrative(force = false) {
    setPos(prev => ({
      ...prev,
      statement: force || !prev.statement ? "For product marketing teams that need to align launches, Loop is the narrative operating system that turns product truth into approved messaging and execution-ready outputs." : prev.statement,
      valueProp: force || !prev.valueProp ? "Loop helps teams launch faster with one approved story, fewer review loops, and stronger alignment." : prev.valueProp,
      tagline: force || !prev.tagline ? "Launch from one story." : prev.tagline,
      taglineOptions: force || !prev.taglineOptions ? "Launch from one story\nFrom truth to launch\nYour narrative operating system" : prev.taglineOptions,
      keyValue: force || !prev.keyValue ? "Clarity, alignment, faster launch readiness, and better feedback loops." : prev.keyValue,
    }));
    setMsg(prev => ({
      ...prev,
      headline: force || !prev.headline ? "Turn product truth into launch-ready narrative." : prev.headline,
      pillars: force || !prev.pillars ? "One shared source of truth\nAI-guided narrative refinement\nLaunch execution and asset alignment\nFeedback that improves the next version" : prev.pillars,
      elevator: force || !prev.elevator ? "Loop helps founders and PMM teams align product truth, messaging, launch execution, and feedback in one workflow so launches ship faster and with less confusion." : prev.elevator,
    }));
    setWorkspaceSaves(prev => ({ ...prev, narrative: new Date().toISOString() }));
  }

  function seedGtmAndAssets(force = false) {
    setStrat(prev => ({
      ...prev,
      goal: force || !prev.goal ? "Launch the MVP with 10 design partners and a clear PMM wedge." : prev.goal,
      icp: force || !prev.icp ? "Early-stage B2B SaaS founders and PMM teams" : prev.icp,
      channels: force || !prev.channels ? "Founder-led selling, product marketing outreach, launch email, website, community posts" : prev.channels,
    }));
    setStory(prev => ({
      ...prev,
      origin: force || !prev.origin ? "Narrative drift kept slowing product launches, so Loop was built as the system of record for product story." : prev.origin,
      customer: force || !prev.customer ? "Teams know the product deeply, but they struggle to tell the same story across product, sales, and marketing." : prev.customer,
      demo: force || !prev.demo ? "Show how Product Truth becomes Narrative, then GTM assets, then feedback-driven improvement." : prev.demo,
    }));
    setAssets(prev => ({
      ...prev,
      notes: force || !prev.notes ? "Website hero copy, launch email, sales brief, and founder talk track are ready for alignment review." : prev.notes,
    }));
    setWorkspaceSaves(prev => ({ ...prev, gtm: new Date().toISOString(), assets: new Date().toISOString() }));
  }

  function seedFeedbackSnapshot() {
    setAnalytics(prev => ({
      ...prev,
      performance: {
        revenue: "$620k",
        wins: 24,
        downloads: 184,
        engagement: "7.4%",
        signups: 58,
        conversions: 58,
      },
      metrics: [
        { id: "coverage", label: "Coverage", value: "88%", note: "Sections connected to active signal", tint: "linear-gradient(135deg, #F6F3FF 0%, #FFF8FC 100%)" },
        { id: "velocity", label: "Velocity", value: "18", note: "New feedback items after launch", tint: "linear-gradient(135deg, #EEF8FF 0%, #F7FCFF 100%)" },
        { id: "clarity", label: "Clarity", value: "4.4", note: "Average post-launch clarity score", tint: "linear-gradient(135deg, #FDF6EA 0%, #FFFDF7 100%)" },
      ],
      signals: [
        { id: "sales-calls", title: "Sales Call Signal", stage: "Active", note: "Buyers repeat the phrase 'one source of truth' most often when the story lands well." },
        { id: "customer-feedback", title: "Customer Feedback Signal", stage: "Active", note: "Customers love the guided structure but want deeper proof-point support and stronger asset automation." },
        { id: "market-patterns", title: "Market Pattern Signal", stage: "Watching", note: "The category is still forming, so positioning clarity matters more than feature breadth." },
      ],
    }));
    setConfidence(prev => ({
      ...prev,
      decisionNotes: prev.decisionNotes || "Feedback suggests doubling down on narrative alignment before expanding into broader workflow territory.",
      factors: prev.factors.map(factor => ({
        ...factor,
        score: factor.id === "proof" ? "4" : factor.id === "launch" ? "5" : factor.score,
      })),
    }));
    setFeedbackEntries(prev => prev.length ? prev : [
      { id: "fb-1", source: "Customer", note: "Users understand the workflow quickly, but want deeper proof points.", createdAt: new Date().toISOString() },
      { id: "fb-2", source: "Sales", note: "The one-source-of-truth language lands well in calls.", createdAt: new Date().toISOString() },
    ]);
    setWorkspaceSaves(prev => ({ ...prev, feedback: new Date().toISOString() }));
  }

  function saveWorkspace(workspace) {
    const workspaceKey = workspace === "Product Truth"
      ? "productTruth"
      : workspace === "Core Narrative" || workspace === "Narrative"
        ? "narrative"
        : workspace === "GTM" || workspace === "GTM Readiness"
          ? "gtm"
          : workspace === "Assets" || workspace === "Resources"
            ? "assets"
            : workspace === "Feedback"
              ? "feedback"
              : workspace;
    setWorkspaceSaves(prev => ({ ...prev, [workspaceKey]: new Date().toISOString() }));
    logWorkflowEvent("Workspace saved", `${workspaceKey} was saved and is ready for the next step.`);
  }

  function getNextWorkspaceOverviewId(workspace) {
    if (workspace === "Product Truth" || workspace === "productTruth") return "narrative";
    if (workspace === "Core Narrative" || workspace === "Narrative" || workspace === "narrative") return "strategy";
    if (workspace === "GTM" || workspace === "GTM Readiness" || workspace === "gtm") return "assets";
    if (workspace === "Assets" || workspace === "Resources" || workspace === "assets") return "reviewCenter";
    return "";
  }

  async function handleSaveWorkspaceAndAdvance(workspace) {
    const resolvedWorkspace = workspace || activeGroup || active;
    saveWorkspace(resolvedWorkspace);
    await syncCurrentProjectSnapshot(true);

    const nextWorkspaceId = getNextWorkspaceOverviewId(resolvedWorkspace);
    if (nextWorkspaceId) {
      setActive(nextWorkspaceId);
      setPlatformNotice(`${resolvedWorkspace} saved. Loop moved you to the next workspace.`);
    } else {
      setPlatformNotice(`${resolvedWorkspace} saved.`);
    }
  }

  function saveFullProject() {
    setWorkspaceSaves(prev => ({
      ...prev,
      project: new Date().toISOString(),
      productTruth: prev.productTruth || new Date().toISOString(),
      narrative: prev.narrative || new Date().toISOString(),
      competition: prev.competition || new Date().toISOString(),
      gtm: prev.gtm || new Date().toISOString(),
      assets: prev.assets || new Date().toISOString(),
      feedback: prev.feedback || new Date().toISOString(),
    }));
    setProjectReview(prev => ({ ...prev, lastAction: "Project saved", status: prev.status === "Draft" ? "Saved" : prev.status }));
    logWorkflowEvent("Project saved", "The current project state was saved across workspaces.");
  }

  function selectRoutingTeam(team) {
    setReviewRouting(prev => ({ ...normalizeReviewRouting(prev, reviewSections), selectedTeam: team }));
  }

  function assignSectionToReviewTeam(sectionId, team) {
    setReviewRouting(prev => {
      const next = normalizeReviewRouting(prev, reviewSections);
      REVIEW_TEAMS.forEach(currentTeam => {
        next.assignments[currentTeam] = next.assignments[currentTeam].filter(id => id !== sectionId);
      });
      next.assignments[team] = [...next.assignments[team], sectionId];
      next.selectedTeam = team;
      next.lastAssignedAt = new Date().toISOString();
      return next;
    });
  }

  function removeSectionFromReview(sectionId) {
    setReviewRouting(prev => {
      const next = normalizeReviewRouting(prev, reviewSections);
      REVIEW_TEAMS.forEach(team => {
        next.assignments[team] = next.assignments[team].filter(id => id !== sectionId);
      });
      return next;
    });
  }

  function runAiReviewAssignment() {
    const assignments = Object.fromEntries(REVIEW_TEAMS.map(team => [team, []]));
    reviewSections.forEach(section => {
      assignments[section.suggestedTeam] = [...assignments[section.suggestedTeam], section.id];
    });
    setReviewRouting({
      selectedTeam: "Sales",
      assignments,
      lastAssignedAt: new Date().toISOString(),
      sentAt: reviewRouting.sentAt || "",
    });
    setPlatformNotice("Loop assigned sections to Sales, Product, and PMM using the current routing rules.");
  }

  function requestProjectReview() {
    setReviewRouting(prev => {
      const normalized = normalizeReviewRouting(prev, reviewSections);
      const alreadyAssigned = REVIEW_TEAMS.some(team => (normalized.assignments?.[team] || []).length > 0);
      if (alreadyAssigned) return normalized;
      const assignments = Object.fromEntries(REVIEW_TEAMS.map(team => [team, []]));
      reviewSections.forEach(section => {
        assignments[section.suggestedTeam] = [...assignments[section.suggestedTeam], section.id];
      });
      return {
        ...normalized,
        selectedTeam: normalized.selectedTeam || "Sales",
        assignments,
        lastAssignedAt: new Date().toISOString(),
      };
    });
    setScreen("workspace");
    setActive("reviewCenter");
    setWorkflowStage("review");
    setPlatformNotice("Loop opened Review Center with suggested team assignments. Adjust owners inline if you want, then click Send Review.");
  }

  async function sendReviewRouting() {
    const nextRouting = normalizeReviewRouting(reviewRouting, reviewSections);
    const routedTeams = REVIEW_TEAMS.filter(team => nextRouting.assignments[team].length > 0);
    if (!routedTeams.length) {
      setPlatformNotice("Assign at least one section to a team before sending the review package.");
      return;
    }

    const stampedRouting = {
      ...nextRouting,
      sentAt: new Date().toISOString(),
    };
    setReviewRouting(stampedRouting);
    setProjectReview(prev => ({
      ...prev,
      required: true,
      status: "Requested",
      teams: routedTeams,
      lastAction: `Review routing finalized for ${routedTeams.join(", ")}`,
    }));
    setWorkflowStage("review");
    setActive("reviewCenter");
    logWorkflowEvent("Project sent for review", `Loop routed sections to ${routedTeams.join(", ")} and opened the review workspace.`);
    await syncCurrentProjectSnapshot(true);
    setScreen("workspace");
    setPlatformNotice("Review routing saved. Loop opened the review workspace for the selected team sections.");
  }

  function updateSectionReviewScore(sectionId, parameter, value) {
    setSectionReviews(prev => {
      const next = normalizeSectionReviews(prev, currentReviewRouting, reviewSections);
      const existing = next[sectionId];
      if (!existing) return prev;
      next[sectionId] = {
        ...existing,
        scores: {
          ...existing.scores,
          [parameter]: clampReviewScore(value),
        },
        updatedAt: new Date().toISOString(),
      };
      return next;
    });
  }

  function updateSectionReviewComment(sectionId, value) {
    setSectionReviews(prev => {
      const next = normalizeSectionReviews(prev, currentReviewRouting, reviewSections);
      const existing = next[sectionId];
      if (!existing) return prev;
      next[sectionId] = {
        ...existing,
        comment: value,
        updatedAt: new Date().toISOString(),
      };
      return next;
    });
  }

  function markSectionReviewForImprove(sectionId) {
    setSectionReviews(prev => {
      const next = normalizeSectionReviews(prev, currentReviewRouting, reviewSections);
      const existing = next[sectionId];
      if (!existing) return prev;
      next[sectionId] = {
        ...existing,
        status: "in_review",
        decision: "improve",
        updatedAt: new Date().toISOString(),
      };
      return next;
    });
    setProjectReview(prev => ({
      ...prev,
      status: "In Review",
      required: true,
      lastAction: `${currentReviewRouting.selectedTeam || "Team"} flagged a section for improvement`,
    }));
  }

  function approveSectionReview(sectionId) {
    setSectionReviews(prev => {
      const next = normalizeSectionReviews(prev, currentReviewRouting, reviewSections);
      const existing = next[sectionId];
      if (!existing) return prev;
      next[sectionId] = {
        ...existing,
        status: "approved",
        decision: "approve",
        updatedAt: new Date().toISOString(),
      };
      return next;
    });
  }

  async function submitCurrentTeamReview() {
    const activeTeam = currentReviewRouting.selectedTeam || "Sales";
    const activeSectionIds = currentReviewRouting.assignments?.[activeTeam] || [];
    const activeReviews = activeSectionIds
      .map(sectionId => currentSectionReviews[sectionId])
      .filter(Boolean);

    if (!activeReviews.length) {
      setPlatformNotice(`Assign at least one section to ${activeTeam} before submitting feedback.`);
      return;
    }

    const approvedCount = activeReviews.filter(review => review.status === "approved").length;
    const improveCount = activeReviews.filter(review => review.decision === "improve").length;
    const teamStatus = approvedCount === activeReviews.length ? "Approved" : "In Review";
    const feedbackEntry = {
      id: `review-${activeTeam.toLowerCase()}-${Date.now()}`,
      source: `${activeTeam} Review`,
      note: `${activeTeam} reviewed ${activeReviews.length} section${activeReviews.length === 1 ? "" : "s"}: ${approvedCount} approved, ${improveCount} flagged for improvement.`,
      createdAt: new Date().toISOString(),
      kind: "section-review",
      sectionIds: activeSectionIds,
    };

    const normalizedSignalsArray = await Promise.all(
      activeReviews.map(async review => ({
        sectionId: review.sectionId,
        signal: await normalizeFeedback(review),
      }))
    );
    const aggregateInsights = await aggregateFeedback(normalizedSignalsArray);
    const suggestionPayload = await generateFeedbackSuggestions(aggregateInsights);
    const nextConfidenceScore = calculateFeedbackConfidence(currentSectionReviews);
    const normalizedSignals = normalizedSignalsArray.reduce((acc, item) => {
      acc[item.sectionId] = item.signal;
      return acc;
    }, { ...reviewInsights.normalizedSignals });

    setReviewInsights({
      normalizedSignals,
      topIssues: aggregateInsights.topIssues || [],
      weakestParameter: aggregateInsights.weakestParameter || "",
      strongestParameter: aggregateInsights.strongestParameter || "",
      crossSectionPatterns: aggregateInsights.crossSectionPatterns || [],
      suggestions: suggestionPayload.improvements || [],
      confidenceScore: nextConfidenceScore,
      updatedAt: new Date().toISOString(),
    });

    setFeedbackEntries(prev => [feedbackEntry, ...prev]);

    const overallSummary = summarizeSectionReviewState(currentSectionReviews, currentReviewRouting);
    setProjectReview(prev => ({
      ...prev,
      required: true,
      status: overallSummary.totalCount && overallSummary.approvedCount === overallSummary.totalCount ? "Approved" : teamStatus,
      teams: Array.from(new Set([...(prev.teams || []), activeTeam])),
      lastAction: `${activeTeam} review submitted`,
    }));
    setConfidence(prev => ({
      ...prev,
      factors: prev.factors.map(factor => {
        if (factor.id === "message") {
          return {
            ...factor,
            score: String(Math.max(1, Math.min(10, Math.round(average(activeReviews.map(review => clampReviewScore(review.scores?.clarity))))))),
          };
        }
        if (factor.id === "proof") {
          return {
            ...factor,
            score: String(Math.max(1, Math.min(10, Math.round(average(activeReviews.map(review => clampReviewScore(review.scores?.differentiation))))))),
          };
        }
        if (factor.id === "market") {
          return {
            ...factor,
            score: String(Math.max(1, Math.min(10, Math.round(average(activeReviews.map(review => clampReviewScore(review.scores?.relevance))))))),
          };
        }
        if (factor.id === "launch") {
          return {
            ...factor,
            score: String(Math.max(1, Math.min(10, Math.round(average(activeReviews.map(review => clampReviewScore(review.scores?.value))))))),
          };
        }
        return factor;
      }),
      decisionNotes: (suggestionPayload.improvements || []).map(item => `${item.section}: ${item.action}`).join(" | "),
    }));
    setAnalytics(prev => ({
      ...prev,
      signals: (aggregateInsights.topIssues || []).slice(0, 3).map((issue, index) => ({
        id: `review-signal-${Date.now()}-${index}`,
        title: aggregateInsights.weakestParameter || "Feedback Signal",
        stage: index === 0 ? "Active" : "Watching",
        note: issue,
      })),
    }));

    logWorkflowEvent("Structured review submitted", `${activeTeam} submitted section-level review feedback for ${activeReviews.length} routed sections.`);
    await syncCurrentProjectSnapshot(true);
    setPlatformNotice(`${activeTeam} feedback was captured and saved to the project.`);
  }

  function skipProjectReview() {
    setProjectReview(prev => ({ ...prev, required: false, status: "No Review Required", lastAction: "Owner marked review not needed" }));
    setPd(prev => ({ ...prev, status: "ready" }));
    setWorkflowStage("launch");
    setActive("reviewCenter");
    logWorkflowEvent("Review skipped", "The owner marked this version as not requiring formal review and moved it to launch readiness.");
  }

  function addFeedbackEntry(source = "PMM") {
    const entry = {
      id: `fb-${Date.now()}`,
      source,
      note: source === "Sales"
        ? "Sales heard strong resonance around the shared narrative, but buyers still ask for more proof."
        : source === "Product"
          ? "Product confirmed the core narrative is still accurate for this release."
          : "PMM noted which messages landed and which parts still need sharpening.",
      createdAt: new Date().toISOString(),
    };
    setFeedbackEntries(prev => [entry, ...prev]);
    setWorkspaceSaves(prev => ({ ...prev, feedback: new Date().toISOString() }));
    logWorkflowEvent("Feedback added", `${source} added post-launch signal into the feedback loop.`);
  }

  function downloadProjectReport() {
    const reportHtml = buildProjectReportHtml({
      pd,
      pos,
      msg,
      aud,
      comp,
      strat,
      story,
      assets,
      feedbackEntries,
      projectReview,
      narrativeHealthScore,
      confidenceScore,
      alignmentScore: reportAlignmentScore,
      reviewInsights,
      reviewAnalytics,
      pmmActionQueue,
    });

    const blob = new Blob([reportHtml], { type: "text/html;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeName = (pd.name || "loop-project-report").trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "loop-project-report";
    link.href = url;
    link.download = `${safeName}-report.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    setPlatformNotice("Project report downloaded. Open the HTML file in a browser to print or save it as a PDF.");
  }

  function downloadProjectFromHub(project) {
    if (!project?.snapshot) {
      setPlatformNotice("Loop could not find a saved snapshot for that project yet.");
      return;
    }

    const snapshot = hydrateDraftSnapshot(project.snapshot);
    const narrativeMetrics = {
      positioningClarity: boundedNarrativeScore(snapshot.pos?.statement, 4),
      messagingAlignment: boundedNarrativeScore((snapshot.msg?.pillars || "") + (snapshot.msg?.headline || ""), 4),
      marketAdoption: Math.max(1, Math.min(10, Math.round(average((snapshot.analytics?.metrics || []).map(metric => Number.parseFloat(metric.value) || 0)) / 10))),
      storyResonance: boundedNarrativeScore((snapshot.story?.customer || "") + (snapshot.story?.origin || ""), 4),
    };
    const exportedNarrativeHealthScore = Number((Object.values(narrativeMetrics).reduce((sum, value) => sum + value, 0) / Object.values(narrativeMetrics).length).toFixed(1));
    const exportedConfidenceScore = Number((average((snapshot.confidence?.factors || []).map(factor => (Number(factor.score) || 0) * 2))).toFixed(1));
    const exportedAlignmentScore = Math.max(
      42,
      100
        - ((snapshot.projectReview?.status || "") === "Requested" ? 16 : 8)
        - ((snapshot.feedbackEntries || []).length ? 0 : 8)
    );
    const exportedReviewSections = buildReviewableSections({
      pd: snapshot.pd || {},
      comp: snapshot.comp || {},
      pos: snapshot.pos || {},
      msg: snapshot.msg || {},
      aud: snapshot.aud || {},
      strat: snapshot.strat || {},
      story: snapshot.story || {},
      assets: snapshot.assets || {},
      aiDraft: snapshot.aiDraft || {},
    });
    const exportedRouting = normalizeReviewRouting(snapshot.reviewRouting || {}, exportedReviewSections);
    const exportedSectionReviews = normalizeSectionReviews(snapshot.sectionReviews || {}, exportedRouting, exportedReviewSections);
    const exportedAssignedSections = REVIEW_TEAMS.flatMap(team =>
      (exportedRouting.assignments?.[team] || []).map(sectionId => {
        const section = exportedReviewSections.find(item => item.sectionId === sectionId);
        return section ? { ...section, reviewerTeam: team } : null;
      }).filter(Boolean)
    );
    const exportedReviewAnalytics = buildReviewAnalytics(exportedSectionReviews, exportedAssignedSections);
    const exportedPmmActionQueue = buildPmmActionQueue(exportedSectionReviews, exportedReviewSections);
    const exportedFeedbackConfidenceScore = calculateFeedbackConfidence(exportedSectionReviews);

    const reportHtml = buildProjectReportHtml({
      pd: snapshot.pd,
      pos: snapshot.pos,
      msg: snapshot.msg,
      aud: snapshot.aud,
      comp: snapshot.comp,
      strat: snapshot.strat,
      story: snapshot.story,
      assets: snapshot.assets,
      feedbackEntries: snapshot.feedbackEntries || [],
      projectReview: snapshot.projectReview || {},
      narrativeHealthScore: exportedNarrativeHealthScore,
      confidenceScore: exportedFeedbackConfidenceScore || exportedConfidenceScore,
      alignmentScore: exportedAlignmentScore,
      reviewInsights: snapshot.reviewInsights || {},
      reviewAnalytics: exportedReviewAnalytics,
      pmmActionQueue: exportedPmmActionQueue,
    });

    const blob = new Blob([reportHtml], { type: "text/html;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeName = ((project.name || snapshot.pd?.name || "loop-project-report").trim()).replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "loop-project-report";
    link.href = url;
    link.download = `${safeName}-report.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    setPlatformNotice(`${project.name || "Project"} report downloaded.`);
  }

  function downloadCurrentWorkspace() {
    const workspaceTitle = activeGroup || activeLabel || "Workspace";
    let rows = [];
    let intro = "Loop exported the current workspace so you can review or share it outside the platform.";

    if (workspaceTitle === "Product Truth") {
      rows = [
        { label: "Product Overview", value: pd.whatItDoes || pd.what || pd.description },
        { label: "Problem", value: pd.problem || pd.problemStatement },
        { label: "Solution", value: pd.solution },
        { label: "Primary Audience", value: pd.audience || strat.icp },
        { label: "Differentiation", value: pd.diff },
      ];
      intro = "This export captures the current Product Truth draft and the core product context behind the narrative.";
    } else if (workspaceTitle === "Core Narrative" || workspaceTitle === "Narrative") {
      rows = [
        { label: "Positioning Statement", value: pos.statement },
        { label: "Value Proposition", value: pos.valueProp },
        { label: "Messaging", value: msg.pillars },
        { label: "Headline Message", value: msg.headline },
        { label: "Elevator Pitch", value: msg.elevator },
      ];
      intro = "This export captures the current narrative draft, including positioning, value proposition, and core messaging.";
    } else if (workspaceTitle === "GTM" || workspaceTitle === "GTM Readiness") {
      rows = [
        { label: "GTM Strategy", value: strat.goal },
        { label: "Key Channels", value: strat.channels },
        { label: "Launch Strategy", value: strat.hooks },
      ];
      intro = "This export captures the current go-to-market direction from Loop's guided MVP workflow.";
    } else if (workspaceTitle === "Assets" || (workspaceTitle === "Resources" && active === "assets")) {
      rows = [
        { label: "Homepage Headline", value: aiDraft.assets.headline || "" },
        { label: "Elevator Pitch", value: aiDraft.assets.elevatorPitch || msg.elevator },
        { label: "Email Pitch", value: aiDraft.assets.emailPitch || "" },
        { label: "Messaging Asset", value: aiDraft.assets.messagingAsset || "" },
        { label: "Asset Notes", value: assets.notes },
      ];
      intro = "This export captures the current starter assets and asset notes generated from the narrative.";
    } else if (workspaceTitle === "Resources" && active === "reviewCenter") {
      rows = [
        { label: "Review Status", value: projectReview.status || "Draft" },
        { label: "Review Teams", value: (projectReview.teams || []).join(", ") || "None assigned" },
        { label: "Feedback Count", value: `${feedbackEntries.length}` },
        { label: "Confidence Score", value: `${feedbackConfidenceScore || 0}` },
      ];
      intro = "This export captures the internal feedback state, review decisions, and the latest intelligence generated from the review center.";
    } else if (workspaceTitle === "Resources" && (active === "analytics" || active === "confidence")) {
      rows = [
        { label: "Launch Feedback Entries", value: `${feedbackEntries.length}` },
        { label: "Strongest Parameter", value: reviewInsights.strongestParameter || "" },
        { label: "Weakest Parameter", value: reviewInsights.weakestParameter || "" },
        { label: "Confidence Score", value: `${feedbackConfidenceScore || 0}` },
      ];
      intro = "This export captures market feedback, signals, and the current confidence view inside Resources.";
    } else {
      return;
    }

    const exportHtml = buildSectionExportHtml({
      projectName: pd.name || "Loop Project",
      workspaceTitle,
      intro,
      rows,
    });
    const blob = new Blob([exportHtml], { type: "text/html;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeProjectName = (pd.name || "loop-project").trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "loop-project";
    const safeWorkspaceName = workspaceTitle.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "workspace";
    link.href = url;
    link.download = `${safeProjectName}-${safeWorkspaceName}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    setPlatformNotice(`${workspaceTitle} downloaded. Open the HTML file in a browser to review or print it.`);
  }

  function downloadVersionComparisonReport() {
    if (!pd.previousVersionId) {
      setPlatformNotice("This project does not have a previous version to compare yet.");
      return;
    }

    const previousProject = testProjects.find(project => project.id === pd.previousVersionId);
    if (!previousProject?.snapshot) {
      setPlatformNotice("Loop could not find the previous version snapshot for comparison.");
      return;
    }

    const previous = hydrateDraftSnapshot(previousProject.snapshot);
    const current = hydrateDraftSnapshot(buildTestProjectSnapshot(currentTestProjectId || `test-${Date.now()}`).snapshot);
    const comparisonHtml = buildVersionComparisonHtml({
      currentProjectName: pd.name || current.pd?.name,
      currentVersion: pd.version || current.pd?.version,
      previousVersion: previous.pd?.version || previousProject.version,
      changeType: pd.changeType || "Version Update",
      whatChanged: pd.whatChanged || "",
      previous,
      current,
    });

    const blob = new Blob([comparisonHtml], { type: "text/html;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeName = (pd.name || "loop-version-comparison").trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "loop-version-comparison";
    link.href = url;
    link.download = `${safeName}-comparison.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    setPlatformNotice("Version comparison report downloaded.");
  }

  function handleOpenLoopPlatform() {
    setPlatformMode("original");
    setScreen("workspace");
    setActive("productTruth");
  }

  async function createMinorVersionFromSource() {
    const sourceProject = testProjects.find(project => project.id === versionDraft.sourceProjectId);
    if (!sourceProject?.snapshot) {
      setPlatformNotice("Loop could not find the previous version to duplicate.");
      return;
    }

    const source = hydrateDraftSnapshot(sourceProject.snapshot);
    const nextProjectId = `test-${Date.now()}`;
    const nextSnapshot = hydrateDraftSnapshot({
      ...source,
      pd: {
        ...source.pd,
        ...pd,
        name: pd.name,
        description: pd.description,
        version: pd.version || nextVersionLabel(source.pd?.version || sourceProject.version || "v1.0"),
        status: "Started",
        whatChanged: pd.whatChanged || "",
        previousVersionId: versionDraft.sourceProjectId,
        previousVersionName: source.pd?.name || sourceProject.name || "",
        changeType: "minor",
      },
      workspaceSaves: {
        ...source.workspaceSaves,
        productTruth: new Date().toISOString(),
      },
      projectReview: {
        ...source.projectReview,
        status: "Draft",
        lastAction: "Minor version created from previous narrative",
      },
      active: "productTruth",
      workflowStage: "productTruth",
      launchComplete: false,
      feedbackCaptured: false,
      reviewDismissed: {},
      approvedChanges: {},
      compareVersionId: versionDraft.sourceProjectId,
    });

    const projectSnapshot = {
      id: nextProjectId,
      name: nextSnapshot.pd?.name || pd.name,
      description: nextSnapshot.pd?.description || pd.description,
      launchDate: nextSnapshot.pd?.launchDate || "",
      version: nextSnapshot.pd?.version || pd.version || "v1.0",
      status: getProjectLifecycle(nextSnapshot).label,
      updatedAt: new Date().toISOString(),
      snapshot: nextSnapshot,
    };

    setCurrentTestProjectId(nextProjectId);
    setVersionDraft({ sourceProjectId: "", mode: "minor" });
    setReviewRouting(makeEmptyReviewRouting());
    setSectionReviews({});
    setReviewInsights({
      normalizedSignals: {},
      topIssues: [],
      weakestParameter: "",
      strongestParameter: "",
      crossSectionPatterns: [],
      suggestions: [],
      confidenceScore: 0,
      updatedAt: "",
    });
    setTestProjects(prev => mergeProjectsById(prev, [projectSnapshot]));
    openTestProject(projectSnapshot);

    if (isSupabaseConfigured()) {
      try {
        const savedProject = await saveLoopProject(projectSnapshot);
        if (savedProject) {
          setTestProjects(prev => mergeProjectsById(prev, [savedProject]));
          refreshRemoteProjects(false);
        }
      } catch (error) {
        setPlatformNotice(`Loop created the next version locally, but could not save it to Supabase: ${error?.message || "Unknown error"}`);
        return;
      }
    }

    setPlatformNotice("Next version created from the previous workspace. Update the narrative and continue the loop.");
  }

  function handleStartProject() {
    setPlatformMode("test");
    setCurrentTestProjectId("");
    setVersionDraft({ sourceProjectId: "", mode: "minor" });
    setAssets({ notes: "", rows: [] });
    setReviewRouting(makeEmptyReviewRouting());
    setSectionReviews({});
    setReviewInsights({
      normalizedSignals: {},
      topIssues: [],
      weakestParameter: "",
      strongestParameter: "",
      crossSectionPatterns: [],
      suggestions: [],
      confidenceScore: 0,
      updatedAt: "",
    });
    setPd(prev => ({
      ...prev,
      launchDate: prev.launchDate || addDays(new Date().toISOString().slice(0, 10), 21),
      version: prev.version || "v1.0",
      status: prev.status || "Planned",
      whatChanged: "",
      previousVersionId: "",
      previousVersionName: "",
      changeType: "",
    }));
    setScreen("projectSetup");
  }

  function handleAddAnotherProject() {
    setPlatformMode("test");
    setCurrentTestProjectId("");
    setVersionDraft({ sourceProjectId: "", mode: "minor" });
    setAssets({ notes: "", rows: [] });
    setReviewRouting(makeEmptyReviewRouting());
    setSectionReviews({});
    setReviewInsights({
      normalizedSignals: {},
      topIssues: [],
      weakestParameter: "",
      strongestParameter: "",
      crossSectionPatterns: [],
      suggestions: [],
      confidenceScore: 0,
      updatedAt: "",
    });
    setPd({
      name: "",
      description: "",
      wowFactor: "",
      whatChanged: "",
      previousVersionId: "",
      previousVersionName: "",
      changeType: "",
      launchDate: addDays(new Date().toISOString().slice(0, 10), 21),
      version: "v1.0",
      status: "Planned",
      owner: pd.owner || "",
      reviewers: pd.reviewers || [],
      reviewTeam: pd.reviewTeam || [],
    });
    setAiDraft(makeEmptyAiDraft());
    setUserEdits({});
    setNarrativeUiState({ isGenerated: false, improveMode: false, isGenerating: false, enhancingSection: "" });
    setScreen("home");
  }

  async function syncCurrentProjectSnapshot(showNoticeOnFail = false, snapshotOverrides = null) {
    if (platformMode !== "test" || !(pd.name || "").trim()) return null;

    const baseProject = buildTestProjectSnapshot(currentTestProjectId || `test-${Date.now()}`);
    const snapshot = snapshotOverrides
      ? {
          ...baseProject,
          status: getProjectLifecycle(mergeSnapshotPreservingContent(baseProject.snapshot, snapshotOverrides)).label,
          snapshot: mergeSnapshotPreservingContent(baseProject.snapshot, snapshotOverrides),
        }
      : baseProject;
    setTestProjects(prev => mergeProjectsById(prev, [snapshot]));

    if (isSupabaseConfigured()) {
      try {
        const savedProject = await saveLoopProject(snapshot);
        if (savedProject) {
          setTestProjects(prev => mergeProjectsById(prev, [savedProject]));
          return savedProject;
        }
      } catch (error) {
        if (showNoticeOnFail) {
          setPlatformNotice(`Loop could not sync this project to Supabase: ${error?.message || "Unknown error"}`);
        }
      }
    }

    return snapshot;
  }

  async function goToProjectsHub() {
    await syncCurrentProjectSnapshot(false);
    setPlatformMode("test");
    setScreen("projectsHub");
  }

  async function handleGenerateSuggestedAsset(suggestion) {
    const generatedContent = await generateSuggestedAssetContent(suggestion, { pd, msg, strat, aiDraft });
    const initialScores = scoreGeneratedAsset(generatedContent, { pd, msg, strat });
    const nextAssets = (() => {
      const normalizedCurrent = normalizeAssetsState(assets, { pd, msg, strat, aiDraft });
      const baseRow = {
        id: suggestion.id,
        assetName: suggestion.assetName,
        type: suggestion.type,
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

      return {
        ...normalizedCurrent,
        rows: [
          baseRow,
          ...normalizedCurrent.rows.filter(row => row.id !== suggestion.id),
        ],
        notes: normalizedCurrent.notes || `AI generated ${suggestion.assetName}.`,
      };
    })();

    setAssets(nextAssets);
    await syncCurrentProjectSnapshot(true, { assets: nextAssets });
    setPlatformNotice(`${suggestion.assetName} was generated and saved in Resources.`);
  }

  async function handleGenerateWorkspaceAssetSuggestion(suggestion) {
    const nextSuggestion = buildWorkspaceAssetSuggestion(suggestion, activeLabel || activeGroup || "Workspace");
    await handleGenerateSuggestedAsset(nextSuggestion);
  }

  function handleStartNextVersion(project) {
    if (!project?.snapshot) return;
    const source = hydrateDraftSnapshot(project.snapshot);
    setPlatformMode("test");
    setCurrentTestProjectId("");
    setVersionDraft({ sourceProjectId: project.id, mode: "minor" });
    setReviewRouting(makeEmptyReviewRouting());
    setSectionReviews({});
    setReviewInsights({
      normalizedSignals: {},
      topIssues: [],
      weakestParameter: "",
      strongestParameter: "",
      crossSectionPatterns: [],
      suggestions: [],
      confidenceScore: 0,
      updatedAt: "",
    });
    setPd({
      ...source.pd,
      name: source.pd?.name || project.name || "",
      description: source.pd?.description || project.description || "",
      wowFactor: source.pd?.wowFactor || "",
      whatChanged: "",
      previousVersionId: project.id,
      previousVersionName: source.pd?.name || project.name || "",
      changeType: "minor",
      version: nextVersionLabel(source.pd?.version || project.version || "v1.0"),
      status: "Started",
    });
    setScreen("projectSetup");
  }

  function handleViewProjectsFromHome() {
    setPlatformMode("test");
    setCurrentTestProjectId("");
    setVersionDraft({ sourceProjectId: "", mode: "minor" });
    setScreen("projectsHub");
  }

  function openProjectFromHub(project) {
    openTestProject(project);
    setScreen("workspace");
  }

  function handleCreateLaunchWorkspace() {
    setPlatformMode("test");
    seedProductTruth(false);
    setScreen("workspace");
    setWorkflowStage("productTruth");
    setActive("productTruth");
    setLaunchComplete(false);
    setFeedbackCaptured(false);
    logWorkflowEvent("Launch workspace created", "Loop created a starter workspace with product context, timeline, and recommended next steps.");
  }

  function handleAdvanceWorkflow() {
    if (workflowStage === "login") {
      handleOpenLoopPlatform();
      return;
    }

    if (workflowStage === "onboarding") {
      handleCreateLaunchWorkspace();
      return;
    }

    if (workflowStage === "productTruth") {
      saveWorkspace("productTruth");
      seedNarrative(false);
      setWorkflowStage("narrative");
      setActive("narrative");
      logWorkflowEvent("Narrative draft prepared", "Product Truth triggered a starter positioning statement, value proposition, and messaging pillars for review.");
      return;
    }

    if (workflowStage === "narrative") {
      saveWorkspace("narrative");
      setWorkflowStage("gtm");
      setActive("strategy");
      logWorkflowEvent("Narrative approved for GTM", "Loop moved the approved story into GTM planning and channel messaging.");
      return;
    }

    if (workflowStage === "gtm") {
      saveWorkspace("gtm");
      seedGtmAndAssets(false);
      setWorkflowStage("assets");
      setActive("assets");
      logWorkflowEvent("GTM automation ran", "Loop created a starter GTM plan and suggested launch assets from the approved narrative.");
      return;
    }

    if (workflowStage === "assets") {
      saveWorkspace("assets");
      setWorkflowStage("review");
      setActive("reviewCenter");
      setProjectReview(prev => ({ ...prev, lastAction: "Project ready for owner review decision", status: prev.required ? "Requested" : "Draft" }));
      logWorkflowEvent("Assets aligned for review", "Launch assets were staged and the project is ready for a review decision.");
      return;
    }

    if (workflowStage === "review") {
      rawReviewItems.forEach(item => approveReviewItem(item));
      publishNarrativeVersion();
      setProjectReview(prev => ({ ...prev, status: "Approved", lastAction: "Project approved and version published" }));
      setPd(prev => ({ ...prev, status: "ready" }));
      setWorkflowStage("launch");
      setActive("reviewCenter");
      logWorkflowEvent("Version published", "Loop resolved available review items and published the next narrative version for launch.");
      return;
    }

    if (workflowStage === "launch") {
      setPd(prev => ({ ...prev, status: "live" }));
      setLaunchComplete(true);
      setWorkflowStage("feedback");
      setActive("analytics");
      logWorkflowEvent("Launch completed", "The product launched from one approved narrative and Loop activated the post-launch feedback cycle.");
      return;
    }

    if (workflowStage === "feedback") {
      seedFeedbackSnapshot();
      saveWorkspace("feedback");
      setFeedbackCaptured(true);
      setWorkflowStage("complete");
      setActive("confidence");
      logWorkflowEvent("Loop closed", "Feedback, analytics, and recommendations were captured so the next version can start from real signal.");
    }
  }


  const workflowPrimaryActionMap = {
    login: { label: "Enter Loop Platform", onClick: handleAdvanceWorkflow },
    onboarding: { label: "Create Launch Workspace", onClick: handleAdvanceWorkflow },
    productTruth: { label: "Move to Narrative", onClick: handleAdvanceWorkflow },
    narrative: { label: "Move to GTM Readiness", onClick: handleAdvanceWorkflow },
    competition: { label: "Move to GTM Readiness", onClick: () => { setWorkflowStage("narrative"); handleAdvanceWorkflow(); } },
    gtm: { label: "Generate GTM + Assets", onClick: handleAdvanceWorkflow },
    assets: { label: "Open Internal Feedback", onClick: handleAdvanceWorkflow },
    review: projectReview.required
      ? { label: "Publish Version", onClick: handleAdvanceWorkflow }
      : { label: "Send Project for Review", onClick: requestProjectReview },
    launch: { label: "Launch Product", onClick: handleAdvanceWorkflow },
    feedback: { label: "Close the Loop", onClick: handleAdvanceWorkflow },
    complete: null,
  };

  const workspacePrimaryAction = activeGroup === "Resources"
    ? active === "assets"
      ? {
          label: "Save Resources",
          onClick: () => {
            saveWorkspace("Resources");
            syncCurrentProjectSnapshot(true);
            setPlatformNotice("Resources were saved.");
          },
        }
      : workflowStage === "review"
        ? { label: "Publish Version", onClick: handleAdvanceWorkflow }
        : workflowStage === "launch"
          ? { label: "Mark Launch Live", onClick: handleAdvanceWorkflow }
          : workflowStage === "feedback"
            ? {
                label: "Generate Resources Report",
                onClick: () => {
                  downloadProjectReport();
                  handleAdvanceWorkflow();
                },
              }
            : { label: "Send for Review", onClick: requestProjectReview }
    : { label: "Save & Continue", onClick: () => handleSaveWorkspaceAndAdvance(activeGroup || active) };

  const workspaceMenuActions = [
    { id: "saveProject", label: "Save Project", onClick: saveFullProject },
    ...(activeGroup === "Resources"
      ? [
          { id: "downloadReport", label: "Download Report", onClick: downloadProjectReport },
          { id: "sendReview", label: "Send Project for Review", onClick: requestProjectReview },
          { id: "skipReview", label: "Mark Review Not Needed", onClick: skipProjectReview },
          { id: "addFeedback", label: "Add Feedback", onClick: () => addFeedbackEntry("PMM") },
        ]
      : [
          ...( ["Product Truth", "Narrative", "GTM Readiness", "Resources"].includes(activeGroup)
            ? [{ id: "downloadSection", label: "Download Section", onClick: downloadCurrentWorkspace }]
            : []),
          ...(pd.previousVersionId ? [{ id: "downloadComparison", label: "Download Comparison", onClick: downloadVersionComparisonReport }] : []),
          ...( ["Product Truth", "Narrative", "GTM Readiness"].includes(activeGroup)
            ? [{
                id: "improveNarrative",
                label: narrativeUiState.improveMode ? "Exit Improve Mode" : "Improve Narrative",
                onClick: () => setNarrativeUiState(prev => ({ ...prev, improveMode: !prev.improveMode })),
              }]
            : []),
        ]),
  ];

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", background: S.bg, color: S.text }}>
      {screen === "home" ? (
        <MainWebsitePageSimple
          onOpenLoop={() => { setPlatformNotice(""); handleOpenLoopPlatform(); }}
          pd={pd}
          setPd={setPd}
          onSaveProject={() => { setPlatformNotice(""); handleGenerateNarrativeReliable(); }}
          onViewProjects={() => { setPlatformNotice(""); handleViewProjectsFromHome(); }}
        />
      ) : screen === "contextReview" ? (
        <AiContextReviewPage
          productName={pd.name}
          context={aiDraft.context}
          isLoading={narrativeUiState.isGenerating}
          onUpdateContext={updateAiContextField}
          onBack={() => {
            setPlatformNotice("");
            setNarrativeUiState(prev => ({ ...prev, isGenerating: false }));
            setScreen("home");
          }}
          onConfirm={() => {
            setPlatformNotice("");
            handleConfirmAiContext();
          }}
        />
      ) : screen === "projectsHub" ? (
        <ProjectsHubPage
          onOpenLoop={() => { setPlatformNotice(""); handleOpenLoopPlatform(); }}
          projects={sanitizeProjects(
            platformMode === "test" && currentTestProjectId
              ? mergeProjectsById(
                testProjects,
                [buildTestProjectSnapshot(currentTestProjectId)]
              )
              : testProjects
          )}
          onOpenProject={project => { setPlatformNotice(""); openProjectFromHub(project); }}
          onAddProject={() => { setPlatformNotice(""); handleAddAnotherProject(); }}
          onDeleteProject={projectId => { setPlatformNotice(""); deleteTestProject(projectId); }}
          onDownloadProject={project => { setPlatformNotice(""); downloadProjectFromHub(project); }}
          onNextVersion={project => { setPlatformNotice(""); handleStartNextVersion(project); }}
        />
      ) : screen !== "workspace" ? (
        <AppTabsHeader
          screen={screen}
          onChangeScreen={nextScreen => {
            if (nextScreen === "landing") {
              setPlatformMode("original");
              setScreen("workspace");
              return;
            }
            setScreen(nextScreen);
          }}
        />
      ) : null}

      {screen === "landing" && (
        <LandingPage
          onStartProject={() => { setPlatformNotice(""); handleStartProject(); }}
        />
      )}

      {screen === "projectSetup" && (
        <ProjectSetupPage
          pd={pd}
          setPd={setPd}
          onSaveProject={() => { setPlatformNotice(""); handleGenerateNarrativeReliable(); }}
          onBack={() => {
            setVersionDraft({ sourceProjectId: "", mode: "minor" });
            setScreen("landing");
          }}
          platformMode={platformMode}
          versionDraft={versionDraft}
          onVersionModeChange={mode => {
            setVersionDraft(prev => ({ ...prev, mode }));
            setPd(prev => ({ ...prev, changeType: mode }));
          }}
        />
      )}

      {screen === "reviewRouting" && (
        <ReviewRoutingPage
          reviewSections={reviewSections}
          reviewRouting={currentReviewRouting}
          onSelectTeam={selectRoutingTeam}
          onAssignSection={assignSectionToReviewTeam}
          onRemoveSection={removeSectionFromReview}
          onAiAssign={runAiReviewAssignment}
          onBack={() => {
            setPlatformNotice("");
            setScreen("workspace");
          }}
          onSend={() => {
            setPlatformNotice("");
            sendReviewRouting();
          }}
        />
      )}

      {screen === "brand" && (
        <BrandGuidelinePage brand={brand} setBrand={setBrand} />
      )}

      {screen === "community" && (
        <InfoPage
          eyebrow="Community"
          title="Bring customers, advocates, and internal teams into one shared orbit."
          description="Use this area to define community programs, member experience, engagement rituals, and how Loop should support ongoing conversations beyond the workspace."
        />
      )}

      {screen === "intelligence" && (
        <div style={{ padding: "34px 28px 56px", background: "linear-gradient(180deg, #FBFAFF 0%, #F4F3FF 100%)" }}>
          <div style={{ maxWidth: 1360, margin: "0 auto", display: "grid", gap: 22 }}>
            <div style={{ background: "white", border: `1px solid ${S.border}`, borderRadius: 26, padding: "28px 30px", boxShadow: "0 14px 34px rgba(83, 74, 183, 0.06)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: P[600], textTransform: "uppercase", letterSpacing: "0.08em" }}>Narrative Intelligence</div>
              <div style={{ marginTop: 10, fontSize: 34, fontWeight: 800, lineHeight: 1.04, letterSpacing: "-0.04em", color: P[900] }}>Narrative Intelligence</div>
              <div style={{ marginTop: 12, maxWidth: 820, fontSize: 15, lineHeight: 1.7, color: S.muted }}>
                Executive control tower for narrative health, business impact, market shifts, readiness, and what changed between versions. This page is intentionally higher-level than the operator-facing Feedback Intelligence view.
              </div>
            </div>

            <NarrativeIntelligence
              narrativeHealthScore={narrativeHealthScore}
              confidenceScore={confidenceScore}
              currentVersion={narrativeVersions[0]}
              previousVersion={compareVersion}
              reviewItems={rawReviewItems}
              feedbackSignals={feedbackSignals}
            />
          </div>
        </div>
      )}

      {screen === "workspace" && narrativeUiState.isGenerating && (
        <NarrativeGeneratingOverlay productName={pd.name} />
      )}

      {screen === "workspace" && (
        <div style={{ minHeight: "calc(100vh - 73px)", background: S.bg, color: S.text, overflowX: "hidden" }}>
        <div style={{ display: "flex", flexDirection: "column", minHeight: "calc(100vh - 73px)", background: S.bg, color: S.text, overflowX: "hidden" }}>

        {/* Global workspace header */}
        <div style={{ padding: isMobile ? "12px 16px 14px" : "14px 28px 16px", borderBottom: `1px solid ${S.border}`, background: "white", display: "grid", gap: 14, flexShrink: 0 }}>
          <div style={{ display: "grid", gap: 14, padding: isMobile ? "12px 14px" : "12px 18px", border: `1px solid ${S.border}`, borderRadius: 22, background: "linear-gradient(180deg, #FFFFFF 0%, #FBFAFF 100%)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <span style={{ width: 18, height: 18, borderRadius: 5, border: `3px solid ${P[900]}`, boxSizing: "border-box", display: "inline-block" }} />
                  <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em", color: P[900] }}>Loop</span>
                </div>
                <div style={{ width: 1, alignSelf: "stretch", background: S.border, minHeight: 28 }} />
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  {[
                    { id: "landing", label: "Loop" },
                    { id: "intelligence", label: "Narrative Intelligence" },
                    { id: "brand", label: "Brand Guideline" },
                  ].map(tab => {
                    const activeTopTab = ((screen === "workspace" || screen === "projectSetup") ? "landing" : screen) === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          if (tab.id === "landing") {
                            setPlatformMode("original");
                            setScreen("workspace");
                            return;
                          }
                          setScreen(tab.id);
                        }}
                        style={{
                          border: "none",
                          background: activeTopTab ? P[50] : "transparent",
                          color: activeTopTab ? P[700] : S.muted,
                          borderRadius: 12,
                          padding: "10px 14px",
                          fontSize: 14,
                          fontWeight: activeTopTab ? 700 : 600,
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                <button
                  aria-label="Notifications"
                  style={{ width: 38, height: 38, borderRadius: 12, border: `1px solid ${S.border}`, background: "white", color: P[700], cursor: "pointer", fontSize: 16, fontFamily: "inherit", position: "relative" }}
                >
                  🔔
                  {resourcesNotificationCount > 0 && (
                    <span style={{ position: "absolute", top: 4, right: 4, minWidth: 16, height: 16, padding: "0 4px", borderRadius: 999, background: "#EF4444", color: "white", fontSize: 10, fontWeight: 800, display: "grid", placeItems: "center" }}>
                      {resourcesNotificationCount}
                    </span>
                  )}
                </button>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #2E265E 0%, #5C52C7 100%)", color: "white", display: "grid", placeItems: "center", fontSize: 13, fontWeight: 800 }}>
                  MT
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", fontSize: 13, color: S.muted }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", minWidth: 0 }}>
                <input
                  value={pd.name}
                  onChange={e => setPd(p => ({ ...p, name: e.target.value }))}
                  placeholder="Product Name"
                  style={{
                    minWidth: 140,
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    fontSize: 16,
                    lineHeight: 1.2,
                    fontWeight: 700,
                    color: S.text,
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />
                <span style={{ color: S.light }}>•</span>
                <span><span style={{ fontWeight: 700 }}>Owner:</span> Mayank Trivedi</span>
                <span style={{ color: S.light }}>•</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700 }}>Launch Date:</span>
                  <input
                    type="date"
                    value={pd.launchDate}
                    onChange={e => setPd(p => ({ ...p, launchDate: e.target.value }))}
                    style={{
                      border: `1px solid ${S.border}`,
                      background: S.bg,
                      borderRadius: 8,
                      padding: "4px 10px",
                      fontSize: 11,
                      color: S.muted,
                      outline: "none",
                      fontFamily: "inherit",
                      height: 30,
                    }}
                  />
                </span>
                <span style={{ color: S.light }}>•</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700 }}>Version:</span>
                  <input
                    value={pd.version}
                    onChange={e => setPd(p => ({ ...p, version: e.target.value }))}
                    placeholder="v1.0"
                    style={{
                      width: 78,
                      border: `1px solid ${S.border}`,
                      background: S.bg,
                      borderRadius: 8,
                      padding: "4px 10px",
                      fontSize: 11,
                      color: S.muted,
                      outline: "none",
                      fontFamily: "inherit",
                      height: 30,
                    }}
                  />
                </span>
                <span style={{ color: S.light }}>•</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700 }}>Status:</span>
                  <select
                    value={pd.status}
                    onChange={e => setPd(p => ({ ...p, status: e.target.value }))}
                    style={{
                      border: `1px solid ${P[200]}`,
                      background: P[50],
                      color: P[800],
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "4px 10px",
                      outline: "none",
                      fontFamily: "inherit",
                      height: 30,
                    }}
                  >
                    <option>Planned</option>
                    <option>Started</option>
                    <option>Work-In-Progress</option>
                    <option>delayed</option>
                    <option>ready</option>
                    <option>live</option>
                  </select>
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: isMobile ? "flex-start" : "flex-end" }}>
                <span style={{ padding: "10px 14px", borderRadius: 999, background: P[50], color: P[700], fontSize: 12, fontWeight: 800 }}>
                  Review: {projectReview.status}
                </span>
                {platformMode === "test" && (
                  <>
                    <button
                      onClick={() => goToProjectsHub()}
                      style={{ border: `1px solid ${S.border}`, background: "white", color: S.text, borderRadius: 12, padding: "10px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                    >
                      View Projects
                    </button>
                    <button
                      onClick={handleAddAnotherProject}
                      style={{ border: `1px solid ${P[100]}`, background: P[50], color: P[700], borderRadius: 12, padding: "10px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                    >
                      Add Project
                    </button>
                  </>
                )}
                {isMobile && (
                  <button
                    onClick={() => setAiOpen(v => !v)}
                    style={{ padding: "10px 14px", borderRadius: 12, border: `1px solid ${aiOpen ? P[200] : S.border}`, background: aiOpen ? P[50] : "white", color: aiOpen ? P[700] : S.text, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {aiOpen ? "Hide AI Assistant" : `AI Assistant${rawReviewItems.length ? ` (${rawReviewItems.length})` : ""}`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", flex: 1, minHeight: 0, background: S.bg, color: S.text, overflowX: "hidden" }}>

      {/* Sidebar */}
      {isMobile ? (
        <div style={{ width: "100%", flexShrink: 0, background: S.sidebar, borderBottom: `1px solid ${S.border}`, display: "flex", flexDirection: "column", overflowY: "auto" }}>
          <div style={{ padding: "18px 18px 14px", borderBottom: `1px solid ${S.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: P[800], letterSpacing: "-0.5px" }}>LOOP</div>
            <button
              onClick={() => setLeftRailCollapsed(v => !v)}
              aria-label={leftRailCollapsed ? "Expand navigation" : "Collapse navigation"}
              style={{ width: 34, height: 34, borderRadius: 12, border: `1px solid ${S.border}`, background: "white", color: P[700], cursor: "pointer", fontSize: 14, fontWeight: 800, fontFamily: "inherit", boxShadow: "0 8px 20px rgba(83, 74, 183, 0.06)" }}
            >
              {leftRailCollapsed ? "→" : "←"}
            </button>
          </div>
          {!leftRailCollapsed && (
            <>
              <div style={{ padding: "14px 18px 8px" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: S.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Workspace</span>
              </div>
              {sidebarGroups.map(({ group, icon, items }) => (
                <div key={group}>
                  <button onClick={() => {
                    if (groupOverviewMap[group]) {
                      setActive(groupOverviewMap[group]);
                      return;
                    }
                    setCollapsed(c => ({ ...c, [group]: !c[group] }));
                  }} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    width: "100%", padding: "10px 18px", background: activeGroup === group ? P[100] : "transparent",
                    border: "none", cursor: "pointer", fontFamily: "inherit",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                      <span style={{ fontSize: 13, color: P[400] }}>{icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: P[800] }}>{group}</span>
                    </div>
                    {!groupOverviewMap[group] && <span style={{ fontSize: 10, color: S.muted, transform: collapsed[group] ? "rotate(-90deg)" : "rotate(0deg)", display: "inline-block" }}>▾</span>}
                  </button>
                  {(groupOverviewMap[group] || !collapsed[group]) && items.map(item => (
                    <button key={item.id} title={item.label} onClick={() => setActive(item.id)} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      width: "100%", padding: groupOverviewMap[group] ? "8px 18px 8px 42px" : "8px 18px 8px 30px",
                      background: active === item.id ? P[200] + "88" : "transparent",
                      border: "none", cursor: "pointer", fontFamily: "inherit",
                      borderLeft: active === item.id ? `3px solid ${P[600]}` : "3px solid transparent",
                      justifyContent: "flex-start",
                    }}>
                      <span style={{ fontSize: 11, color: active === item.id ? P[600] : S.light }}>{item.icon}</span>
                      <span style={{ fontSize: 13, color: active === item.id ? P[800] : S.muted, fontWeight: active === item.id ? 600 : 400, textAlign: "left" }}>
                        {item.label.length > 20 ? item.label.slice(0, 19) + "…" : item.label}
                      </span>
                      {!!itemNotificationCounts[item.id] && (
                        <span style={{ marginLeft: "auto", minWidth: 18, height: 18, borderRadius: 999, background: "#FFF7E8", color: "#D97706", fontSize: 10, fontWeight: 800, display: "grid", placeItems: "center" }}>
                          {itemNotificationCounts[item.id]}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
      ) : (
        <div style={{ width: leftRailCollapsed ? 64 : (isCompact ? 250 : 292), flexShrink: 0, background: S.sidebar, borderRight: `1px solid ${S.border}`, display: "flex", minHeight: "100%" }}>
          <div style={{ width: 64, borderRight: `1px solid ${S.border}`, display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 0 12px", gap: 10, background: "rgba(255,255,255,0.55)" }}>
            <button
              onClick={() => setLeftRailCollapsed(v => !v)}
              aria-label={leftRailCollapsed ? "Expand navigation" : "Collapse navigation"}
              style={{ width: 38, height: 38, borderRadius: 14, border: `1px solid ${S.border}`, background: "white", color: P[700], cursor: "pointer", fontSize: 14, fontWeight: 800, fontFamily: "inherit", boxShadow: "0 8px 20px rgba(83, 74, 183, 0.06)" }}
            >
              {leftRailCollapsed ? "→" : "←"}
            </button>

            <div style={{ width: "100%", display: "grid", gap: 6, padding: "8px 0" }}>
              {sidebarGroups.map(({ group, icon, items }) => {
                const targetId = groupOverviewMap[group] || items[0]?.id;
                const isActiveEntry = activeGroup === group || active === targetId;
                return (
                  <button
                    key={group}
                    title={group}
                    onClick={() => {
                      if (leftRailCollapsed) setLeftRailCollapsed(false);
                      if (targetId) setActive(targetId);
                    }}
                    style={{
                      width: 44,
                      height: 44,
                      margin: "0 auto",
                      borderRadius: 14,
                      border: "none",
                      background: isActiveEntry ? "white" : "transparent",
                      color: isActiveEntry ? P[600] : P[400],
                      cursor: "pointer",
                      fontSize: 16,
                      fontFamily: "inherit",
                      boxShadow: isActiveEntry ? "0 10px 24px rgba(83, 74, 183, 0.08)" : "none",
                    }}
                  >
                    {icon}
                  </button>
                );
              })}
            </div>
          </div>

          {!leftRailCollapsed && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
              <div style={{ padding: "18px 18px 14px", borderBottom: `1px solid ${S.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: P[800], letterSpacing: "-0.5px" }}>LOOP</div>
              </div>
              <div style={{ padding: "14px 18px 8px" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: S.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Workspace</span>
              </div>

              <div style={{ overflowY: "auto", paddingBottom: 16 }}>
                {sidebarGroups.map(({ group, icon, items }) => (
                  <div key={group}>
                    <button onClick={() => {
                      if (groupOverviewMap[group]) {
                        setActive(groupOverviewMap[group]);
                        return;
                      }
                      setCollapsed(c => ({ ...c, [group]: !c[group] }));
                    }} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      width: "100%", padding: "10px 18px", background: activeGroup === group ? P[100] : "transparent",
                      border: "none", cursor: "pointer", fontFamily: "inherit",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                        <span style={{ fontSize: 13, color: P[400] }}>{icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: P[800] }}>{group}</span>
                      </div>
                      {!groupOverviewMap[group] && <span style={{ fontSize: 10, color: S.muted, transform: collapsed[group] ? "rotate(-90deg)" : "rotate(0deg)", display: "inline-block" }}>▾</span>}
                    </button>
                    {(groupOverviewMap[group] || !collapsed[group]) && items.map(item => (
                      <button key={item.id} title={item.label} onClick={() => setActive(item.id)} style={{
                        display: "flex", alignItems: "center", gap: 8,
                        width: "100%", padding: groupOverviewMap[group] ? "8px 18px 8px 42px" : "8px 18px 8px 30px",
                        background: active === item.id ? P[200] + "88" : "transparent",
                        border: "none", cursor: "pointer", fontFamily: "inherit",
                        borderLeft: active === item.id ? `3px solid ${P[600]}` : "3px solid transparent",
                        justifyContent: "flex-start",
                      }}>
                        <span style={{ fontSize: 11, color: active === item.id ? P[600] : S.light }}>{item.icon}</span>
                        <span style={{ fontSize: 13, color: active === item.id ? P[800] : S.muted, fontWeight: active === item.id ? 600 : 400, textAlign: "left" }}>
                          {item.label.length > 20 ? item.label.slice(0, 19) + "…" : item.label}
                        </span>
                        {!!itemNotificationCounts[item.id] && (
                          <span style={{ marginLeft: "auto", minWidth: 18, height: 18, borderRadius: 999, background: "#FFF7E8", color: "#D97706", fontSize: 10, fontWeight: 800, display: "grid", placeItems: "center" }}>
                            {itemNotificationCounts[item.id]}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", minWidth: 0, overflow: "hidden" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>

        {/* Body */}
        <div style={{ flex: 1, overflow: "hidden", padding: 0, minHeight: 0 }}>
        <div style={{ height: "100%", minHeight: 0, minWidth: 0 }}>
          <div style={{ height: "100%", minWidth: 0, maxWidth: "100%", padding: isMobile ? "18px 14px 24px" : isCompact ? "18px 20px 28px" : "18px 24px 36px", overflowY: "auto", overflowX: "hidden", minHeight: 0 }}>

            {platformMode === "test" ? (
              <div style={{ display: "grid", gap: 18, marginBottom: 18 }}>
                <CompactWorkflowStrip
                  stage={workflowStage}
                  checklistStatus={checklistStatusMap[workflowStage] || []}
                  primaryAction={workflowPrimaryActionMap[workflowStage]}
                  secondaryAction={{ label: "Projects", onClick: () => goToProjectsHub() }}
                  reviewCount={rawReviewItems.length}
                />
              </div>
            ) : null}

            <div style={{ width: "100%", maxWidth: "100%", minWidth: 0, background: "white", border: `1px solid ${S.border}`, borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 44px rgba(38, 33, 92, 0.05)" }}>
              <div style={{ padding: "14px 16px", borderBottom: `1px solid ${S.border}`, background: "linear-gradient(180deg, #FBFAFF 0%, #F7F5FF 100%)", display: "grid", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 6, background: S.sidebar, border: `1px solid ${S.border}`, borderRadius: 16, flexWrap: "wrap", justifyContent: "flex-start" }}>
                  {workspaceTabs.map(tab => {
                    const isActive = activeWorkspace === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => openWorkspaceTab(tab)}
                        style={{
                          border: "none",
                          background: isActive ? "white" : "transparent",
                          color: isActive ? P[600] : S.muted,
                          borderRadius: 12,
                          padding: "10px 16px",
                          fontSize: 14,
                          fontWeight: isActive ? 700 : 500,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          boxShadow: isActive ? "0 1px 0 rgba(38, 33, 92, 0.05)" : "none",
                        }}
                      >
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                          <span>{tab}</span>
                          {tab === "Resources" && resourcesNotificationCount > 0 && (
                            <span style={{ minWidth: 18, height: 18, borderRadius: 999, background: "#FFF7E8", color: "#D97706", fontSize: 10, fontWeight: 800, display: "grid", placeItems: "center", padding: "0 4px" }}>
                              {resourcesNotificationCount}
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: S.text }}>{activeLabel}</span>
                    {!!itemNotificationCounts[active] && (
                      <span style={{ minWidth: 18, height: 18, borderRadius: 999, background: "#FFF7E8", color: "#D97706", fontSize: 10, fontWeight: 800, display: "grid", placeItems: "center" }}>
                        {itemNotificationCounts[active]}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 18, color: S.light, cursor: "pointer" }}>···</span>
                </div>
              </div>
              <div style={{ padding: "22px 20px 28px", minWidth: 0, maxWidth: "100%", overflow: "hidden" }}>
                {narrativeUiState.isGenerated && !(activeWorkspace === "Resources" && active === "assets") && (
                  <div style={{ marginBottom: 16, padding: "12px 14px", borderRadius: 14, background: "linear-gradient(135deg, #F8F6FF 0%, #F1EEFF 100%)", border: `1px solid ${P[200]}`, color: P[800], fontSize: 13, fontWeight: 700 }}>
                    ✨ Draft generated — refine it, make it yours, then generate assets and feedback.
                  </div>
                )}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16, alignItems: "center" }}>
                  <button
                    onClick={() => {
                      setWorkspaceMenuOpen(false);
                      workspacePrimaryAction.onClick();
                    }}
                    style={{ border: "none", background: P[600], color: "white", borderRadius: 12, padding: "11px 16px", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {workspacePrimaryAction.label}
                  </button>
                  <button
                    onClick={() => {
                      setWorkspaceMenuOpen(false);
                      saveFullProject();
                    }}
                    style={{ border: `1px solid ${S.border}`, background: "white", color: S.text, borderRadius: 12, padding: "11px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Save Project
                  </button>
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={() => setWorkspaceMenuOpen(prev => !prev)}
                      style={{ border: `1px solid ${S.border}`, background: "#FBFAFF", color: S.text, borderRadius: 12, padding: "11px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                    >
                      More
                    </button>
                    {workspaceMenuOpen && (
                      <div style={{ position: "absolute", top: 50, left: 0, minWidth: 220, zIndex: 25, background: "white", border: `1px solid ${S.border}`, borderRadius: 16, boxShadow: "0 18px 36px rgba(83, 74, 183, 0.12)", padding: 8, display: "grid", gap: 6 }}>
                        {workspaceMenuActions.map(action => (
                          <button
                            key={action.id}
                            onClick={() => {
                              setWorkspaceMenuOpen(false);
                              action.onClick();
                            }}
                            style={{ textAlign: "left", border: "none", background: "transparent", color: S.text, borderRadius: 12, padding: "11px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ minWidth: 0, maxWidth: "100%", overflow: "hidden" }}>
                  <WorkspaceAssetActionContext.Provider value={{ onGenerateAssetSuggestion: handleGenerateWorkspaceAssetSuggestion }}>
                    {panelMap[active]}
                  </WorkspaceAssetActionContext.Provider>
                </div>
              </div>
            </div>
          </div>

        </div>

          {aiOpen && (isCompact || isMobile) && (
            <div style={{ marginTop: 20, padding: isMobile ? "0 14px 24px" : "0 20px 28px" }}>
              <WorkspaceAIPanel
                collapsed={false}
                onToggle={() => setAiOpen(v => !v)}
                activeLabel={activeLabel}
                activeSummary={activeSummary}
                aiTab={aiTab}
                setAiTab={setAiTab}
                quickActions={quickActions}
                onRunQuickAction={handleQuickAction}
                reviewItems={rawReviewItems}
                onOpenSection={sectionId => setActive(sectionId)}
                onMarkReviewed={itemId => setReviewDismissed(prev => ({ ...prev, [itemId]: true }))}
                askPrompt={aiPrompt}
                setAskPrompt={setAiPrompt}
                onAsk={() => runAssistantPrompt(aiPrompt)}
                askOutput={aiOutput}
                askLoading={aiLoading}
                chatDocked={false}
              />
            </div>
          )}
        </div>
        </div>
      </div>

      {showDesktopAiRail && (
        <div style={{ width: aiRailCollapsed ? 74 : 320, flexShrink: 0, background: S.bg, transition: "width 180ms ease", padding: isCompact ? "18px 18px 24px 0" : "18px 20px 24px 0", minHeight: 0, overflow: "hidden", borderLeft: `1px solid ${S.border}`, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, minHeight: 0, overflow: "hidden", border: `1px solid ${S.border}`, borderRadius: 22, background: "white", boxShadow: aiRailCollapsed ? "none" : "0 18px 40px rgba(83, 74, 183, 0.06)" }}>
            <WorkspaceAIPanel
              collapsed={aiRailCollapsed}
              onToggle={() => setAiRailCollapsed(v => !v)}
              activeLabel={activeLabel}
              activeSummary={activeSummary}
              aiTab={aiTab}
              setAiTab={setAiTab}
              quickActions={quickActions}
              onRunQuickAction={handleQuickAction}
              reviewItems={rawReviewItems}
              onOpenSection={sectionId => setActive(sectionId)}
              onMarkReviewed={itemId => setReviewDismissed(prev => ({ ...prev, [itemId]: true }))}
              askPrompt={aiPrompt}
              setAskPrompt={setAiPrompt}
              onAsk={() => runAssistantPrompt(aiPrompt)}
              askOutput={aiOutput}
              askLoading={aiLoading}
              chatDocked={!aiRailCollapsed}
              showChat={false}
            />
          </div>
        </div>
      )}
      </div>
      </div>
        </div>
      )}

      {platformNotice && (
        <div style={{ position: "fixed", left: 24, bottom: 24, zIndex: 60, maxWidth: 420, background: "white", border: `1px solid ${S.border}`, borderRadius: 18, boxShadow: "0 20px 44px rgba(83, 74, 183, 0.18)", padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: P[600], textTransform: "uppercase", letterSpacing: "0.08em" }}>Upgrade Path</div>
          <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.65, color: S.text }}>{platformNotice}</div>
          <button
            onClick={() => setPlatformNotice("")}
            style={{ marginTop: 12, border: "none", background: P[600], color: "white", borderRadius: 12, padding: "10px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
          >
            Got it
          </button>
        </div>
      )}

      <AskAIFloating
        open={askAiOpen}
        onToggle={() => setAskAiOpen(v => !v)}
        activeLabel={activeLabel || "this section"}
        askPrompt={aiPrompt}
        setAskPrompt={setAiPrompt}
        onAsk={() => runAssistantPrompt(aiPrompt)}
        askOutput={aiOutput}
        askLoading={aiLoading}
        rightOffset={askAiRightOffset}
      />
    </div>
  );
}
