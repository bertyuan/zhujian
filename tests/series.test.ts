import assert from "node:assert/strict";
import test from "node:test";
import path from "node:path";
import { FixtureLoreSource } from "../lib/lore/fixture-source.ts";
import { aggregateTree, buildFixturePatchsets, buildPatchsets, deriveStatus } from "../lib/lore/series.ts";
import type { LoreMessage } from "../lib/lore/types.ts";

test("groups revisions, single patches, replies, and mixed-language series", async () => {
  const source = new FixtureLoreSource(path.join(process.cwd(), "fixtures", "lore"));
  const dataset = await source.loadDataset();
  const series = buildFixturePatchsets(dataset);

  assert.equal(dataset.messages.length, 12, "duplicate Message-ID should be removed");
  assert.equal(series.length, 4);
  const memory = series.filter((item) => item.subject.includes("memory barriers"));
  assert.equal(memory.length, 2);
  assert.equal(memory.find((item) => item.revision === 1)?.status, "superseded");
  assert.equal(memory.find((item) => item.revision === 2)?.versions.length, 2);
  assert.equal(memory.find((item) => item.revision === 2)?.replies, 1);

  const single = series.find((item) => item.subject.includes("admin-guide typo"));
  assert.equal(single?.patchCount, 1);
  assert.equal(single?.status, "mainline");

  const mixed = series.find((item) => item.subject.includes("align zh_CN"));
  assert.equal(mixed?.language, "mixed");
  assert.equal(mixed?.rfc, true);
});

test("aggregates a partial series without inventing confirmation", () => {
  const result = aggregateTree([
    { state: "confirmed", matched: 1, total: 1 },
    { state: "candidate", matched: 0, total: 1 },
  ]);
  assert.deepEqual(result, { state: "partial", matched: 1, total: 2 });
});

test("keeps the three stages independent when deriving status", () => {
  const trees = {
    alex: { state: "missing", matched: 0, total: 1 } as const,
    corbet: { state: "missing", matched: 0, total: 1 } as const,
    linus: { state: "confirmed", matched: 1, total: 1 } as const,
  };
  assert.equal(deriveStatus(trees, true), "mainline");
  assert.equal(trees.alex.state, "missing");
});

test("generates a route-safe ASCII id for a Chinese-only subject", () => {
  const message: LoreMessage = {
    messageId: "<chinese-subject@example.com>",
    subject: "[PATCH] 文档：修复错字",
    from: { name: "作者", email: "author@example.com" },
    date: "2026-09-05T10:00:00Z",
    references: [],
    body: "diff --git a/Documentation/translations/zh_CN/a.rst b/Documentation/translations/zh_CN/a.rst\n+++ b/Documentation/translations/zh_CN/a.rst",
    loreUrl: "https://lore.kernel.org/linux-doc/chinese-subject%40example.com/",
    rawUrl: "https://lore.kernel.org/linux-doc/chinese-subject%40example.com/raw",
  };

  const [series] = buildPatchsets({ messages: [message] });
  assert.match(series.id, /^patch-series-[0-9a-f]{7}-v1$/);
});
