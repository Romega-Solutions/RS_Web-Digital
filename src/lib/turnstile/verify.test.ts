import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  TURNSTILE_SITEVERIFY_URL,
  TURNSTILE_TEST_SECRET_KEYS,
  TURNSTILE_TEST_SITE_KEYS,
  closeTurnstileGate,
  configProblem,
  openTurnstileGate,
  parseAllowedHosts,
  readTurnstileConfig,
  readTurnstileToken,
  turnstileSiteKeyForPage,
  verifyTurnstileToken,
  type TurnstileEnv,
} from "./verify.ts";

// Made-up values: the shape of a key, not a real one.
const SECRET = "fake-secret-for-tests-0000000000";
const SITE = "fake-site-key-for-tests";
const PROD: TurnstileEnv = { VERCEL_ENV: "production" };

function onEnv(extra: TurnstileEnv = {}): TurnstileEnv {
  return {
    CONTACT_TURNSTILE_MODE: "on",
    CONTACT_TURNSTILE_SITE_KEY: SITE,
    CONTACT_TURNSTILE_SECRET_KEY: SECRET,
    ...extra,
  };
}

function headers(values: Record<string, string>) {
  const lower = Object.fromEntries(Object.entries(values).map(([k, v]) => [k.toLowerCase(), v]));
  return { get: (name: string) => lower[name.toLowerCase()] ?? null };
}

type Call = { url: string; body: URLSearchParams };

// A fetch that answers from a script and records what it was sent.
function fakeFetch(replies: Array<unknown | Error>) {
  const calls: Call[] = [];
  const impl = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), body: new URLSearchParams(String(init?.body)) });
    const next = replies[Math.min(calls.length - 1, replies.length - 1)];
    if (next instanceof Error) throw next;
    if (typeof next === "function") return (next as () => Response)();
    return new Response(JSON.stringify(next), { status: 200, headers: { "content-type": "application/json" } });
  }) as typeof fetch;
  return { impl, calls };
}

const quiet = () => {};
const good = { success: true, hostname: "www.romega-solutions.com", action: "contact", "error-codes": [] };

async function verify(env: TurnstileEnv, replies: Array<unknown | Error>, token = "tok", ip = "") {
  const config = readTurnstileConfig("contact", env);
  const fake = fakeFetch(replies);
  const failure = await verifyTurnstileToken(config, token, ip, {
    fetchImpl: fake.impl,
    env,
    log: quiet,
    timeoutMs: 50,
    idempotencyKey: "idem-1",
  });
  return { failure, calls: fake.calls };
}

test("the mode is off unless it is exactly on; on is not case or space sensitive", () => {
  assert.equal(readTurnstileConfig("contact", {}).enabled, false);
  assert.equal(readTurnstileConfig("contact", { CONTACT_TURNSTILE_MODE: "off" }).enabled, false);
  assert.equal(readTurnstileConfig("contact", { CONTACT_TURNSTILE_MODE: "true" }).enabled, false);
  assert.equal(readTurnstileConfig("contact", { CONTACT_TURNSTILE_MODE: " ON " }).enabled, true);
});

test("each form reads only its own variables", () => {
  const env = { APPLY_TURNSTILE_MODE: "on", APPLY_TURNSTILE_SITE_KEY: "a", APPLY_TURNSTILE_SECRET_KEY: "b" };
  assert.equal(readTurnstileConfig("contact", env).enabled, false);
  assert.equal(readTurnstileConfig("apply", env).enabled, true);
  assert.equal(readTurnstileConfig("apply", env).action, "apply");
});

test("the page gets a site key only when the form's check is on", () => {
  assert.equal(turnstileSiteKeyForPage("contact", { CONTACT_TURNSTILE_SITE_KEY: SITE }), "");
  assert.equal(turnstileSiteKeyForPage("contact", onEnv()), SITE);
});

