import { test } from "node:test";
import assert from "node:assert/strict";
import { safeNext, DEFAULT_AFTER_LOGIN } from "./redirect.ts";

test("safeNext keeps same-site paths", () => {
  assert.equal(safeNext("/settings"), "/settings");
  assert.equal(safeNext("/dashboard?id=2"), "/dashboard?id=2");
});

test("safeNext falls back for missing or off-site targets", () => {
  for (const next of [null, undefined, "", "https://evil.example", "//evil.example", "/\\evil.example"]) {
    assert.equal(safeNext(next), DEFAULT_AFTER_LOGIN);
  }
});
