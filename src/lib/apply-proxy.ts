// The work behind POST /api/apply/[positionId]: check the request, then forward
// it to the ticketing system's public endpoint. It lives here, not in the route
// file, so the order of the checks can be tested with a fake Cloudflare and a
// fake portal. The route only hands over the request.
//
// Order matters: the cheap local checks come first, so a request with no
// security token is turned away before its upload is read, and nothing is sent
// to Cloudflare for a form that would be refused anyway.

import {
  RESUME_NOT_PDF_MESSAGE,
  RESUME_TOO_LARGE_MESSAGE,
  isResumeTooLarge,
  isUnusableUpstreamReply,
} from "./apply-upload.ts";
import { checkApplyFields, dropUnknownFiles } from "./apply-fields.ts";
import { precheckApplication } from "./form/apply-precheck.ts";
import { isPdfFile } from "./pdf-signature.ts";
import { serverCaptchaMessage } from "./turnstile/messages.ts";
import {
  TURNSTILE_FAILURE_STATUS,
  closeTurnstileGate,
  openTurnstileGate,
  type TurnstileEnv,
  type TurnstileFailure,
  type VerifyDeps,
} from "./turnstile/verify.ts";

export type ApplyProxyDeps = {
  env: TurnstileEnv;
  fetchImpl: typeof fetch;
  verify?: VerifyDeps;
};

function json(body: unknown, status: number): Response {
  return Response.json(body, { status });
}

function captchaFailure(failure: TurnstileFailure): Response {
  return json(
    { ok: false, code: failure.code, error: serverCaptchaMessage("apply", failure.code) },
    TURNSTILE_FAILURE_STATUS[failure.code],
  );
}

export async function handleApplyRequest(
  req: Request,
  rawPositionId: string,
  deps: ApplyProxyDeps,
): Promise<Response> {
  const { env, fetchImpl } = deps;

  const token = env.PUBLIC_APPLICATIONS_TOKEN;
  if (!token) {
    return json(
      { ok: false, code: "NOT_CONFIGURED", error: "Applications are temporarily unavailable." },
      503,
    );
  }

  const positionId = Number.parseInt(rawPositionId, 10);
  if (!Number.isInteger(positionId) || positionId <= 0) {
    return json({ ok: false, code: "INVALID_POSITION", error: "Invalid position id" }, 400);
  }

  // The security check, step one: is it on and set up, and did the request bring
  // a token. No network call yet.
  const gate = openTurnstileGate("apply", req.headers, env);
  if (gate.state === "fail") return captchaFailure(gate.failure);

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return json({ ok: false, code: "BAD_REQUEST", error: "Expected multipart/form-data" }, 400);
  }

  const resume = formData.get("resume");
  if (resume instanceof File && isResumeTooLarge(resume.size)) {
    return json({ ok: false, code: "FILE_TOO_LARGE", error: RESUME_TOO_LARGE_MESSAGE }, 413);
  }

  // The file has to be a PDF by its first bytes, not only by its name. An empty
  // file part (nothing chosen) is left for the portal's own "required" message.
  if (resume instanceof File && resume.size > 0 && !(await isPdfFile(resume))) {
    return json({ ok: false, code: "UNSUPPORTED_FILE_TYPE", error: RESUME_NOT_PDF_MESSAGE }, 415);
  }

  const tooLong = checkApplyFields(formData);
  if (tooLong) return json(tooLong, 400);

  // Light pre-check: an obviously bad email or phone fails fast, in the same reply
  // shape. The portal's own validation stays the source of truth.
  const precheck = precheckApplication(formData);
  if (precheck) return json(precheck, 400);

  // The widget is told not to add its own form field; if one turns up anyway it
  // is not passed on to the portal.
  formData.delete("cf-turnstile-response");

  // Only the resume is passed on as a file; any other file part is dropped.
  dropUnknownFiles(formData);

  // The security check, step two: the one call to Cloudflare.
  if (gate.state === "ready") {
    const failure = await closeTurnstileGate(gate, req.headers, { ...deps.verify, env, fetchImpl });
    if (failure) return captchaFailure(failure);
  }

  const ticketingUrl = (env.TICKETING_APP_URL || "http://localhost:3000").replace(/\/+$/, "");
  try {
    const upstream = await fetchImpl(`${ticketingUrl}/api/public/applications/${positionId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
      // Don't cache application submissions, and don't reuse a stale agent.
      cache: "no-store",
    });

    const contentType = upstream.headers.get("content-type");
    if (isUnusableUpstreamReply(upstream.status, contentType)) {
      // Status and Vercel's error code only: never the body, headers with secrets, or applicant data.
      console.error(
        "[RS_Web-Digital /api/apply] unusable upstream reply:",
        `status=${upstream.status}`,
        `x-vercel-error=${upstream.headers.get("x-vercel-error") ?? "none"}`,
      );
      return json(
        { ok: false, code: "UPSTREAM_ERROR", error: "Couldn't reach the application service. Please try again in a moment." },
        502,
      );
    }

    const text = await upstream.text();
    // Pass through whatever the upstream returned, preserving status.
    return new Response(text, {
      status: upstream.status,
      headers: {
        "Content-Type": contentType ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error(
      "[RS_Web-Digital /api/apply] forward to ticketing failed:",
      err instanceof Error ? err.message : err,
    );
    return json(
      { ok: false, code: "UPSTREAM_ERROR", error: "Couldn't reach the application service. Please try again in a moment." },
      502,
    );
  }
}
