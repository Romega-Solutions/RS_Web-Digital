// Server side of the Cloudflare Turnstile check, shared by the Contact and
// Apply routes. It is plain fetch against the documented Siteverify endpoint:
// no package, no cookie, and nothing here is imported by client code.
//
// Each form has its own switch (<PREFIX>_TURNSTILE_MODE) and its own keys, so
// one form can be turned on or off without touching the other. The mode ships
// "off": with it off, no token is asked for and nothing calls Cloudflare.

import { TURNSTILE_ACTIONS, TURNSTILE_TOKEN_HEADER, type TurnstileForm } from "./shared.ts";

export { TURNSTILE_ACTIONS, TURNSTILE_TOKEN_HEADER, type TurnstileForm };

export const TURNSTILE_SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
// Cloudflare documents tokens as at most 2048 characters.
export const TURNSTILE_TOKEN_MAX_LENGTH = 2048;
export const TURNSTILE_VERIFY_TIMEOUT_MS = 4000;
export const TURNSTILE_VERIFY_ATTEMPTS = 2;

const ENV_PREFIX: Record<TurnstileForm, string> = {
  contact: "CONTACT",
  apply: "APPLY",
};

// Hostnames a real token may come from. A token from a widget on any other
// hostname is rejected. Override with <PREFIX>_TURNSTILE_ALLOWED_HOSTS
// (comma separated) when the site is served from another domain.
export const DEFAULT_ALLOWED_HOSTS = ["romega-solutions.com", "www.romega-solutions.com"];

// Cloudflare's published test keys. They always give the same answer, so they
// are for tests and local runs only and are never accepted in Production.
export const TURNSTILE_TEST_SITE_KEYS = [
  "1x00000000000000000000AA", // always passes
  "2x00000000000000000000AB", // always blocks
  "3x00000000000000000000FF", // forces an interactive challenge
];
export const TURNSTILE_TEST_SECRET_KEYS = [
  "1x0000000000000000000000000000000AA", // always passes
  "2x0000000000000000000000000000000AA", // always fails
  "3x0000000000000000000000000000000AA", // yields "token already spent"
];

export type TurnstileEnv = Record<string, string | undefined>;

export type TurnstileConfig = {
  form: TurnstileForm;
  action: string;
  enabled: boolean;
  siteKey: string;
  secretKey: string;
  allowedHosts: string[];
  // True when the host list is set but unusable. The check then fails closed.
  allowedHostsInvalid: boolean;
};

const HOST_PATTERN = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/;

export function parseAllowedHosts(raw: string | undefined): { hosts: string[]; invalid: boolean } {
  if (raw === undefined || raw.trim() === "") return { hosts: DEFAULT_ALLOWED_HOSTS, invalid: false };
  const hosts = raw
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
  const invalid = hosts.length === 0 || hosts.some((host) => !HOST_PATTERN.test(host));
  return { hosts: invalid ? [] : hosts, invalid };
}

export function readTurnstileConfig(form: TurnstileForm, env: TurnstileEnv = process.env): TurnstileConfig {
  const prefix = ENV_PREFIX[form];
  const hosts = parseAllowedHosts(env[`${prefix}_TURNSTILE_ALLOWED_HOSTS`]);
  return {
    form,
    action: TURNSTILE_ACTIONS[form],
    enabled: (env[`${prefix}_TURNSTILE_MODE`] ?? "").trim().toLowerCase() === "on",
    siteKey: (env[`${prefix}_TURNSTILE_SITE_KEY`] ?? "").trim(),
    secretKey: (env[`${prefix}_TURNSTILE_SECRET_KEY`] ?? "").trim(),
    allowedHosts: hosts.hosts,
    allowedHostsInvalid: hosts.invalid,
  };
}

// The widget is shown only when the form's check is on AND it has a site key.
// A page uses this to decide whether to load the Cloudflare script at all.
export function turnstileSiteKeyForPage(form: TurnstileForm, env: TurnstileEnv = process.env): string {
  const config = readTurnstileConfig(form, env);
  return config.enabled ? config.siteKey : "";
}

export function isProductionDeploy(env: TurnstileEnv): boolean {
  return env.VERCEL_ENV === "production";
}

