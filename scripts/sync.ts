import { generateFromLoreCache } from "../lib/data/pipeline.ts";
import { validateGeneratedData } from "../lib/data/validate-generated.ts";
import { synchronizeGit } from "../lib/git/sync.ts";
import { LeiLoreSource } from "../lib/lore/lei-source.ts";
import { synchronizeLore } from "../lib/lore/sync.ts";

const root = process.cwd();
const requestedSince = process.env.SYNC_SINCE?.trim();
const initialSince = requestedSince || process.env.INITIAL_SYNC_SINCE?.trim() || "2025-01-01T00:00:00Z";

const lore = await synchronizeLore({
  root,
  source: new LeiLoreSource(),
  initialSince,
  forceInitialSince: Boolean(requestedSince),
  writePublicData: false,
});
console.log(`Lore: ${lore.newMessages} new messages, ${lore.patchIdsComputed} new patch IDs, ${lore.series} series.`);

const git = await synchronizeGit({
  root,
  initialSince: process.env.GIT_SYNC_SINCE?.trim() || initialSince,
  forceRescan: Boolean(requestedSince)
    || process.env.GIT_FORCE_RESCAN === "true"
    || process.env.GIT_FORCE_RESCAN === "1",
});
for (const tree of git.trees) {
  console.log(`Git ${tree.tree}: ${tree.mode}, ${tree.scannedCommits} scanned, ${tree.indexedCommits} indexed.`);
}

const generated = await generateFromLoreCache(root);
console.log(`Reconciliation: ${generated.confirmed} confirmed, ${generated.candidates} candidate, ${generated.previouslyPresent} previously present, ${generated.ignoredPatches} ignored.`);

const validated = await validateGeneratedData(root);
console.log(`Sync complete: ${validated.summaries} series, ${validated.indexedCommits} indexed commits, generated data valid.`);