test("allowed hosts: default, a custom list, and unusable lists", () => {
  assert.deepEqual(parseAllowedHosts(undefined), { hosts: ["romega-solutions.com", "www.romega-solutions.com"], invalid: false });
  assert.deepEqual(parseAllowedHosts(" "), { hosts: ["romega-solutions.com", "www.romega-solutions.com"], invalid: false });
  assert.deepEqual(parseAllowedHosts("Example.com, www.example.com"), { hosts: ["example.com", "www.example.com"], invalid: false });
  assert.equal(parseAllowedHosts(",").invalid, true);
  assert.equal(parseAllowedHosts("https://example.com").invalid, true);
});

test("setup mistakes close the form instead of letting everyone through", () => {
  const base = readTurnstileConfig("contact", onEnv());
  assert.equal(configProblem(base, PROD), null);
  assert.equal(configProblem({ ...base, secretKey: "" }, PROD)?.code, "CAPTCHA_NOT_CONFIGURED");
  assert.equal(configProblem({ ...base, siteKey: "" }, PROD)?.code, "CAPTCHA_NOT_CONFIGURED");
  assert.equal(configProblem({ ...base, allowedHostsInvalid: true }, PROD)?.code, "CAPTCHA_NOT_CONFIGURED");
  assert.equal(configProblem({ ...base, enabled: false, secretKey: "" }, PROD), null);
});

test("public test keys are refused in Production but fine elsewhere", () => {
  const passing = readTurnstileConfig("contact", onEnv({
    CONTACT_TURNSTILE_SITE_KEY: TURNSTILE_TEST_SITE_KEYS[0],
    CONTACT_TURNSTILE_SECRET_KEY: TURNSTILE_TEST_SECRET_KEYS[0],
  }));
  assert.equal(configProblem(passing, PROD)?.code, "CAPTCHA_NOT_CONFIGURED");
  assert.equal(configProblem(passing, { VERCEL_ENV: "preview" }), null);
  const testSecretOnly = readTurnstileConfig("contact", onEnv({ CONTACT_TURNSTILE_SECRET_KEY: TURNSTILE_TEST_SECRET_KEYS[1] }));
  assert.equal(configProblem(testSecretOnly, PROD)?.code, "CAPTCHA_NOT_CONFIGURED");
  const testSiteOnly = readTurnstileConfig("contact", onEnv({ CONTACT_TURNSTILE_SITE_KEY: TURNSTILE_TEST_SITE_KEYS[2] }));
  assert.equal(configProblem(testSiteOnly, PROD)?.code, "CAPTCHA_NOT_CONFIGURED");
});

test("the token header: missing and blank are required, too long is failed", () => {
  assert.deepEqual(readTurnstileToken(headers({})), { ok: false, failure: { code: "CAPTCHA_REQUIRED" } });
  assert.deepEqual(readTurnstileToken(headers({ "x-turnstile-token": "   " })), { ok: false, failure: { code: "CAPTCHA_REQUIRED" } });
  assert.deepEqual(readTurnstileToken(headers({ "x-turnstile-token": "a".repeat(2049) })), { ok: false, failure: { code: "CAPTCHA_FAILED" } });
  assert.deepEqual(readTurnstileToken(headers({ "X-Turnstile-Token": ` ${"a".repeat(2048)} ` })), { ok: true, token: "a".repeat(2048) });
});

test("off mode: no token asked for, no call to Cloudflare", async () => {
  const gate = openTurnstileGate("contact", headers({}), { CONTACT_TURNSTILE_MODE: "off" });
  assert.deepEqual(gate, { state: "off" });
});

test("on mode without a token fails before any network call", () => {
  const gate = openTurnstileGate("contact", headers({}), onEnv(PROD));
  assert.deepEqual(gate, { state: "fail", failure: { code: "CAPTCHA_REQUIRED" } });
});

test("on mode with a setup mistake fails even when a token is sent", () => {
  const gate = openTurnstileGate("contact", headers({ "x-turnstile-token": "tok" }), onEnv({ ...PROD, CONTACT_TURNSTILE_SECRET_KEY: "" }));
  assert.deepEqual(gate, { state: "fail", failure: { code: "CAPTCHA_NOT_CONFIGURED" } });
});

