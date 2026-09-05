import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { TRACKED_TREES } from "../lib/git/config.ts";
import { validateGitCommitIndex, validatePatchsetDetail, validatePatchsetSummaries, validateSyncMetadata } from "../lib/data/validation.ts";

const root = process.cwd();
const readJson = async (file: string) => JSON.parse(await readFile(file, "utf8")) as unknown;
const summaries = validatePatchsetSummaries(await readJson(path.join(root, "data", "patchsets.json")));
validateSyncMetadata(await readJson(path.join(root, "data", "metadata.json")));
const files = (await readdir(path.join(root, "data", "patchsets"))).filter((file) => file.endsWith(".json"));
const details = await Promise.all(files.map(async (file) => validatePatchsetDetail(await readJson(path.join(root, "data", "patchsets", file)), file)));
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
  const commits = validateGitCommitIndex(await readJson(path.join(root, "data", "indexes", `${tree.id}.json`)), tree.id);
  indexedCommits += commits.length;
}
console.log(`Data validation passed: ${summaries.length} summaries, ${details.length} detail files, and ${indexedCommits} indexed Git commits.`);
