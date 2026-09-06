import assert from "node:assert/strict";
import test from "node:test";
import patchsets from "../data/patchsets.json" with { type: "json" };
import { validatePatchsetDetail, validatePatchsetSummaries, validateSyncRunState } from "../lib/data/validation.ts";

function validDetail() {
  const missing = { state: "missing", matched: 0, total: 1 };
  return {
    id: "test-series-v1",
    subject: "[PATCH] docs/zh_CN: test",
    authorName: "Test Author",
    authorEmail: "author@example.com",
    revision: 1,
    postedAt: "2026-09-05T00:00:00Z",
    language: "zh_CN",
    patchCount: 1,
    status: "waiting-for-review",
    latestRevision: true,
    messageIds: ["<test@example.com>"],
    trees: { alex: missing, corbet: missing, linus: missing },
    rfc: false,
    loreUrl: "https://lore.kernel.org/linux-doc/test@example.com/",
    rawUrl: "https://lore.kernel.org/linux-doc/test@example.com/raw",
    replies: 0,
    versions: [{ revision: 1, id: "test-series-v1", current: true }],
    patches: [{
      index: 1,
      total: 1,
      subject: "docs/zh_CN: test",
      messageId: "<test@example.com>",
      loreUrl: "https://lore.kernel.org/linux-doc/test@example.com/",
      changedFiles: ["Documentation/translations/zh_CN/test.rst"],
      patchId: "a".repeat(40),
      trees: { alex: missing, corbet: missing, linus: missing },
    }],
  };
}

test("accepts the committed summary index", () => {
  assert.equal(validatePatchsetSummaries(patchsets).length > 0, true);
});

test("rejects an impossible confirmed count", () => {
  const invalid = structuredClone(patchsets);
  invalid[0].trees.alex.state = "confirmed";
  invalid[0].trees.alex.matched = 0;
  assert.throws(() => validatePatchsetSummaries(invalid), /confirmed state requires every patch/);
});

test("rejects unsafe generated links and contradictory patch numbering", () => {
  const unsafe = validDetail();
  unsafe.loreUrl = "javascript:alert(1)";
  assert.throws(() => validatePatchsetDetail(unsafe), /expected an HTTPS URL/);

  const numbering = validDetail();
  numbering.patches[0].index = numbering.patches[0].total + 1;
  assert.throws(() => validatePatchsetDetail(numbering), /patch index cannot exceed total/);
});

test("requires one current version that points back to the detail", () => {
  const invalid = validDetail();
  invalid.versions.forEach((version) => { version.current = false; });
  assert.throws(() => validatePatchsetDetail(invalid), /single current version/);
});

test("validates successful and failed synchronization states", () => {
  assert.equal(validateSyncRunState({ status: "ok", attemptedAt: "2026-09-05T00:00:00Z" }).status, "ok");
  assert.throws(() => validateSyncRunState({ status: "error", attemptedAt: "2026-09-05T00:00:00Z" }), /required when status is error/);
});