test("a good token passes and the request carries the expected fields", async () => {
  const { failure, calls } = await verify({ ...onEnv(), ...PROD }, [good], "tok-1", "203.0.113.9");
  assert.equal(failure, null);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, TURNSTILE_SITEVERIFY_URL);
  assert.equal(calls[0].body.get("secret"), SECRET);
  assert.equal(calls[0].body.get("response"), "tok-1");
  assert.equal(calls[0].body.get("remoteip"), "203.0.113.9");
  assert.equal(calls[0].body.get("idempotency_key"), "idem-1");
});

test("remoteip is left out when there is no client address", async () => {
  const { calls } = await verify({ ...onEnv(), ...PROD }, [good]);
  assert.equal(calls[0].body.has("remoteip"), false);
});

test("hostname and action are enforced in Production", async () => {
  const env = { ...onEnv(), ...PROD };
  assert.equal((await verify(env, [{ ...good, hostname: "evil.example" }])).failure?.code, "CAPTCHA_FAILED");
  assert.equal((await verify(env, [{ ...good, hostname: "" }])).failure?.code, "CAPTCHA_FAILED");
  assert.equal((await verify(env, [{ ...good, action: "apply" }])).failure?.code, "CAPTCHA_FAILED");
  assert.equal((await verify(env, [{ ...good, action: undefined }])).failure?.code, "CAPTCHA_FAILED");
  assert.equal((await verify(env, [{ ...good, hostname: "ROMEGA-solutions.com" }])).failure, null);
});

test("hostname and action are also enforced with real keys on a Preview", async () => {
  const env = { ...onEnv(), VERCEL_ENV: "preview" };
  assert.equal((await verify(env, [{ ...good, hostname: "evil.example" }])).failure?.code, "CAPTCHA_FAILED");
});

test("a public test secret on a non-Production deploy skips only hostname and action", async () => {
  const testEnv = (extra: TurnstileEnv) =>
    onEnv({ CONTACT_TURNSTILE_SITE_KEY: TURNSTILE_TEST_SITE_KEYS[0], CONTACT_TURNSTILE_SECRET_KEY: TURNSTILE_TEST_SECRET_KEYS[0], ...extra });
  const dummy = { success: true, hostname: "localhost", action: "", "error-codes": [] };
  assert.equal((await verify(testEnv({ VERCEL_ENV: "preview" }), [dummy])).failure, null);
  assert.equal((await verify(testEnv({ VERCEL_ENV: "development" }), [dummy])).failure, null);
  assert.equal((await verify(testEnv({ NODE_ENV: "development" }), [dummy])).failure, null);
  // Checks stay on when it is unclear where this is running.
  assert.equal((await verify(testEnv({}), [dummy])).failure?.code, "CAPTCHA_FAILED");
  assert.equal((await verify(testEnv({ NODE_ENV: "production" }), [dummy])).failure?.code, "CAPTCHA_FAILED");
  // A failed check is still a failed check.
  assert.equal((await verify(testEnv({ VERCEL_ENV: "preview" }), [{ success: false, "error-codes": ["invalid-input-response"] }])).failure?.code, "CAPTCHA_FAILED");
});

test("error codes map to the right failure", async () => {
  const env = { ...onEnv(), ...PROD };
  const fail = (code: string) => ({ success: false, "error-codes": [code] });
  assert.equal((await verify(env, [fail("invalid-input-response")])).failure?.code, "CAPTCHA_FAILED");
  assert.equal((await verify(env, [fail("timeout-or-duplicate")])).failure?.code, "CAPTCHA_FAILED");
  assert.equal((await verify(env, [fail("missing-input-response")])).failure?.code, "CAPTCHA_FAILED");
  assert.equal((await verify(env, [fail("bad-request")])).failure?.code, "CAPTCHA_FAILED");
  assert.equal((await verify(env, [fail("invalid-input-secret")])).failure?.code, "CAPTCHA_NOT_CONFIGURED");
  assert.equal((await verify(env, [fail("missing-input-secret")])).failure?.code, "CAPTCHA_NOT_CONFIGURED");
  assert.equal((await verify(env, [{ success: false }])).failure?.code, "CAPTCHA_FAILED");
});

