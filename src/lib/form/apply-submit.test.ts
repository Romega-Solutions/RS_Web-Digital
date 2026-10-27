import assert from "node:assert/strict";
import test from "node:test";
import { MAX_RESUME_BYTES } from "../apply-upload.ts";
import {
  RESUME_MISSING_MESSAGE,
  RESUME_TYPE_MESSAGE,
  applySubmitErrors,
  hasApplyErrors,
  resumeMessage,
  resumeProblem,
} from "./apply-submit.ts";
import { FIELD_ERRORS_MESSAGE, shouldShowBanner } from "./field-errors.ts";

const pdf = { size: 1000, type: "application/pdf" };
const good = { fullName: "Juan dela Cruz", email: "juan@gmail.com", phone: "917 555 1234", phoneCountry: "PH" as const };

test("resume problems: missing, not a PDF, too large, fine", () => {
  assert.equal(resumeProblem(null), "missing");
  assert.equal(resumeProblem(undefined), "missing");
  assert.equal(resumeProblem({ size: 0, type: "application/pdf" }), "missing");
  assert.equal(resumeProblem({ size: 10, type: "image/png" }), "type");
  assert.equal(resumeProblem({ size: MAX_RESUME_BYTES + 1, type: "application/pdf" }), "too-large");
  assert.equal(resumeProblem({ size: MAX_RESUME_BYTES, type: "application/pdf" }), undefined);
  assert.equal(resumeProblem(pdf), undefined);
  assert.equal(resumeMessage("missing"), RESUME_MISSING_MESSAGE);
  assert.equal(resumeMessage("type"), RESUME_TYPE_MESSAGE);
  assert.equal(resumeMessage("too-large"), "");
  assert.equal(resumeMessage(undefined), "");
});

test("a submit attempt with a missing resume marks the resume red even when all other fields are fine", () => {
  const result = applySubmitErrors({ ...good, resume: null });
  assert.equal(result.resume, "missing");
  assert.equal(result.fullName, undefined);
  assert.equal(result.email, undefined);
  assert.equal(result.phone, undefined);
  assert.equal(hasApplyErrors(result), true);
});

test("everything wrong is marked in the same pass, resume included", () => {
  const result = applySubmitErrors({ fullName: "", email: "nope", phone: "12", phoneCountry: "PH", resume: null });
  assert.ok(result.fullName);
  assert.ok(result.email);
  assert.ok(result.phone);
  assert.equal(result.resume, "missing");
});

test("an oversize or non-PDF resume is flagged together with a bad email", () => {
  assert.equal(applySubmitErrors({ ...good, email: "a@b..com", resume: { size: MAX_RESUME_BYTES + 1, type: "application/pdf" } }).resume, "too-large");
  const typed = applySubmitErrors({ ...good, email: "a@b..com", resume: { size: 5, type: "text/plain" } });
  assert.equal(typed.resume, "type");
  assert.ok(typed.email);
});

test("a fully valid submit has no errors", () => {
  assert.equal(hasApplyErrors(applySubmitErrors({ ...good, resume: pdf })), false);
});

test("the summary banner follows the resume like any other red field", () => {
  const red = applySubmitErrors({ ...good, resume: null });
  const errors = { fullName: red.fullName, email: red.email, phone: red.phone, resume: resumeMessage(red.resume) };
  assert.equal(shouldShowBanner(FIELD_ERRORS_MESSAGE, errors), true);
  // choosing a file clears the resume red, and with nothing else red the banner goes
  assert.equal(shouldShowBanner(FIELD_ERRORS_MESSAGE, { ...errors, resume: "" }), false);
});
