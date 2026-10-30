import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { handleApplyRequest } from "./apply-proxy.ts";
import { MAX_RESUME_BYTES, RESUME_NOT_PDF_MESSAGE } from "./apply-upload.ts";
import type { TurnstileEnv } from "./turnstile/verify.ts";

// Made-up values: the shape of a key, not a real one.
const SECRET = "fake-secret-for-tests-0000000000";
const SITE = "fake-site-key-for-tests";
const TOKEN = "XXXX.DUMMY.TOKEN.XXXX";
const CLOUDFLARE = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const PORTAL = "https://portal.example.test";

const BASE_ENV: TurnstileEnv = {
  PUBLIC_APPLICATIONS_TOKEN: "portal-token-for-tests",
  TICKETING_APP_URL: `${PORTAL}/`,
};
const ON_ENV: TurnstileEnv = {
  ...BASE_ENV,
  APPLY_TURNSTILE_MODE: "on",
  APPLY_TURNSTILE_SITE_KEY: SITE,
  APPLY_TURNSTILE_SECRET_KEY: SECRET,
};

type Call = { url: string; init?: RequestInit };

// One fake fetch that plays both Cloudflare and the portal, and records the calls.
function fakes(options: { cloudflare?: unknown; portalStatus?: number; portalBody?: unknown } = {}) {
  const calls: Call[] = [];
  const impl = (async (url: string | URL | Request, init?: RequestInit) => {
    const target = String(url);
    calls.push({ url: target, init });
    if (target === CLOUDFLARE) {
      const reply = options.cloudflare ?? {
        success: true,
        hostname: "www.romega-solutions.com",
        action: "apply",
        "error-codes": [],
      };
      return new Response(JSON.stringify(reply), { status: 200, headers: { "content-type": "application/json" } });
    }
    return new Response(JSON.stringify(options.portalBody ?? { ok: true, applicationCode: "APP-1" }), {
      status: options.portalStatus ?? 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;
  return {
    impl,
    calls,
    cloudflareCalls: () => calls.filter((call) => call.url === CLOUDFLARE),
    portalCalls: () => calls.filter((call) => call.url.startsWith(PORTAL)),
  };
}

// A resume body that starts like a real PDF, padded to the wanted size.
function pdfBytes(size: number) {
  const bytes = new Uint8Array(size);
  bytes.set(new TextEncoder().encode("%PDF-1.4").subarray(0, size));
  return bytes;
}

function applicationForm(extra: Record<string, string> = {}, resumeBytes = 12) {
  const form = new FormData();
  form.set("fullName", "Juan dela Cruz");
  form.set("email", "juan@example.com");
  form.set("phone", "+639175551234");
  form.set("resume", new File([pdfBytes(resumeBytes)], "cv.pdf", { type: "application/pdf" }));
  for (const [key, value] of Object.entries(extra)) form.set(key, value);
  return form;
}

function applyRequest(form: FormData, headers: Record<string, string> = {}) {
  return new Request("https://www.romega-solutions.com/api/apply/7", { method: "POST", headers, body: form });
}

async function run(env: TurnstileEnv, req: Request, fake = fakes(), positionId = "7") {
  const quiet = () => {};
  const response = await handleApplyRequest(req, positionId, {
    env,
    fetchImpl: fake.impl,
    verify: { log: quiet, attempts: 1 },
  });
  return { response, body: (await response.json()) as Record<string, unknown>, fake };
}

test("with the check off, nothing is sent to Cloudflare and the application is forwarded", async () => {
  const { response, fake } = await run(BASE_ENV, applyRequest(applicationForm()));
  assert.equal(response.status, 200);
  assert.equal(fake.cloudflareCalls().length, 0);
  assert.equal(fake.portalCalls().length, 1);
  assert.equal(fake.portalCalls()[0].url, `${PORTAL}/api/public/applications/7`);
});

test("with the check on, a request with no token is refused before its form is read", async () => {
  const form = applicationForm();
  const req = applyRequest(form);
  let formRead = false;
  const original = req.formData.bind(req);
  req.formData = () => {
    formRead = true;
    return original();
  };
  const { response, body, fake } = await run(ON_ENV, req);
  assert.equal(response.status, 400);
  assert.equal(body.code, "CAPTCHA_REQUIRED");
  assert.match(String(body.error), /hr@romega-solutions\.com/);
  assert.equal(formRead, false);
  assert.equal(fake.calls.length, 0);
});

test("a token that is too long is refused without calling Cloudflare", async () => {
  const { response, body, fake } = await run(
    ON_ENV,
    applyRequest(applicationForm(), { "x-turnstile-token": "a".repeat(2049) }),
  );
  assert.equal(response.status, 400);
  assert.equal(body.code, "CAPTCHA_FAILED");
  assert.equal(fake.calls.length, 0);
});

test("an oversize resume and a bad email are refused before Cloudflare is called", async () => {
  const headers = { "x-turnstile-token": TOKEN };
  const big = await run(ON_ENV, applyRequest(applicationForm({}, MAX_RESUME_BYTES + 1), headers));
  assert.equal(big.response.status, 413);
  assert.equal(big.body.code, "FILE_TOO_LARGE");
  assert.equal(big.fake.calls.length, 0);

  const badEmail = await run(ON_ENV, applyRequest(applicationForm({ email: "not-an-email" }), headers));
  assert.equal(badEmail.response.status, 400);
  assert.equal(badEmail.body.code, "INVALID_EMAIL");
  assert.equal(badEmail.fake.calls.length, 0);
});

test("a resume that is not a PDF is refused with 415, before Cloudflare, even with a .pdf name", async () => {
  const headers = { "x-turnstile-token": TOKEN };
  for (const content of ["GIF89a....", "<html><script>alert(1)</script></html>", "PK\u0003\u0004zip"]) {
    const form = applicationForm();
    form.set("resume", new File([content], "cv.pdf", { type: "application/pdf" }));
    const { response, body, fake } = await run(ON_ENV, applyRequest(form, headers));
    assert.equal(response.status, 415, content);
    assert.equal(body.code, "UNSUPPORTED_FILE_TYPE");
    assert.equal(body.error, RESUME_NOT_PDF_MESSAGE);
    assert.equal(fake.calls.length, 0);
  }
});

test("an empty file part is left for the portal to report as missing, not called a bad PDF", async () => {
  const form = applicationForm();
  form.set("resume", new File([], ""));
  const { response, fake } = await run(BASE_ENV, applyRequest(form));
  assert.equal(response.status, 200);
  assert.equal(fake.portalCalls().length, 1);
});

test("an over-long field is refused before Cloudflare, and nothing is cut silently", async () => {
  const { response, body, fake } = await run(
    ON_ENV,
    applyRequest(applicationForm({ fullName: "a".repeat(201) }), { "x-turnstile-token": TOKEN }),
  );
  assert.equal(response.status, 400);
  assert.equal(body.code, "FIELD_TOO_LONG");
  assert.equal(fake.calls.length, 0);
});

test("extra files are dropped, extra text fields are passed on", async () => {
  const form = applicationForm({ expectedSalary: "100k" });
  form.set("avatar", new File(["x"], "me.png", { type: "image/png" }));
  const fake = fakes();
  const { response } = await run(BASE_ENV, applyRequest(form), fake);
  assert.equal(response.status, 200);
  const forwarded = fake.portalCalls()[0].init?.body as FormData;
  assert.equal(forwarded.get("avatar"), null);
  assert.equal(forwarded.get("expectedSalary"), "100k");
  assert.ok(forwarded.get("resume") instanceof File);
});

test("a good token costs one Cloudflare call, then the application is forwarded without it", async () => {
  const fake = fakes();
  const { response, body } = await run(
    ON_ENV,
    applyRequest(applicationForm({ "cf-turnstile-response": "stray-field" }), { "x-turnstile-token": TOKEN, "x-real-ip": "203.0.113.9" }),
    fake,
  );
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(fake.cloudflareCalls().length, 1);
  const sent = new URLSearchParams(String(fake.cloudflareCalls()[0].init?.body));
  assert.equal(sent.get("response"), TOKEN);
  assert.equal(sent.get("remoteip"), "203.0.113.9");
  // Cloudflare is asked before the portal.
  assert.equal(fake.calls[0].url, CLOUDFLARE);

  const forwarded = fake.portalCalls()[0];
  const forwardedForm = forwarded.init?.body as FormData;
  assert.equal(forwardedForm.get("cf-turnstile-response"), null);
  assert.equal(forwardedForm.get("email"), "juan@example.com");
  const sentHeaders = forwarded.init?.headers as Record<string, string>;
  assert.equal(sentHeaders.Authorization, "Bearer portal-token-for-tests");
  assert.equal(Object.keys(sentHeaders).some((name) => name.toLowerCase() === "x-turnstile-token"), false);
});

test("a token Cloudflare rejects stops the application; the portal is never called", async () => {
  const { response, body, fake } = await run(
    ON_ENV,
    applyRequest(applicationForm(), { "x-turnstile-token": TOKEN }),
    fakes({ cloudflare: { success: false, "error-codes": ["timeout-or-duplicate"] } }),
  );
  assert.equal(response.status, 400);
  assert.equal(body.code, "CAPTCHA_FAILED");
  assert.equal(fake.portalCalls().length, 0);
});

test("a bad secret answers 503 not configured; Cloudflare being down answers 503 unavailable", async () => {
  const notConfigured = await run(
    ON_ENV,
    applyRequest(applicationForm(), { "x-turnstile-token": TOKEN }),
    fakes({ cloudflare: { success: false, "error-codes": ["invalid-input-secret"] } }),
  );
  assert.equal(notConfigured.response.status, 503);
  assert.equal(notConfigured.body.code, "CAPTCHA_NOT_CONFIGURED");

  const down = fakes();
  const failing = (async (url: string | URL | Request, init?: RequestInit) => {
    if (String(url) === CLOUDFLARE) throw new Error("network down");
    return down.impl(url, init);
  }) as typeof fetch;
  const unavailable = await run(ON_ENV, applyRequest(applicationForm(), { "x-turnstile-token": TOKEN }), {
    ...down,
    impl: failing,
  });
  assert.equal(unavailable.response.status, 503);
  assert.equal(unavailable.body.code, "CAPTCHA_UNAVAILABLE");
});

test("the check on with no secret answers 503 not configured, and reply text never holds the secret or token", async () => {
  const env = { ...ON_ENV, APPLY_TURNSTILE_SECRET_KEY: "" };
  const { response, body } = await run(env, applyRequest(applicationForm(), { "x-turnstile-token": TOKEN }));
  assert.equal(response.status, 503);
  assert.equal(body.code, "CAPTCHA_NOT_CONFIGURED");
  const text = JSON.stringify(body);
  assert.equal(text.includes(SECRET), false);
  assert.equal(text.includes(TOKEN), false);
});

test("the portal settings and the position id are still checked first", async () => {
  const noPortal = await run({ ...ON_ENV, PUBLIC_APPLICATIONS_TOKEN: "" }, applyRequest(applicationForm()));
  assert.equal(noPortal.response.status, 503);
  assert.equal(noPortal.body.code, "NOT_CONFIGURED");
  const badId = await run(ON_ENV, applyRequest(applicationForm()), fakes(), "abc");
  assert.equal(badId.response.status, 400);
  assert.equal(badId.body.code, "INVALID_POSITION");
});

test("an unusable portal reply becomes a 502 and the Cloudflare check still ran once", async () => {
  const fake = fakes();
  const html = (async (url: string | URL | Request, init?: RequestInit) => {
    if (String(url) === CLOUDFLARE) return fake.impl(url, init);
    return new Response("<html>bad gateway</html>", { status: 502, headers: { "content-type": "text/html" } });
  }) as typeof fetch;
  const quiet = console.error;
  console.error = () => {};
  try {
    const { response, body } = await run(ON_ENV, applyRequest(applicationForm(), { "x-turnstile-token": TOKEN }), {
      ...fake,
      impl: html,
    });
    assert.equal(response.status, 502);
    assert.equal(body.code, "UPSTREAM_ERROR");
  } finally {
    console.error = quiet;
  }
});

test("the Apply page reads its settings on each request, not at build time", () => {
  const page = readFileSync(new URL("../app/apply/[positionId]/page.tsx", import.meta.url), "utf8");
  assert.match(page, /await headers\(\)/);
  assert.match(page, /turnstileSiteKeyForPage\("apply"\)/);
});

test("the route hands the request to the tested handler", () => {
  const route = readFileSync(new URL("../app/api/apply/[positionId]/route.ts", import.meta.url), "utf8");
  assert.match(route, /handleApplyRequest\(req, positionId/);
});

test("the privacy policy names Cloudflare Turnstile and its addendum", () => {
  const policy = readFileSync(
    new URL("../components/organisms/shared/PrivacyPolicyContent.tsx", import.meta.url),
    "utf8",
  );
  assert.match(policy, /Cloudflare, Inc\. \(Turnstile\)/);
  assert.match(policy, /cloudflare\.com\/turnstile-privacy-policy/);
});

test("a portal 409 ALREADY_APPLIED becomes the fixed already-applied reply, after the Cloudflare check", async () => {
  const fake = fakes({
    portalStatus: 409,
    portalBody: { ok: false, code: "ALREADY_APPLIED", error: "x", applicationCode: "APP-9", status: "offered", name: "Juan" },
  });
  const { response, body } = await run(ON_ENV, applyRequest(applicationForm(), { "x-turnstile-token": TOKEN }), fake);
  assert.equal(response.status, 409);
  assert.deepEqual(body, {
    ok: false,
    code: "ALREADY_APPLIED",
    error: "You've already applied for this role — we'll be in touch.",
  });
  assert.equal(fake.cloudflareCalls().length, 1);
  assert.equal(fake.portalCalls().length, 1);
});

test("another 409 from the portal is still passed through as before", async () => {
  const fake = fakes({ portalStatus: 409, portalBody: { ok: false, code: "OTHER", error: "Conflict." } });
  const { response, body } = await run(BASE_ENV, applyRequest(applicationForm()), fake);
  assert.equal(response.status, 409);
  assert.deepEqual(body, { ok: false, code: "OTHER", error: "Conflict." });
});
