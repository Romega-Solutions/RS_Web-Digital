import assert from "node:assert/strict";
import test from "node:test";
import { createBudget, createRateLimiter, readJsonWithLimit } from "./chat-guards.ts";

function post(body: BodyInit | null, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/chat", { method: "POST", body, headers, duplex: "half" } as RequestInit);
}

function chunked(parts: string[], headers: Record<string, string> = {}) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const part of parts) controller.enqueue(encoder.encode(part));
      controller.close();
    },
  });
  return post(stream, headers);
}

test("a small JSON body is read", async () => {
  assert.deepEqual(await readJsonWithLimit(post('{"message":"hi"}'), 8192), { ok: true, value: { message: "hi" } });
});

test("a body over the limit is 413, even with no Content-Length (chunked)", async () => {
  const result = await readJsonWithLimit(chunked(['{"message":"', "a".repeat(5000), "b".repeat(5000), '"}']), 8192);
  assert.deepEqual(result, { ok: false, status: 413 });
});

test("a Content-Length that understates the body does not get it through", async () => {
  const request = chunked(['{"message":"', "a".repeat(9000), '"}'], { "content-length": "20" });
  assert.deepEqual(await readJsonWithLimit(request, 8192), { ok: false, status: 413 });
});

test("a Content-Length over the limit is refused before reading", async () => {
  assert.deepEqual(await readJsonWithLimit(post("{}", { "content-length": "99999" }), 8192), { ok: false, status: 413 });
});

test("exactly at the limit is allowed, one byte over is not", async () => {
  const pad = (n: number) => JSON.stringify({ m: "a".repeat(n) });
  const base = pad(0).length;
  assert.equal((await readJsonWithLimit(post(pad(100 - base)), 100)).ok, true);
  assert.equal((await readJsonWithLimit(post(pad(101 - base)), 100)).ok, false);
});

test("bad JSON, invalid UTF-8 and no body are 400", async () => {
  assert.deepEqual(await readJsonWithLimit(post("{nope"), 8192), { ok: false, status: 400 });
  assert.deepEqual(await readJsonWithLimit(post(new Uint8Array([0x7b, 0xff, 0xfe, 0x7d])), 8192), { ok: false, status: 400 });
  assert.deepEqual(await readJsonWithLimit(new Request("http://localhost/api/chat", { method: "POST" }), 8192), { ok: false, status: 400 });
});

test("rate limiter: the 11th request in a minute from one address is refused, others are not", () => {
  let t = 0;
  const limiter = createRateLimiter(60_000, 10, () => t);
  for (let i = 0; i < 10; i++) assert.equal(limiter.allow("a"), true);
  assert.equal(limiter.allow("a"), false);
  assert.equal(limiter.allow("b"), true);
  t = 60_001;
  assert.equal(limiter.allow("a"), true);
});

test("rate limiter sweeps finished windows", () => {
  let t = 0;
  const limiter = createRateLimiter(1000, 1, () => t, 5);
  for (let i = 0; i < 4; i++) limiter.allow(`k${i}`);
  t = 5000;
  limiter.allow("fresh");
  assert.equal(limiter.size(), 1);
});

test("budget: allows its share, then refuses until the window is over", () => {
  let t = 1000;
  const budget = createBudget(3_600_000, 300, () => t);
  for (let i = 0; i < 300; i++) assert.equal(budget.take(), true, `call ${i}`);
  assert.equal(budget.take(), false);
  t += 3_599_000;
  assert.equal(budget.take(), false);
  t += 2000;
  assert.equal(budget.take(), true);
});