// Hostname and action are always checked, except when a public test secret is
// used on a deployment that is clearly not Production (a Preview, or a local
// run). If VERCEL_ENV is missing the checks stay on, which is the safe way.
export function isRelaxedTestRun(config: TurnstileConfig, env: TurnstileEnv): boolean {
  if (!TURNSTILE_TEST_SECRET_KEYS.includes(config.secretKey)) return false;
  if (env.VERCEL_ENV === "preview" || env.VERCEL_ENV === "development") return true;
  return env.VERCEL_ENV === undefined && env.NODE_ENV === "development";
}

export type TurnstileFailureCode =
  | "CAPTCHA_REQUIRED"
  | "CAPTCHA_FAILED"
  | "CAPTCHA_UNAVAILABLE"
  | "CAPTCHA_NOT_CONFIGURED";

export const TURNSTILE_FAILURE_STATUS: Record<TurnstileFailureCode, number> = {
  CAPTCHA_REQUIRED: 400,
  CAPTCHA_FAILED: 400,
  CAPTCHA_UNAVAILABLE: 503,
  CAPTCHA_NOT_CONFIGURED: 503,
};

export type TurnstileFailure = { code: TurnstileFailureCode };

// Checks that need no network. "Mode on" with a missing secret, a missing site
// key, an unusable host list, or a public test key in Production is a setup
// mistake, so the form closes instead of letting everyone through.
export function configProblem(config: TurnstileConfig, env: TurnstileEnv): TurnstileFailure | null {
  if (!config.enabled) return null;
  if (!config.secretKey || !config.siteKey || config.allowedHostsInvalid) {
    return { code: "CAPTCHA_NOT_CONFIGURED" };
  }
  if (
    isProductionDeploy(env) &&
    (TURNSTILE_TEST_SECRET_KEYS.includes(config.secretKey) ||
      TURNSTILE_TEST_SITE_KEYS.includes(config.siteKey))
  ) {
    return { code: "CAPTCHA_NOT_CONFIGURED" };
  }
  return null;
}

type HeaderSource = { get(name: string): string | null };

export type TokenRead = { ok: true; token: string } | { ok: false; failure: TurnstileFailure };

// A missing or blank header is "required"; one over the documented length can
// never be a real token, so it is "failed" without a call to Cloudflare.
export function readTurnstileToken(headers: HeaderSource): TokenRead {
  const raw = headers.get(TURNSTILE_TOKEN_HEADER);
  const token = (raw ?? "").trim();
  if (!token) return { ok: false, failure: { code: "CAPTCHA_REQUIRED" } };
  if (token.length > TURNSTILE_TOKEN_MAX_LENGTH) return { ok: false, failure: { code: "CAPTCHA_FAILED" } };
  return { ok: true, token };
}

export function clientIpFromHeaders(headers: HeaderSource): string {
  const forwarded = headers.get("x-vercel-forwarded-for") ?? headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || headers.get("x-real-ip")?.trim() || "";
}

export type VerifyLogger = (event: string, detail: Record<string, unknown>) => void;

export type VerifyDeps = {
  fetchImpl?: typeof fetch;
  env?: TurnstileEnv;
  log?: VerifyLogger;
  timeoutMs?: number;
  attempts?: number;
  idempotencyKey?: string;
};

type SiteverifyReply = {
  success?: unknown;
  hostname?: unknown;
  action?: unknown;
  "error-codes"?: unknown;
};

type Attempt =
  | { kind: "reply"; data: SiteverifyReply }
  | { kind: "retry"; reason: string };

async function callSiteverify(
  body: URLSearchParams,
  fetchImpl: typeof fetch,
  timeoutMs: number,
): Promise<Attempt> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(TURNSTILE_SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: controller.signal,
      cache: "no-store",
    });
    if (response.status >= 500) return { kind: "retry", reason: `http_${response.status}` };
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      return { kind: "retry", reason: "not_json" };
    }
    if (!data || typeof data !== "object") return { kind: "retry", reason: "not_json" };
    return { kind: "reply", data: data as SiteverifyReply };
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    return { kind: "retry", reason: aborted ? "timeout" : "network" };
  } finally {
    clearTimeout(timer);
  }
}

