import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { TRACKED_TREES } from "../git/config.ts";
import {
  validateGitCommitIndex,
  validatePatchsetDetail,
  validatePatchsetSummaries,
  validateSyncMetadata,
} from "./validation.ts";

async function json(file: string): Promise<unknown> {
  return JSON.parse(await readFile(file, "utf8")) as unknown;
}

export interface GeneratedDataValidationReport {
  summaries: number;
  details: number;
  indexedCommits: number;
}

export async function validateGeneratedData(root: string): Promise<GeneratedDataValidationReport> {
  const summaries = validatePatchsetSummaries(await json(path.join(root, "data", "patchsets.json")));
  validateSyncMetadata(await json(path.join(root, "data", "metadata.json")));
  const files = (await readdir(path.join(root, "data", "patchsets"))).filter((file) => file.endsWith(".json"));
  const details = await Promise.all(files.map(async (file) => validatePatchsetDetail(
    await json(path.join(root, "data", "patchsets", file)),
    file,
  )));
  const detailIds = new Set(details.map((detail) => detail.id));
  const summaryIds = new Set(summaries.map((summary) => summary.id));
  for (const summary of summaries) {
    if (!detailIds.has(summary.id)) throw new Error(`Missing detail file for ${summary.id}`);
  }
  for (const detail of details) {
    if (!summaryIds.has(detail.id)) throw new Error(`Orphan detail file for ${detail.id}`);
  }
  let indexedCommits = 0;
  for (const tree of TRACKED_TREES) {
    const commits = validateGitCommitIndex(await json(path.join(root, "data", "indexes", `${tree.id}.json`)), tree.id);
    indexedCommits += commits.length;
  }
  return { summaries: summaries.length, details: details.length, indexedCommits };
}
