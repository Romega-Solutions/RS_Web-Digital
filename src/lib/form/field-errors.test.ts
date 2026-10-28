import assert from "node:assert/strict";
import test from "node:test";
import { FIELD_ERRORS_MESSAGE, editClearsStatus, hasFieldErrors, isFieldSummary, shouldShowBanner } from "./field-errors.ts";

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

test("Contact: an edit keeps the field summary (it follows the red fields) but clears other messages", () => {
  assert.equal(editClearsStatus("idle", ""), false);
  assert.equal(editClearsStatus("error", FIELD_ERRORS_MESSAGE), false);
  assert.equal(editClearsStatus("error", "Unable to send your message right now."), true);
  assert.equal(editClearsStatus("success", "Thank you."), true);
  // with the summary kept, the first keystroke does not hide it while fields are red ...
  assert.equal(shouldShowBanner(FIELD_ERRORS_MESSAGE, { email: "Enter your email address.", phone: undefined }), true);
  // ... and it goes once the last red field is fixed
  assert.equal(shouldShowBanner(FIELD_ERRORS_MESSAGE, { email: undefined, phone: undefined }), false);
});