function errorCodesOf(data: SiteverifyReply): string[] {
  const codes = data["error-codes"];
  return Array.isArray(codes) ? codes.filter((code): code is string => typeof code === "string") : [];
}

// Asks Cloudflare whether a token is good. Returns null when it is, or the
// failure to send back. The token and the secret are never logged.
export async function verifyTurnstileToken(
  config: TurnstileConfig,
  token: string,
  remoteIp: string,
  deps: VerifyDeps = {},
): Promise<TurnstileFailure | null> {
  const env = deps.env ?? process.env;
  const log: VerifyLogger = deps.log ?? ((event, detail) => console.warn(`[turnstile] ${event}`, detail));
  const fetchImpl = deps.fetchImpl ?? fetch;
  const attempts = deps.attempts ?? TURNSTILE_VERIFY_ATTEMPTS;
  const timeoutMs = deps.timeoutMs ?? TURNSTILE_VERIFY_TIMEOUT_MS;

  const problem = configProblem(config, env);
  if (problem) {
    log("not_configured", { form: config.form });
    return problem;
  }

  const body = new URLSearchParams();
  body.set("secret", config.secretKey);
  body.set("response", token);
  if (remoteIp) body.set("remoteip", remoteIp);
  // The same key on the retry lets Cloudflare tell a repeat of this check from
  // a second use of a spent token.
  body.set("idempotency_key", deps.idempotencyKey ?? crypto.randomUUID());

  let lastReason = "unknown";
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const result = await callSiteverify(body, fetchImpl, timeoutMs);
    if (result.kind === "retry") {
      lastReason = result.reason;
      continue;
    }

    const data = result.data;
    const codes = errorCodesOf(data);

    if (data.success === true) {
      if (isRelaxedTestRun(config, env)) return null;
      const hostname = typeof data.hostname === "string" ? data.hostname.toLowerCase() : "";
      if (!hostname || !config.allowedHosts.includes(hostname)) {
        log("hostname_mismatch", { form: config.form, hostname });
        return { code: "CAPTCHA_FAILED" };
      }
      if (data.action !== config.action) {
        log("action_mismatch", { form: config.form, action: typeof data.action === "string" ? data.action : "" });
        return { code: "CAPTCHA_FAILED" };
      }
      return null;
    }

    if (codes.includes("invalid-input-secret") || codes.includes("missing-input-secret")) {
      log("secret_rejected", { form: config.form, codes });
      return { code: "CAPTCHA_NOT_CONFIGURED" };
    }
    if (codes.includes("internal-error")) {
      lastReason = "internal-error";
      continue;
    }
    if (codes.includes("bad-request")) log("bad_request", { form: config.form, codes });
    return { code: "CAPTCHA_FAILED" };
  }

  log("unavailable", { form: config.form, reason: lastReason });
  return { code: "CAPTCHA_UNAVAILABLE" };
}

export type TurnstileGate =
  | { state: "off" }
  | { state: "fail"; failure: TurnstileFailure }
  | { state: "ready"; config: TurnstileConfig; token: string };

// Step one, before the body is read: is the check on, is it set up, and did the
// request bring a token. It makes no network call, so a request with no token
// is turned away before any upload is read or anything is sent to Cloudflare.
export function openTurnstileGate(
  form: TurnstileForm,
  headers: HeaderSource,
  env: TurnstileEnv = process.env,
): TurnstileGate {
  const config = readTurnstileConfig(form, env);
  if (!config.enabled) return { state: "off" };
  const problem = configProblem(config, env);
  if (problem) return { state: "fail", failure: problem };
  const token = readTurnstileToken(headers);
  if (!token.ok) return { state: "fail", failure: token.failure };
  return { state: "ready", config, token: token.token };
}

// Step two, after the cheap checks pass: the one call to Cloudflare.
export async function closeTurnstileGate(
  gate: Extract<TurnstileGate, { state: "ready" }>,
  headers: HeaderSource,
  deps: VerifyDeps = {},
): Promise<TurnstileFailure | null> {
  return verifyTurnstileToken(gate.config, gate.token, clientIpFromHeaders(headers), deps);
}
