import type {
  Language,
  LightState,
  PatchDetail,
  PatchsetDetail,
  PatchsetStatus,
  PatchsetSummary,
  SyncMetadata,
  TreeId,
  TreeSummary,
} from "./schema";

const LANGUAGES = new Set<Language>(["zh_CN", "zh_TW", "mixed"]);
const LIGHT_STATES = new Set<LightState>(["confirmed", "partial", "candidate", "previously-present", "missing"]);
const STATUSES = new Set<PatchsetStatus>([
  "on-lore", "queued-alex", "in-docs-mw", "mainline", "partially-applied", "superseded", "previously-queued",
]);
const TREE_IDS: TreeId[] = ["alex", "corbet", "linus"];

function fail(path: string, message: string): never {
  throw new Error(`Invalid generated data at ${path}: ${message}`);
}

function object(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(path, "expected an object");
  return value as Record<string, unknown>;
}

function string(value: unknown, path: string): string {
  if (typeof value !== "string" || !value.trim()) fail(path, "expected a non-empty string");
  return value;
}

function optionalString(value: unknown, path: string): string | undefined {
  if (value === undefined) return undefined;
  return string(value, path);
}

function integer(value: unknown, path: string, minimum = 0): number {
  if (!Number.isInteger(value) || (value as number) < minimum) fail(path, `expected an integer >= ${minimum}`);
  return value as number;
}

function boolean(value: unknown, path: string): boolean {
  if (typeof value !== "boolean") fail(path, "expected a boolean");
  return value;
}

function isoDate(value: unknown, path: string): string {
  const result = string(value, path);
  if (Number.isNaN(Date.parse(result))) fail(path, "expected an ISO date");
  return result;
}

function stringArray(value: unknown, path: string): string[] {
  if (!Array.isArray(value)) fail(path, "expected an array");
  return value.map((item, index) => string(item, `${path}[${index}]`));
}

function treeSummary(value: unknown, path: string): TreeSummary {
  const item = object(value, path);
  const state = string(item.state, `${path}.state`) as LightState;
  if (!LIGHT_STATES.has(state)) fail(`${path}.state`, `unknown state ${state}`);
  const matched = integer(item.matched, `${path}.matched`);
  const total = integer(item.total, `${path}.total`, 1);
  if (matched > total) fail(path, "matched cannot exceed total");
  if (state === "confirmed" && matched !== total) fail(path, "confirmed state requires every patch to match");
  if (state === "missing" && matched !== 0) fail(path, "missing state requires zero matches");
  const commit = optionalString(item.commit, `${path}.commit`);
  if (commit && !/^[0-9a-f]{7,40}$/i.test(commit)) fail(`${path}.commit`, "expected a Git SHA");
  return { state, matched, total, ...(commit ? { commit } : {}) };
}

function trees(value: unknown, path: string): Record<TreeId, TreeSummary> {
  const item = object(value, path);
  return Object.fromEntries(TREE_IDS.map((id) => [id, treeSummary(item[id], `${path}.${id}`)])) as Record<TreeId, TreeSummary>;
}

export function validatePatchsetSummary(value: unknown, path = "patchset"): PatchsetSummary {
  const item = object(value, path);
  const language = string(item.language, `${path}.language`) as Language;
  const status = string(item.status, `${path}.status`) as PatchsetStatus;
  if (!LANGUAGES.has(language)) fail(`${path}.language`, `unknown language ${language}`);
  if (!STATUSES.has(status)) fail(`${path}.status`, `unknown status ${status}`);
  const id = string(item.id, `${path}.id`);
  if (!/^[a-z0-9-]+$/.test(id)) fail(`${path}.id`, "use lowercase letters, numbers, and hyphens only");
  const messageIds = stringArray(item.messageIds, `${path}.messageIds`);
  if (!messageIds.length || messageIds.some((messageId) => !/^<[^<>\s]+>$/.test(messageId))) {
    fail(`${path}.messageIds`, "expected at least one bracketed Message-ID");
  }
  return {
    id,
    subject: string(item.subject, `${path}.subject`),
    authorName: string(item.authorName, `${path}.authorName`),
    authorEmail: string(item.authorEmail, `${path}.authorEmail`),
    revision: integer(item.revision, `${path}.revision`, 1),
    postedAt: isoDate(item.postedAt, `${path}.postedAt`),
    language,
    patchCount: integer(item.patchCount, `${path}.patchCount`, 1),
    status,
    latestRevision: boolean(item.latestRevision, `${path}.latestRevision`),
    messageIds,
    trees: trees(item.trees, `${path}.trees`),
  };
}

