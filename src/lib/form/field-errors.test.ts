import assert from "node:assert/strict";
import test from "node:test";
import { FIELD_ERRORS_MESSAGE, hasFieldErrors, isFieldSummary, shouldShowBanner } from "./field-errors.ts";

test("the summary shows only while a field still has an error", () => {
  assert.equal(hasFieldErrors({}), false);
  assert.equal(hasFieldErrors({ email: undefined, phone: "" }), false);
  assert.equal(hasFieldErrors({ email: undefined, phone: "Enter your phone number." }), true);
  assert.equal(isFieldSummary(FIELD_ERRORS_MESSAGE), true);
  assert.equal(isFieldSummary("Please attach your resume."), false);
  assert.equal(shouldShowBanner(FIELD_ERRORS_MESSAGE, { phone: "Enter your phone number." }), true);
  assert.equal(shouldShowBanner(FIELD_ERRORS_MESSAGE, { phone: undefined }), false);
  assert.equal(shouldShowBanner("", { phone: "x" }), false);
  // other messages are not tied to field errors
  assert.equal(shouldShowBanner("Please attach your resume.", {}), true);
});
