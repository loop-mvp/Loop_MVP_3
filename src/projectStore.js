import { supabase } from "./supabaseClient";

const TABLE = "loop_projects";

function normalizeDraftText(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join("\n");
  return typeof value === "string" ? value.trim() : "";
}

function countFilledTextFields(values) {
  return (values || []).reduce((count, value) => count + (String(value || "").trim() ? 1 : 0), 0);
}

function countSnapshotContent(snapshot = {}) {
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

function preferNonEmpty(incomingValue, existingValue) {
  return String(incomingValue || "").trim() ? incomingValue : existingValue;
}

function mergeSnapshotPreservingContent(existingSnapshot = {}, incomingSnapshot = {}) {
  if (countSnapshotContent(incomingSnapshot) >= countSnapshotContent(existingSnapshot)) {
    return incomingSnapshot;
  }

  return {
    ...existingSnapshot,
    ...incomingSnapshot,
    pd: {
      ...existingSnapshot.pd,
      ...incomingSnapshot.pd,
      name: preferNonEmpty(incomingSnapshot.pd?.name, existingSnapshot.pd?.name),
      description: preferNonEmpty(incomingSnapshot.pd?.description, existingSnapshot.pd?.description),
      whatItDoes: preferNonEmpty(incomingSnapshot.pd?.whatItDoes, existingSnapshot.pd?.whatItDoes),
      problem: preferNonEmpty(incomingSnapshot.pd?.problem, existingSnapshot.pd?.problem),
      problemStatement: preferNonEmpty(incomingSnapshot.pd?.problemStatement, existingSnapshot.pd?.problemStatement),
      solution: preferNonEmpty(incomingSnapshot.pd?.solution, existingSnapshot.pd?.solution),
      audience: preferNonEmpty(incomingSnapshot.pd?.audience, existingSnapshot.pd?.audience),
      diff: preferNonEmpty(incomingSnapshot.pd?.diff, existingSnapshot.pd?.diff),
    },
    pos: {
      ...existingSnapshot.pos,
      ...incomingSnapshot.pos,
      statement: preferNonEmpty(incomingSnapshot.pos?.statement, existingSnapshot.pos?.statement),
      valueProp: preferNonEmpty(incomingSnapshot.pos?.valueProp, existingSnapshot.pos?.valueProp),
    },
    msg: {
      ...existingSnapshot.msg,
      ...incomingSnapshot.msg,
      pillars: preferNonEmpty(incomingSnapshot.msg?.pillars, existingSnapshot.msg?.pillars),
      headline: preferNonEmpty(incomingSnapshot.msg?.headline, existingSnapshot.msg?.headline),
      elevator: preferNonEmpty(incomingSnapshot.msg?.elevator, existingSnapshot.msg?.elevator),
    },
    strat: {
      ...existingSnapshot.strat,
      ...incomingSnapshot.strat,
      goal: preferNonEmpty(incomingSnapshot.strat?.goal, existingSnapshot.strat?.goal),
      channels: preferNonEmpty(incomingSnapshot.strat?.channels, existingSnapshot.strat?.channels),
      hooks: preferNonEmpty(incomingSnapshot.strat?.hooks, existingSnapshot.strat?.hooks),
      icp: preferNonEmpty(incomingSnapshot.strat?.icp, existingSnapshot.strat?.icp),
    },
    assets: {
      ...existingSnapshot.assets,
      ...incomingSnapshot.assets,
      notes: preferNonEmpty(incomingSnapshot.assets?.notes, existingSnapshot.assets?.notes),
    },
    aiDraft: {
      ...existingSnapshot.aiDraft,
      ...incomingSnapshot.aiDraft,
    },
    workflowStage: incomingSnapshot.workflowStage || existingSnapshot.workflowStage,
    active: incomingSnapshot.active || existingSnapshot.active,
    feedbackCaptured: incomingSnapshot.feedbackCaptured || existingSnapshot.feedbackCaptured,
    launchComplete: incomingSnapshot.launchComplete || existingSnapshot.launchComplete,
  };
}

function mapRowToProject(row) {
  const snapshotName = row.snapshot?.pd?.name || "";
  const snapshotDescription = row.snapshot?.pd?.description || "";
  return {
    id: row.id,
    name: snapshotName || row.name || "Untitled Test Project",
    description: snapshotDescription || row.description || "Loop MVP project",
    launchDate: row.launch_date || "",
    version: row.version || "v1.0",
    status: row.status || "Planned",
    updatedAt: row.updated_at,
    snapshot: row.snapshot || {},
  };
}

export function isSupabaseConfigured() {
  return !!supabase;
}

export async function listLoopProjects() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(TABLE)
    .select("id, name, description, launch_date, version, status, updated_at, snapshot")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(mapRowToProject);
}

export async function saveLoopProject(project) {
  if (!supabase) return null;

  let existingRow = null;
  const { data: existingData } = await supabase
    .from(TABLE)
    .select("id, name, description, launch_date, version, status, updated_at, snapshot")
    .eq("id", project.id)
    .maybeSingle();
  existingRow = existingData || null;

  const mergedSnapshot = mergeSnapshotPreservingContent(existingRow?.snapshot || {}, project.snapshot || {});
  const mergedName = preferNonEmpty(mergedSnapshot?.pd?.name || project.name, existingRow?.snapshot?.pd?.name || existingRow?.name);
  const mergedDescription = preferNonEmpty(mergedSnapshot?.pd?.description || project.description, existingRow?.snapshot?.pd?.description || existingRow?.description);
  const mergedStatus = preferNonEmpty(project.status, existingRow?.status) || "Planned";

  const payload = {
    id: project.id,
    name: mergedName || "Untitled Test Project",
    description: mergedDescription || "Loop MVP project",
    launch_date: project.launchDate || null,
    version: project.version || "v1.0",
    status: mergedStatus,
    platform_mode: "test",
    snapshot: mergedSnapshot,
  };

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(payload)
    .select("id, name, description, launch_date, version, status, updated_at, snapshot")
    .single();

  if (error) throw error;
  return mapRowToProject(data);
}

export async function deleteLoopProject(projectId) {
  if (!supabase) return;

  const { error } = await supabase.from(TABLE).delete().eq("id", projectId);
  if (error) throw error;
}