export function validatePatchsetSummaries(value: unknown): PatchsetSummary[] {
  if (!Array.isArray(value)) fail("patchsets", "expected an array");
  const result = value.map((item, index) => validatePatchsetSummary(item, `patchsets[${index}]`));
  const ids = new Set<string>();
  for (const item of result) {
    if (ids.has(item.id)) fail("patchsets", `duplicate id ${item.id}`);
    ids.add(item.id);
  }
  return result;
}

function patchDetail(value: unknown, path: string): PatchDetail {
  const item = object(value, path);
  const messageId = string(item.messageId, `${path}.messageId`);
  if (!/^<[^<>\s]+>$/.test(messageId)) fail(`${path}.messageId`, "expected a bracketed Message-ID");
  return {
    index: integer(item.index, `${path}.index`, 1),
    total: integer(item.total, `${path}.total`, 1),
    subject: string(item.subject, `${path}.subject`),
    messageId,
    loreUrl: string(item.loreUrl, `${path}.loreUrl`),
    changedFiles: stringArray(item.changedFiles, `${path}.changedFiles`),
    patchId: optionalString(item.patchId, `${path}.patchId`),
    trees: trees(item.trees, `${path}.trees`),
  };
}

export function validatePatchsetDetail(value: unknown, path = "patchset"): PatchsetDetail {
  const summary = validatePatchsetSummary(value, path);
  const item = object(value, path);
  if (!Array.isArray(item.patches)) fail(`${path}.patches`, "expected an array");
  if (!Array.isArray(item.versions)) fail(`${path}.versions`, "expected an array");
  const patches = item.patches.map((patch, index) => patchDetail(patch, `${path}.patches[${index}]`));
  if (patches.length !== summary.patchCount) fail(`${path}.patches`, "length must equal patchCount");
  return {
    ...summary,
    rfc: boolean(item.rfc, `${path}.rfc`),
    loreUrl: string(item.loreUrl, `${path}.loreUrl`),
    rawUrl: string(item.rawUrl, `${path}.rawUrl`),
    replies: integer(item.replies, `${path}.replies`),
    versions: item.versions.map((version, index) => {
      const entry = object(version, `${path}.versions[${index}]`);
      return {
        revision: integer(entry.revision, `${path}.versions[${index}].revision`, 1),
        id: string(entry.id, `${path}.versions[${index}].id`),
        current: boolean(entry.current, `${path}.versions[${index}].current`),
      };
    }),
    patches,
  };
}

export function validateSyncMetadata(value: unknown): SyncMetadata {
  const item = object(value, "metadata");
  const mode = string(item.mode, "metadata.mode");
  if (mode !== "fixture" && mode !== "live") fail("metadata.mode", "expected fixture or live");
  const sources = object(item.sources, "metadata.sources");
  const validatedSources = Object.fromEntries(Object.entries(sources).map(([id, source]) => {
    const entry = object(source, `metadata.sources.${id}`);
    const rawStatus = string(entry.status, `metadata.sources.${id}.status`);
    if (rawStatus !== "ok" && rawStatus !== "error") fail(`metadata.sources.${id}.status`, "expected ok or error");
    const status: "ok" | "error" = rawStatus;
    return [id, {
      status,
      ...(entry.head ? { head: string(entry.head, `metadata.sources.${id}.head`) } : {}),
      ...(entry.lastSuccessfulSync ? { lastSuccessfulSync: isoDate(entry.lastSuccessfulSync, `metadata.sources.${id}.lastSuccessfulSync`) } : {}),
    }];
  }));
  return { mode, generatedAt: isoDate(item.generatedAt, "metadata.generatedAt"), sources: validatedSources };
}
