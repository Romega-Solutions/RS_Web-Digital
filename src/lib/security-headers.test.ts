import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  CHALLENGES_ORIGIN,
  CLARITY_ORIGINS,
  MAP_MARKER_ORIGIN,
  MAP_TILES_ORIGIN,
  VERCEL_SCRIPTS_ORIGIN,
  buildContentSecurityPolicy,
  buildSecurityHeaders,
} from "./security-headers.ts";

const directive = (csp: string, name: string) =>
  csp.split("; ").find((part) => part.startsWith(`${name} `))?.slice(name.length + 1).split(" ") ?? [];

test("the enforced headers are exactly the four safe ones", () => {
  const headers = Object.fromEntries(buildSecurityHeaders().map((h) => [h.key, h.value]));
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
  assert.equal(headers["X-Frame-Options"], "DENY");
  assert.equal(headers["Referrer-Policy"], "strict-origin-when-cross-origin");
  assert.match(headers["Permissions-Policy"], /camera=\(\)/);
  assert.match(headers["Permissions-Policy"], /microphone=\(\)/);
  assert.match(headers["Permissions-Policy"], /geolocation=\(\)/);
});

test("the content policy is report-only, never enforced, and there is no HSTS or report endpoint", () => {
  const keys = buildSecurityHeaders().map((h) => h.key);
  assert.ok(keys.includes("Content-Security-Policy-Report-Only"));
  assert.ok(!keys.includes("Content-Security-Policy"));
  assert.ok(!keys.includes("Strict-Transport-Security"));
  assert.ok(!keys.includes("Reporting-Endpoints"));
  assert.ok(!buildContentSecurityPolicy().includes("report-uri"));
  assert.ok(!buildContentSecurityPolicy().includes("report-to"));
});

test("Turnstile can load its script, frame and calls; nothing else third-party is allowed to script", () => {
  const csp = buildContentSecurityPolicy();
  assert.ok(directive(csp, "script-src").includes(CHALLENGES_ORIGIN));
  assert.deepEqual(directive(csp, "frame-src"), [CHALLENGES_ORIGIN]);
  assert.ok(directive(csp, "connect-src").includes(CHALLENGES_ORIGIN));
  assert.ok(directive(csp, "script-src").includes(VERCEL_SCRIPTS_ORIGIN));
  const external = directive(csp, "script-src").filter((v) => v.startsWith("http"));
  assert.deepEqual(
    external.sort(),
    [CHALLENGES_ORIGIN, VERCEL_SCRIPTS_ORIGIN, ...CLARITY_ORIGINS.script].sort(),
  );
});

test("the footer map's tiles and marker images are allowed, as images only", () => {
  const csp = buildContentSecurityPolicy();
  assert.ok(directive(csp, "img-src").includes(MAP_TILES_ORIGIN));
  assert.ok(directive(csp, "img-src").includes(MAP_MARKER_ORIGIN));
  assert.ok(!directive(csp, "script-src").includes(MAP_MARKER_ORIGIN));
  assert.ok(!directive(csp, "connect-src").includes(MAP_TILES_ORIGIN));
});

test("framing, plugins, base tags and form targets are locked down", () => {
  const csp = buildContentSecurityPolicy();
  assert.deepEqual(directive(csp, "frame-ancestors"), ["'none'"]);
  assert.deepEqual(directive(csp, "object-src"), ["'none'"]);
  assert.deepEqual(directive(csp, "base-uri"), ["'self'"]);
  assert.deepEqual(directive(csp, "form-action"), ["'self'"]);
  assert.deepEqual(directive(csp, "default-src"), ["'self'"]);
});

test("eval and websockets are allowed only for the development server", () => {
  assert.ok(!buildContentSecurityPolicy().includes("unsafe-eval"));
  assert.ok(!buildContentSecurityPolicy().includes("ws:"));
  assert.ok(buildContentSecurityPolicy({ development: true }).includes("'unsafe-eval'"));
});

test("next.config.ts hides the framework header and uses the builder, and leaves HSTS alone", () => {
  const config = readFileSync(new URL("../../next.config.ts", import.meta.url), "utf8");
  assert.match(config, /poweredByHeader:\s*false/);
  assert.match(config, /buildSecurityHeaders\(/);
  assert.ok(!/Strict-Transport-Security/i.test(config));
});

test("Microsoft Clarity can load its script and send its data, and gets no frame", () => {
  const csp = buildContentSecurityPolicy();
  for (const origin of ["https://www.clarity.ms", "https://*.clarity.ms"]) {
    assert.ok(directive(csp, "script-src").includes(origin), origin);
  }
  for (const origin of ["https://*.clarity.ms", "https://c.bing.com"]) {
    assert.ok(directive(csp, "connect-src").includes(origin), origin);
    assert.ok(directive(csp, "img-src").includes(origin), origin);
  }
  assert.ok(!directive(csp, "script-src").includes("https://c.bing.com"));
  assert.deepEqual(directive(csp, "frame-src"), [CHALLENGES_ORIGIN]);
});
