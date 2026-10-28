// Shared rules for the public job-application upload. The apply form and the
// /api/apply proxy both import these so the resume cap can never drift apart.

export const MAX_RESUME_MB = 4;
export const MAX_RESUME_BYTES = MAX_RESUME_MB * 1024 * 1024;

export const HR_EMAIL = "hr@romega-solutions.com";

export const RESUME_TOO_LARGE_MESSAGE = `File is over ${MAX_RESUME_MB} MB. Please upload a smaller PDF, or email it to ${HR_EMAIL}.`;

export const APPLY_GENERIC_ERROR = `Something went wrong. Please try again, or email your resume to ${HR_EMAIL}.`;

/** Exactly MAX_RESUME_BYTES is allowed; one byte more is rejected. */
export function isResumeTooLarge(sizeInBytes: number): boolean {
  return sizeInBytes > MAX_RESUME_BYTES;
}

export function isJsonContentType(contentType: string | null | undefined): boolean {
  if (!contentType) return false;
  const mediaType = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
  return mediaType === "application/json" || mediaType.endsWith("+json");
}

/**
 * True when an upstream reply should not be passed to the browser as-is:
 * the body is not JSON, the upstream failed with a server error, or it
 * answered 401/403 (a wrong site-to-portal token or config, which applicants
 * must never see). Other JSON 4xx replies (validation, duplicates, rate
 * limits) still carry a message for the applicant.
 */
export function isUnusableUpstreamReply(status: number, contentType: string | null | undefined): boolean {
  return !isJsonContentType(contentType) || status >= 500 || status === 401 || status === 403;
}

export const APPLY_RATE_LIMITED_MESSAGE =
  "Too many attempts from your connection. Please wait a few minutes and try again, or email your resume to " +
  HR_EMAIL +
  ".";

type ReplyLike = {
  ok: boolean;
  status?: number;
  headers: { get(name: string): string | null };
  json(): Promise<unknown>;
};

/**
 * Reads the proxy reply without ever surfacing a parse error. On failure
 * returns the message to show: the server's own error text when it sent JSON,
 * otherwise the friendly generic message. A security-check refusal also carries
 * its code, so the form can show the email-us link.
 */
export async function readApplyReply(
  response: ReplyLike,
): Promise<
  | { ok: true; applicationCode: string | null }
  | { ok: false; message: string; code?: string }
> {
  if (!isJsonContentType(response.headers.get("content-type"))) {
    // A firewall rate limit answers with plain text, not our JSON.
    if (response.status === 429) return { ok: false, message: APPLY_RATE_LIMITED_MESSAGE };
    return { ok: false, message: APPLY_GENERIC_ERROR };
  }
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return { ok: false, message: APPLY_GENERIC_ERROR };
  }
  const body = (payload && typeof payload === "object" ? payload : {}) as {
    ok?: unknown;
    error?: unknown;
    code?: unknown;
    applicationCode?: unknown;
  };
  if (response.ok && body.ok === true) {
    return {
      ok: true,
      applicationCode: typeof body.applicationCode === "string" ? body.applicationCode : null,
    };
  }
  const message =
    typeof body.error === "string" && body.error.trim() ? body.error : APPLY_GENERIC_ERROR;
  if (typeof body.code === "string" && body.code.startsWith("CAPTCHA_")) {
    return { ok: false, message, code: body.code };
  }
  return { ok: false, message };
}
