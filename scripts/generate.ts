import { generateFromLoreCache } from "../lib/data/pipeline.ts";

const report = await generateFromLoreCache(process.cwd());
console.log(`Generation complete: ${report.details.length} series, ${report.confirmed} confirmed, ${report.candidates} candidate, ${report.previouslyPresent} previously present, ${report.manualOverrides} manual overrides, ${report.ignoredPatches} ignored, ${report.expiredMainlineFamilies} expired mainline families removed.`);
