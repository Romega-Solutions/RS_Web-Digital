import assert from "node:assert/strict";
import { register } from "node:module";
import test from "node:test";
import { CHAT_MAX_BODY_BYTES, CHAT_MODEL_BUDGET_PER_WINDOW, CHAT_RATE_MAX_PER_WINDOW } from "./chat-guards.ts";

// Node's own module loader wants a file extension for "next/server"; the bundler
// does not. This lets the route be loaded here exactly as it is written.
register(
  "data:text/javascript," +
    encodeURIComponent(
      `export async function resolve(specifier, context, next) {
         return next(specifier === "next/server" ? "next/server.js" : specifier, context);
       }`,
    ),
);

// The route runs for real; only the model service (Groq) is faked, so nothing
// leaves this machine and no key is needed.
process.env.NEXT_PUBLIC_SITE_URL = "https://www.romega-solutions.com";
const realFetch = globalThis.fetch;
let modelCalls = 0;
globalThis.fetch = (async (url: string | URL | Request) => {
  if (String(url).startsWith("https://api.groq.com/")) {
    modelCalls += 1;
    return new Response(JSON.stringify({ choices: [{ message: { content: "model reply" } }] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }
  return realFetch(url);
}) as typeof fetch;

const { POST } = await import("../app/api/chat/route.ts");
const { NextRequest } = await import("next/server");

let ipCounter = 0;
function chatRequest(body: BodyInit, { ip = `203.0.113.${++ipCounter}`, headers = {} as Record<string, string> } = {}) {
  return new NextRequest("https://www.romega-solutions.com/api/chat", {
    method: "POST",
    body,
    headers: {
      "content-type": "application/json",
      origin: "https://www.romega-solutions.com",
      "x-real-ip": ip,
      ...headers,
    },
    duplex: "half",
  } as ConstructorParameters<typeof NextRequest>[1]);
}
const message = (text: string) => JSON.stringify({ message: text });

test("without a model key the built-in reply is used and the model is never called", async () => {
  delete process.env.GROQ_API_KEY;
  const res = await POST(chatRequest(message("hello")));
  assert.equal(res.status, 200);
  assert.match((await res.json()).reply.text, /Welcome to Romega/);
  assert.equal(modelCalls, 0);
});

test("a body over 8 KB is 413, with or without a Content-Length", async () => {
  const big = message("a".repeat(CHAT_MAX_BODY_BYTES + 10));
  assert.equal((await POST(chatRequest(big))).status, 413);
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(c) {
      c.enqueue(encoder.encode(big.slice(0, 5000)));
      c.enqueue(encoder.encode(big.slice(5000)));
      c.close();
    },
  });
  assert.equal((await POST(chatRequest(stream))).status, 413);
});

test("the 11th request in a minute from one address is 429 with Retry-After; another address is fine", async () => {
  const ip = "198.51.100.77";
  for (let i = 0; i < CHAT_RATE_MAX_PER_WINDOW; i++) {
    assert.equal((await POST(chatRequest(message("hello"), { ip }))).status, 200, `request ${i + 1}`);
  }
  const limited = await POST(chatRequest(message("hello"), { ip }));
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get("retry-after"), "60");
  assert.equal((await POST(chatRequest(message("hello"), { ip: "198.51.100.78" }))).status, 200);
});

test("bad JSON is 400 and a wrong origin is 403", async () => {
  assert.equal((await POST(chatRequest("{nope"))).status, 400);
  assert.equal((await POST(chatRequest(message("hi"), { headers: { origin: "https://evil.example" } }))).status, 403);
});

test("after the hourly model budget the built-in replies are used and the model is not called", async () => {
  process.env.GROQ_API_KEY = "fake-key-for-tests";
  modelCalls = 0;
  let last: { reply: { text: string } } | null = null;
  for (let i = 0; i < CHAT_MODEL_BUDGET_PER_WINDOW; i++) {
    const res = await POST(chatRequest(message("what do you do")));
    assert.equal(res.status, 200);
    last = await res.json();
  }
  assert.equal(modelCalls, CHAT_MODEL_BUDGET_PER_WINDOW);
  assert.equal(last?.reply.text, "model reply");

  const over = await POST(chatRequest(message("what do you do")));
  assert.equal(over.status, 200);
  const body = await over.json();
  assert.notEqual(body.reply.text, "model reply");
  assert.match(body.reply.text, /three pillars/);
  assert.equal(modelCalls, CHAT_MODEL_BUDGET_PER_WINDOW);
  delete process.env.GROQ_API_KEY;
});
