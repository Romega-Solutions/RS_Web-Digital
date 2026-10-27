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

test("accepts plus tags, subdomains, dots in the name and accents", () => {
  for (const good of [
    "a@b.co",
    "user@mail.example.com.ph",
    "first.last+tag@sub.example.co",
    "o'neil@example.ie",
    "user@example.technology",
    "user@xn--80ak6aa92e.com",
    "\u00f1andu@example.com",
    "JUAN@GMAIL.COM",
  ]) {
    assert.equal(isValidEmail(good), true, good);
  }
});

test("rejects stray dots, a numeric or long TLD, brackets and bad labels", () => {
  for (const bad of [
    "a@b.com.",
    "a@b..com",
    "a@b.12",
    ".a@b.com",
    "a.@b.com",
    "a..b@c.com",
    "<a@b.com>",
    "a@b.com>",
    "a@-.com",
    "a@b-.com",
    "a@.b.com",
    `a@b.${"c".repeat(25)}`,
    "a@b.c1",
    "a@@b.com",
    "a b@c.com",
  ]) {
    assert.equal(isValidEmail(bad), false, bad);
  }
  assert.equal(isValidEmail(`a@b.${"c".repeat(24)}`), true);
});

test("rejects addresses over 254 characters and does not trim", () => {
  assert.equal(isValidEmail(`${"a".repeat(250)}@example.com`), false);
  assert.equal(isValidEmail(" name@example.com"), false);
});