test("a Cloudflare outage is retried once with the same key, then reported as unavailable", async () => {
  const env = { ...onEnv(), ...PROD };
  const outage = await verify(env, [new Error("offline")]);
  assert.equal(outage.failure?.code, "CAPTCHA_UNAVAILABLE");
  assert.equal(outage.calls.length, 2);
  assert.equal(outage.calls[0].body.get("idempotency_key"), outage.calls[1].body.get("idempotency_key"));

  const serverError = await verify(env, [() => new Response("bad gateway", { status: 502 })]);
  assert.equal(serverError.failure?.code, "CAPTCHA_UNAVAILABLE");
  assert.equal(serverError.calls.length, 2);

  const notJson = await verify(env, [() => new Response("<html>", { status: 200 })]);
  assert.equal(notJson.failure?.code, "CAPTCHA_UNAVAILABLE");

  const internal = await verify(env, [{ success: false, "error-codes": ["internal-error"] }]);
  assert.equal(internal.failure?.code, "CAPTCHA_UNAVAILABLE");
  assert.equal(internal.calls.length, 2);
});

test("a retry that works after one hiccup passes", async () => {
  const env = { ...onEnv(), ...PROD };
  const result = await verify(env, [new Error("reset"), good]);
  assert.equal(result.failure, null);
  assert.equal(result.calls.length, 2);
});

test("a call that hangs is cut off and counted as unavailable", async () => {
  const env = { ...onEnv(), ...PROD };
  const config = readTurnstileConfig("contact", env);
  let calls = 0;
  const hanging = ((_url: unknown, init?: RequestInit) => {
    calls += 1;
    return new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => {
        const error = new Error("aborted");
        error.name = "AbortError";
        reject(error);
      });
    });
  }) as typeof fetch;
  const failure = await verifyTurnstileToken(config, "tok", "", { fetchImpl: hanging, env, log: quiet, timeoutMs: 20 });
  assert.equal(failure?.code, "CAPTCHA_UNAVAILABLE");
  assert.equal(calls, 2);
});

test("the log never contains the token or the secret", async () => {
  const env = { ...onEnv(), ...PROD };
  const config = readTurnstileConfig("contact", env);
  const lines: string[] = [];
  const log = (event: string, detail: Record<string, unknown>) => lines.push(JSON.stringify({ event, detail }));
  const run = (reply: unknown) =>
    verifyTurnstileToken(config, "SECRET-TOKEN-VALUE", "", { fetchImpl: fakeFetch([reply]).impl, env, log, timeoutMs: 50 });
  await run({ success: false, "error-codes": ["invalid-input-secret"] });
  await run({ success: false, "error-codes": ["bad-request"] });
  await run({ ...good, hostname: "evil.example" });
  await run(new Error("offline"));
  assert.ok(lines.length >= 4);
  for (const line of lines) {
    assert.ok(!line.includes("SECRET-TOKEN-VALUE"));
    assert.ok(!line.includes(SECRET));
  }
});

test("the gate: token present, then one call to Cloudflare, uses the client address", async () => {
  const env = { ...onEnv(), ...PROD };
  const req = headers({ "x-turnstile-token": "tok-9", "x-forwarded-for": "198.51.100.4, 10.0.0.1" });
  const gate = openTurnstileGate("contact", req, env);
  assert.equal(gate.state, "ready");
  if (gate.state !== "ready") return;
  const fake = fakeFetch([good]);
  const failure = await closeTurnstileGate(gate, req, { fetchImpl: fake.impl, env, log: quiet });
  assert.equal(failure, null);
  assert.equal(fake.calls.length, 1);
  assert.equal(fake.calls[0].body.get("remoteip"), "198.51.100.4");
});

test("the check script keeps the same list of public test keys as the code", () => {
  const script = readFileSync(new URL("../../../scripts/check-production-env.mjs", import.meta.url), "utf8");
  for (const key of [...TURNSTILE_TEST_SITE_KEYS, ...TURNSTILE_TEST_SECRET_KEYS]) {
    assert.ok(script.includes(`"${key}"`), `${key} missing from check-production-env.mjs`);
  }
});

test("the Contact page reads its settings on each request, not at build time", () => {
  const page = readFileSync(new URL("../../app/contact/page.tsx", import.meta.url), "utf8");
  assert.match(page, /await connection\(\)/);
});
