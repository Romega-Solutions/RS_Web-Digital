import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  APPLY_GENERIC_ERROR,
  MAX_RESUME_BYTES,
  MAX_RESUME_MB,
  RESUME_TOO_LARGE_MESSAGE,
  isJsonContentType,
  isResumeTooLarge,
  isUnusableUpstreamReply,
  readApplyReply,
} from "./apply-upload.ts";

function reply(status: number, contentType: string | null, body: string) {
  return new Response(body, {
    status,
    headers: contentType ? { "content-type": contentType } : {},
  });
}

test("resume cap is 4 MB", () => {
  assert.equal(MAX_RESUME_MB, 4);
  assert.equal(MAX_RESUME_BYTES, 4 * 1024 * 1024);
});

test("exactly 4 MB is accepted, 4 MB + 1 byte is rejected", () => {
  assert.equal(isResumeTooLarge(MAX_RESUME_BYTES), false);
  assert.equal(isResumeTooLarge(MAX_RESUME_BYTES + 1), true);
  assert.equal(isResumeTooLarge(0), false);
});

test("over-limit message matches the agreed copy", () => {
  assert.equal(
    RESUME_TOO_LARGE_MESSAGE,
    "File is over 4 MB. Please upload a smaller PDF, or email it to hr@romega-solutions.com.",
  );
  assert.equal(
    APPLY_GENERIC_ERROR,
    "Something went wrong. Please try again, or email your resume to hr@romega-solutions.com.",
  );
});

test("detects JSON content types", () => {
  assert.equal(isJsonContentType("application/json"), true);
  assert.equal(isJsonContentType("application/json; charset=utf-8"), true);
  assert.equal(isJsonContentType("application/problem+json"), true);
  assert.equal(isJsonContentType("text/html; charset=utf-8"), false);
  assert.equal(isJsonContentType("text/plain"), false);
  assert.equal(isJsonContentType(null), false);
});

test("proxy treats non-JSON, 5xx and 401/403 upstream replies as unusable", () => {
  assert.equal(isUnusableUpstreamReply(200, "text/html"), true);
  assert.equal(isUnusableUpstreamReply(413, "text/plain"), true);
  assert.equal(isUnusableUpstreamReply(200, null), true);
  assert.equal(isUnusableUpstreamReply(502, "application/json"), true);
  assert.equal(isUnusableUpstreamReply(401, "application/json"), true);
  assert.equal(isUnusableUpstreamReply(403, "application/json"), true);
  assert.equal(isUnusableUpstreamReply(200, "application/json"), false);
  for (const status of [400, 404, 409, 413, 429]) {
    assert.equal(isUnusableUpstreamReply(status, "application/json"), false);
  }
});

test("form shows the friendly message for a non-JSON reply, never a parse error", async () => {
  const result = await readApplyReply(reply(413, "text/plain", "Request Entity Too Large"));
  assert.deepEqual(result, { ok: false, message: APPLY_GENERIC_ERROR });
});

test("form shows the friendly message when JSON content-type has a broken body", async () => {
  const result = await readApplyReply(reply(200, "application/json", "<html>oops"));
  assert.deepEqual(result, { ok: false, message: APPLY_GENERIC_ERROR });
  assert.doesNotMatch(JSON.stringify(result), /Unexpected token/);
});

test("form reads a success reply", async () => {
  const body = JSON.stringify({ ok: true, candidateId: 1, applicationCode: "APP-1" });
  assert.deepEqual(await readApplyReply(reply(200, "application/json", body)), {
    ok: true,
    applicationCode: "APP-1",
  });
});

test("form keeps the server's own message for a JSON error, and falls back otherwise", async () => {
  const withMessage = JSON.stringify({ ok: false, code: "X", error: "Email already applied." });
  assert.deepEqual(await readApplyReply(reply(409, "application/json", withMessage)), {
    ok: false,
    message: "Email already applied.",
  });
  assert.deepEqual(await readApplyReply(reply(500, "application/json", "{}")), {
    ok: false,
    message: APPLY_GENERIC_ERROR,
  });
  assert.deepEqual(await readApplyReply(reply(200, "application/json", "null")), {
    ok: false,
    message: APPLY_GENERIC_ERROR,
  });
});

test("api route returns 413 before forwarding and 502 for unusable upstream replies", () => {
  const source = readFileSync(
    new URL("../app/api/apply/[positionId]/route.ts", import.meta.url),
    "utf8",
  );
  const tooLarge = source.indexOf("isResumeTooLarge(resume.size)");
  const forward = source.indexOf("await fetch(");
  assert.ok(tooLarge > -1 && forward > -1 && tooLarge < forward);
  assert.match(source, /status: 413/);
  assert.match(source, /isUnusableUpstreamReply\(upstream\.status, contentType\)/);
  assert.match(source, /x-vercel-error/);
  assert.match(source, /status: 502/);
});

test("apply form uses the shared cap and has no hard-coded size", () => {
  const source = readFileSync(
    new URL("../app/apply/[positionId]/ApplyForm.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /Resume \(PDF, max \{MAX_RESUME_MB\} MB\)/);
  assert.doesNotMatch(source, /10 MB|MAX_FILE_MB|\* 1024/);
  assert.match(source, /readApplyReply\(response\)/);
  assert.doesNotMatch(source, /response\.json\(\)/);
});
