import patchsetsData from "@/data/patchsets.json";
import metadataData from "@/data/metadata.json";
import syncStateData from "@/data/internal/sync-state.json";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { PatchsetDetail, PatchsetSummary, SyncMetadata, SyncRunState } from "./schema";
import { validatePatchsetDetail, validatePatchsetSummaries, validateSyncMetadata, validateSyncRunState } from "./validation";

export function getPatchsets(): PatchsetSummary[] {
  return validatePatchsetSummaries(patchsetsData);
}

export function getMetadata(): SyncMetadata {
  return validateSyncMetadata(metadataData);
}

export function getSyncRunState(): SyncRunState {
  return validateSyncRunState(syncStateData);
}

export async function getPatchset(id: string): Promise<PatchsetDetail | null> {
  if (!/^[a-z0-9-]+$/.test(id)) return null;
  try {
    const file = await readFile(path.join(process.cwd(), "data", "patchsets", `${id}.json`), "utf8");
    return validatePatchsetDetail(JSON.parse(file), `data/patchsets/${id}.json`);
  } catch {
    return null;
  }
}

export async function getPatchsetDetails(): Promise<PatchsetDetail[]> {
  return Promise.all(getPatchsets().map(async (summary) => {
    const detail = await getPatchset(summary.id);
    if (!detail) throw new Error(`Missing generated detail for ${summary.id}`);
    return detail;
  }));
}
