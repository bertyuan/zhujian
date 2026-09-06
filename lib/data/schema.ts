export type Language = "zh_CN" | "zh_TW" | "mixed";
export type PatchsetStatus =
  | "on-lore"
  | "in-review"
  | "queued-alex"
  | "in-docs-mw"
  | "mainline"
  | "partially-applied"
  | "superseded"
  | "previously-queued";
export type LightState = "confirmed" | "partial" | "candidate" | "previously-present" | "missing";
export type TreeId = "alex" | "corbet" | "linus";
export type ReviewTrailerType = "Reviewed-by" | "Acked-by" | "Tested-by" | "Suggested-by" | "Reported-by";

export interface ReviewTrailer {
  type: ReviewTrailerType;
  value: string;
  messageId: string;
}

export interface TreeSummary {
  state: LightState;
  matched: number;
  total: number;
  commit?: string;
}

export interface PatchsetSummary {
  id: string;
  subject: string;
  authorName: string;
  authorEmail: string;
  revision: number;
  postedAt: string;
  language: Language;
  patchCount: number;
  status: PatchsetStatus;
  latestRevision: boolean;
  messageIds: string[];
  trees: Record<TreeId, TreeSummary>;
}

export interface PatchDetail {
  index: number;
  total: number;
  subject: string;
  messageId: string;
  loreUrl: string;
  changedFiles: string[];
  patchId?: string;
  trailers?: ReviewTrailer[];
  trees: Record<TreeId, TreeSummary>;
}

export interface PatchsetDetail extends PatchsetSummary {
  rfc: boolean;
  loreUrl: string;
  rawUrl: string;
  replies: number;
  versions: Array<{ revision: number; id: string; current: boolean }>;
  patches: PatchDetail[];
}

export interface SyncMetadata {
  mode: "fixture" | "live";
  generatedAt: string;
  sources: Record<string, { status: "ok" | "error"; head?: string; lastSuccessfulSync?: string }>;
}

export interface SyncRunState {
  status: "ok" | "error";
  attemptedAt: string;
  lastSuccessfulSync?: string;
  source?: string;
  error?: string;
}

export interface GitCommit {
  tree: TreeId;
  branch: string;
  commit: string;
  subject: string;
  authorName: string;
  authorEmail: string;
  authorDate: string;
  committerDate: string;
  patchId?: string;
  changedFiles: string[];
  firstSeenAt: string;
  lastSeenAt: string;
  currentlyPresent: boolean;
}

export interface TreeMatch {
  tree: TreeId;
  state: LightState;
  commit?: string;
  patchId?: string;
  firstSeenAt?: string;
  lastSeenAt?: string;
  currentlyPresent?: boolean;
  reason?: string;
}
