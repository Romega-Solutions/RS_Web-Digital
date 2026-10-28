import assert from "node:assert/strict";
import test from "node:test";
import { fieldError, type FieldRule } from "./field-state.ts";
import { EMAIL_INVALID_MESSAGE, EMAIL_REQUIRED_MESSAGE, isValidEmail } from "./email.ts";

const emailRule: FieldRule = (value) => {
  const email = value.trim();
  if (!email) return EMAIL_REQUIRED_MESSAGE;
  return isValidEmail(email) ? undefined : EMAIL_INVALID_MESSAGE;
};
const nameRule: FieldRule = (value) => (value.trim() ? undefined : "Enter your full name.");

test("an empty field is never red on blur", () => {
  assert.equal(fieldError("blur", "", emailRule), undefined);
  assert.equal(fieldError("blur", "   ", emailRule), undefined);
  assert.equal(fieldError("blur", "", nameRule), undefined);
});

test("a blur on an empty field leaves a submit flag alone until the visitor edits it", () => {
  const flagged = fieldError("submit", "", emailRule);
  assert.equal(flagged, EMAIL_REQUIRED_MESSAGE);
  assert.equal(fieldError("blur", "", emailRule, flagged), EMAIL_REQUIRED_MESSAGE);
  assert.equal(fieldError("edit", "j", emailRule, flagged), undefined);
  assert.equal(fieldError("edit", "", emailRule, flagged), undefined);
  assert.equal(fieldError("blur", "", emailRule, undefined), undefined);
});

test("content that is invalid is red on blur", () => {
  assert.equal(fieldError("blur", "juan@gmail", emailRule), EMAIL_INVALID_MESSAGE);
});

test("valid content is not red on blur", () => {
  assert.equal(fieldError("blur", "juan@gmail.com", emailRule), undefined);
  assert.equal(fieldError("blur", "Juan", nameRule), undefined);
});

test("a corrected or cleared value is not red any more", () => {
  // wrong on blur ...
  assert.equal(fieldError("blur", "juan@gmail", emailRule), EMAIL_INVALID_MESSAGE);
  // ... corrected, then blurred again
  assert.equal(fieldError("blur", "juan@gmail.com", emailRule), undefined);
  // ... or deleted, then blurred again
  assert.equal(fieldError("blur", "", emailRule), undefined);
});

test("a submit attempt flags empty required fields and invalid ones", () => {
  assert.equal(fieldError("submit", "", emailRule), EMAIL_REQUIRED_MESSAGE);
  assert.equal(fieldError("submit", "", nameRule), "Enter your full name.");
  assert.equal(fieldError("submit", "juan@gmail", emailRule), EMAIL_INVALID_MESSAGE);
  assert.equal(fieldError("submit", "juan@gmail.com", emailRule), undefined);
});

test("any edit clears the field, whatever it holds", () => {
  assert.equal(fieldError("edit", "", emailRule), undefined);
  assert.equal(fieldError("edit", "j", emailRule), undefined);
  assert.equal(fieldError("edit", "juan@gmail", emailRule), undefined);
});

test("after an edit the next blur decides again", () => {
  // submit flagged it, the visitor typed a partial address, then left the field
  assert.equal(fieldError("submit", "", emailRule), EMAIL_REQUIRED_MESSAGE);
  assert.equal(fieldError("edit", "j", emailRule), undefined);
  assert.equal(fieldError("blur", "j", emailRule), EMAIL_INVALID_MESSAGE);
});
