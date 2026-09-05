import assert from "node:assert/strict";
import test from "node:test";
import patchsets from "../data/patchsets.json" with { type: "json" };
import { validatePatchsetSummaries } from "../lib/data/validation.ts";

test("accepts the committed summary index", () => {
  assert.equal(validatePatchsetSummaries(patchsets).length > 0, true);
});

test("rejects an impossible confirmed count", () => {
  const invalid = structuredClone(patchsets);
  invalid[0].trees.alex.state = "confirmed";
  invalid[0].trees.alex.matched = 0;
  assert.throws(() => validatePatchsetSummaries(invalid), /confirmed state requires every patch/);
});
