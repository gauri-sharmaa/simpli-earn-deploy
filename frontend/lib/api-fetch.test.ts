import assert from "node:assert/strict";
import { test } from "node:test";

import { apiFetch, onBackendWaking } from "./api-fetch.ts";

const ok = (status = 200) => new Response("{}", { status });
const noSleep = async () => {};

function scripted(results: Array<Response | Error>) {
  let calls = 0;
  const fetchImpl = (async () => {
    const next = results[Math.min(calls++, results.length - 1)];
    if (next instanceof Error) throw next;
    return next;
  }) as typeof fetch;
  return { fetchImpl, calls: () => calls };
}

test("retries network errors while the API wakes, then returns its answer", async () => {
  const api = scripted([new TypeError("Failed to fetch"), new TypeError("Failed to fetch"), ok()]);
  const response = await apiFetch("https://api.test/summary", undefined, { fetchImpl: api.fetchImpl, sleepImpl: noSleep });
  assert.equal(response.status, 200);
  assert.equal(api.calls(), 3);
});

test("retries 502/503/504 from the host but returns other errors as-is", async () => {
  const waking = scripted([ok(503), ok(502), ok(200)]);
  assert.equal((await apiFetch("u", undefined, { fetchImpl: waking.fetchImpl, sleepImpl: noSleep })).status, 200);
  const failing = scripted([ok(500)]);
  assert.equal((await apiFetch("u", undefined, { fetchImpl: failing.fetchImpl, sleepImpl: noSleep })).status, 500);
  assert.equal(failing.calls(), 1);
});

test("gives up after the timeout", async () => {
  const api = scripted([new TypeError("Failed to fetch")]);
  await assert.rejects(apiFetch("u", undefined, { timeoutMs: 0, fetchImpl: api.fetchImpl, sleepImpl: noSleep }), TypeError);
});

test("tells listeners while an API is waking", async () => {
  const seen: boolean[] = [];
  const stop = onBackendWaking((waking) => seen.push(waking));
  const api = scripted([new TypeError("Failed to fetch"), ok()]);
  await apiFetch("u", undefined, { fetchImpl: api.fetchImpl, sleepImpl: noSleep });
  stop();
  assert.deepEqual(seen, [true, false]);
});
