import assert from "node:assert/strict";
import test from "node:test";
import { EMAIL_PLACEHOLDER, isValidEmail } from "./email.ts";

test("accepts normal addresses, including the placeholder", () => {
  assert.equal(isValidEmail(EMAIL_PLACEHOLDER), true);
  assert.equal(isValidEmail("name@example.com"), true);
  assert.equal(isValidEmail("first.last+tag@sub.example.co"), true);
});

test("rejects addresses without a name, domain or dot", () => {
  for (const bad of ["", "plain", "a@b", "@example.com", "a@.com", "a b@example.com", "a@b.c", "a@@b.com"]) {
    assert.equal(isValidEmail(bad), false, bad);
  }
});

test("rejects addresses over 254 characters and does not trim", () => {
  assert.equal(isValidEmail(`${"a".repeat(250)}@example.com`), false);
  assert.equal(isValidEmail(" name@example.com"), false);
});
