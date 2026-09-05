import assert from "node:assert/strict";
import test from "node:test";
import type { GitCommit, PatchsetDetail, TreeId, TreeSummary } from "../lib/data/schema.ts";
import { reconcilePatchsets, type CommitIndexes } from "../lib/matching/reconcile.ts";

const missing = (): TreeSummary => ({ state: "missing", matched: 0, total: 1 });
const trees = (): Record<TreeId, TreeSummary> => ({ alex: missing(), corbet: missing(), linus: missing() });

function detail(messageId = "<patch@example.com>"): PatchsetDetail {
  return {
    id: "translation-fix-deadbeef0000-v1",
    subject: "[PATCH] docs/zh_CN: fix translation typo",
    authorName: "Patch Author",
    authorEmail: "author@example.com",
    revision: 1,
    postedAt: "2026-08-01T00:00:00Z",
    language: "zh_CN",
    patchCount: 1,
    status: "on-lore",
    latestRevision: true,
    messageIds: [messageId],
    trees: trees(),
    rfc: false,
    loreUrl: "https://lore.kernel.org/linux-doc/patch/",
    rawUrl: "https://lore.kernel.org/linux-doc/patch/raw",
    replies: 0,
    versions: [{ revision: 1, id: "translation-fix-deadbeef0000-v1", current: true }],
    patches: [{
      index: 1,
      total: 1,
      subject: "docs/zh_CN: fix translation typo",
      messageId,
      loreUrl: "https://lore.kernel.org/linux-doc/patch/",
      changedFiles: ["Documentation/translations/zh_CN/a.rst"],
      patchId: "a".repeat(40),
      trees: trees(),
    }],
  };
}

function commit(tree: TreeId, options: Partial<GitCommit> = {}): GitCommit {
  return {
    tree,
    branch: tree === "alex" ? "docs-next" : tree === "corbet" ? "docs-mw" : "master",
    commit: options.commit ?? (tree === "alex" ? "1" : tree === "corbet" ? "2" : "3").repeat(40),
    subject: "docs/zh_CN: fix translation typo",
    authorName: "Patch Author",
    authorEmail: "author@example.com",
    authorDate: "2026-08-03T00:00:00Z",
    committerDate: "2026-08-04T00:00:00Z",
    patchId: options.patchId ?? "a".repeat(40),
    changedFiles: ["Documentation/translations/zh_CN/a.rst"],
    firstSeenAt: "2026-08-04T00:00:00Z",
    lastSeenAt: "2026-08-04T00:00:00Z",
    currentlyPresent: options.currentlyPresent ?? true,
    ...options,
  };
}

test("keeps confirmed, historical, and candidate matches distinct per tree", () => {
  const indexes: CommitIndexes = {
    alex: [commit("alex")],
    corbet: [commit("corbet", { currentlyPresent: false })],
    linus: [commit("linus", { patchId: "b".repeat(40) })],
  };
  const result = reconcilePatchsets([detail()], indexes, { matches: [], ignore: [] });
  const patchTrees = result.details[0].patches[0].trees;

  assert.equal(patchTrees.alex.state, "confirmed");
  assert.equal(patchTrees.corbet.state, "previously-present");
  assert.equal(patchTrees.linus.state, "candidate");
  assert.equal(result.details[0].status, "queued-alex");
  assert.deepEqual(
    { confirmed: result.confirmed, candidates: result.candidates, previouslyPresent: result.previouslyPresent },
    { confirmed: 1, candidates: 1, previouslyPresent: 1 },
  );
});

test("manual overrides confirm edited patches and ignore known noise", () => {
  const source = detail();
  const indexes: CommitIndexes = { alex: [], corbet: [], linus: [] };
  const overridden = reconcilePatchsets([source], indexes, {
    matches: [{ messageId: "<patch@example.com>", tree: "alex", commit: "abcdef1", reason: "edited while applying" }],
    ignore: [],
  });
  assert.equal(overridden.details[0].patches[0].trees.alex.state, "confirmed");
  assert.equal(overridden.details[0].patches[0].trees.alex.commit, "abcdef1");

  const ignored = reconcilePatchsets([source], indexes, {
    matches: [],
    ignore: [{ messageId: "<patch@example.com>", reason: "not translation work" }],
  });
  assert.equal(ignored.details.length, 0);
  assert.equal(ignored.ignoredPatches, 1);
  const repeated = reconcilePatchsets(ignored.details, indexes, {
    matches: [],
    ignore: [{ messageId: "<patch@example.com>", reason: "not translation work" }],
  });
  assert.equal(repeated.details.length, 0);
  assert.equal(repeated.ignoredPatches, 0);
});

test("candidate matching requires strong metadata agreement", () => {
  const indexes: CommitIndexes = {
    alex: [commit("alex", { patchId: "b".repeat(40), authorEmail: "someone-else@example.com", authorName: "Someone Else" })],
    corbet: [],
    linus: [],
  };
  const result = reconcilePatchsets([detail()], indexes, { matches: [], ignore: [] });
  assert.equal(result.details[0].patches[0].trees.alex.state, "missing");
});
