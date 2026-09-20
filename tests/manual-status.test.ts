import assert from "node:assert/strict";
import test from "node:test";
import { withManualStatus } from "../lib/status/overrides.ts";
import type { PatchsetSummary } from "../lib/data/schema.ts";
import { createSession, readSession, shouldRefreshSession } from "../lib/auth/session.ts";
import { verifyApiKey } from "../lib/auth/api-key.ts";

const patchset: PatchsetSummary = {
  id: "translation-fix-123456789abc-v1", subject: "[PATCH] docs/zh_CN: fix typo", authorName: "Author", authorEmail: "author@example.com",
  revision: 1, postedAt: "2026-09-20T00:00:00Z", language: "zh_CN", patchCount: 1, status: "proposed", lifecycle: "active",
  reviewState: "waiting", reviewReplies: 0, latestRevision: true, messageIds: ["<patch@example.com>"],
  trees: {
    alex: { state: "missing", matched: 0, total: 1 }, corbet: { state: "missing", matched: 0, total: 1 }, linus: { state: "missing", matched: 0, total: 1 },
  },
};

test("manual status overrides the automatically derived status", () => {
  const result = withManualStatus(patchset, new Map([[patchset.id, {
    status: "applied", reason: "Maintainer applied it manually.", actor: "Linus", setAt: "2026-09-20T01:00:00Z",
  }]]));
  assert.equal(result.status, "applied");
  assert.equal(result.manualStatus?.actor, "Linus");
});

test("status session is signed and rejects a modified cookie", () => {
  process.env.BUDING_API_SESSION_SECRET = "test-session-secret";
  process.env.BUDING_API_SESSION_DAYS = "30";
  process.env.BUDING_API_SESSION_REFRESH_DAYS = "7";
  const value = createSession({ keyId: "key-1", label: "Maintainer", role: "operator" });
  assert.equal(readSession(value)?.keyId, "key-1");
  assert.equal(readSession(`${value}x`), null);
});

test("status session refreshes only inside the configured renewal window", () => {
  process.env.BUDING_API_SESSION_DAYS = "30";
  process.env.BUDING_API_SESSION_REFRESH_DAYS = "7";
  const common = { keyId: "key-1", label: "Maintainer", role: "operator" as const };
  assert.equal(shouldRefreshSession({ ...common, expiresAt: Date.now() + 6 * 24 * 60 * 60 * 1000 }), true);
  assert.equal(shouldRefreshSession({ ...common, expiresAt: Date.now() + 8 * 24 * 60 * 60 * 1000 }), false);
});

test("the environment root key authenticates without a database record", async () => {
  process.env.BUDING_ADMIN_KEY = "test-root-key";
  const identity = await verifyApiKey("test-root-key");
  assert.equal(identity?.role, "admin");
  assert.match(identity?.keyId ?? "", /^root_/);
});
