import { supabase } from "./supabaseClient";

const ASSET_BUCKET = "loop-assets";
const ASSET_TABLE = "loop_asset_files";

function slugify(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "asset";
}

function buildPath({ projectId, kind = "asset", fileName = "" }) {
  const now = new Date().toISOString().replace(/[:.]/g, "-");
  return `${slugify(projectId)}/${slugify(kind)}/${now}-${slugify(fileName)}`;
}

async function insertAssetRecord(record) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from(ASSET_TABLE)
    .insert(record)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export function isAssetStorageConfigured() {
  return !!supabase;
}

export async function uploadBlobAsset({
  projectId,
  assetId = "",
  kind = "generated-asset",
  fileName,
  blob,
  mimeType = "text/plain;charset=utf-8",
  metadata = {},
}) {
  if (!supabase) return null;

  const safeFileName = fileName || `${slugify(kind)}.txt`;
  const storagePath = buildPath({ projectId, kind, fileName: safeFileName });
  const uploadPayload = blob instanceof Blob ? blob : new Blob([blob], { type: mimeType });

  const { error: uploadError } = await supabase
    .storage
    .from(ASSET_BUCKET)
    .upload(storagePath, uploadPayload, {
      upsert: true,
      contentType: mimeType,
    });

  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage.from(ASSET_BUCKET).getPublicUrl(storagePath);
  const record = await insertAssetRecord({
    project_id: projectId,
    asset_id: assetId || null,
    kind,
    file_name: safeFileName,
    storage_path: storagePath,
    mime_type: mimeType,
    size_bytes: uploadPayload.size,
    generated_by: metadata.generatedBy || "system",
    metadata,
  });

  return {
    record,
    storagePath,
    publicUrl: publicUrlData?.publicUrl || "",
    fileName: safeFileName,
    mimeType,
    sizeBytes: uploadPayload.size,
  };
}

export async function uploadGeneratedAssetFile({ projectId, asset, content, projectName }) {
  const safeName = `${slugify(projectName || projectId)}-${slugify(asset.assetName || asset.id)}.txt`;
  return uploadBlobAsset({
    projectId,
    assetId: asset.id,
    kind: "generated-asset",
    fileName: safeName,
    blob: new Blob([content], { type: "text/plain;charset=utf-8" }),
    mimeType: "text/plain;charset=utf-8",
    metadata: {
      generatedBy: asset.generatedBy || "AI Suggestion",
      assetName: asset.assetName,
      assetType: asset.type,
      category: asset.category,
      kit: asset.kit,
      sourceSection: asset.sourceSection,
    },
  });
}

export async function uploadExportArtifact({ projectId, fileName, html, kind = "report", metadata = {} }) {
  return uploadBlobAsset({
    projectId,
    kind,
    fileName,
    blob: new Blob([html], { type: "text/html;charset=utf-8" }),
    mimeType: "text/html;charset=utf-8",
    metadata,
  });
}

export async function uploadBrandFile({ projectId, file, metadata = {} }) {
  if (!file) return null;
  return uploadBlobAsset({
    projectId,
    kind: "brand-file",
    fileName: file.name,
    blob: file,
    mimeType: file.type || "application/octet-stream",
    metadata,
  });
}
