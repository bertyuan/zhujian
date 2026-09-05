import type { TreeId } from "../data/schema";

export interface TrackedTree {
  id: TreeId;
  name: string;
  repository: string;
  branch: string;
}

export const RELEVANT_PATHS = [
  "Documentation/translations/zh_CN/",
  "Documentation/translations/zh_TW/",
] as const;

export const TRACKED_TREES: readonly TrackedTree[] = [
  {
    id: "alex",
    name: "Alex",
    repository: "https://git.kernel.org/pub/scm/linux/kernel/git/alexs/linux.git",
    branch: "docs-next",
  },
  {
    id: "corbet",
    name: "Corbet",
    repository: "https://git.kernel.org/pub/scm/linux/kernel/git/docs/linux.git",
    branch: "docs-mw",
  },
  {
    id: "linus",
    name: "Linus",
    repository: "https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git",
    branch: "master",
  },
] as const;
