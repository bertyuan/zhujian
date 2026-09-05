import assert from "node:assert/strict";
import test from "node:test";
import { parseOverrides } from "../lib/matching/overrides.ts";

test("parses reviewable match and ignore overrides", () => {
  const result = parseOverrides(`
matches:
  - message_id: "<edited@example.com>"
    tree: alex
    commit: abcdef1234567
    reason: "Patch edited while applying"
ignore:
  - message_id: '<noise@example.com>'
    reason: Not a Chinese translation patch
`);

  assert.deepEqual(result.matches[0], {
    messageId: "<edited@example.com>",
    tree: "alex",
    commit: "abcdef1234567",
    reason: "Patch edited while applying",
  });
  assert.equal(result.ignore[0].messageId, "<noise@example.com>");
});

test("rejects ambiguous duplicate overrides", () => {
  assert.throws(() => parseOverrides(`
matches:
  - message_id: "<edited@example.com>"
    tree: alex
    commit: abcdef1
    reason: first
  - message_id: "<edited@example.com>"
    tree: alex
    commit: 1234567
    reason: second
ignore: []
`), /Duplicate match override/);
});
