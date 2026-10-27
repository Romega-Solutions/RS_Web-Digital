import assert from "node:assert/strict";
import test from "node:test";
import {
  formatPhoneInput,
  hasPhoneBadChars,
  isValidPhoneValue,
  phoneErrorMessage,
  validatePhone,
} from "./phone.ts";

test("PH: formats as typed and drops the national 0", () => {
  assert.deepEqual(formatPhoneInput("09175551234", "PH"), { country: "PH", value: "917 555 1234" });
  assert.deepEqual(formatPhoneInput("9175551234", "PH"), { country: "PH", value: "917 555 1234" });
  assert.deepEqual(formatPhoneInput("0917", "PH"), { country: "PH", value: "917" });
  assert.deepEqual(formatPhoneInput("917 555 12", "PH"), { country: "PH", value: "917 555 12" });
  assert.deepEqual(formatPhoneInput("0", "PH"), { country: "PH", value: "0" });
  assert.deepEqual(formatPhoneInput("", "PH"), { country: "PH", value: "" });
});

test("PH: E.164 on a valid number", () => {
  assert.deepEqual(validatePhone("917 555 1234", "PH"), { ok: true, e164: "+639175551234" });
  assert.deepEqual(validatePhone("09175551234", "PH"), { ok: true, e164: "+639175551234" });
});

test("US: formats and gives E.164", () => {
  assert.deepEqual(formatPhoneInput("4155552671", "US"), { country: "US", value: "415 555 2671" });
  assert.deepEqual(validatePhone("415 555 2671", "US"), { ok: true, e164: "+14155552671" });
});

test("a pasted international number switches the country", () => {
  assert.deepEqual(formatPhoneInput("+63 917 555 1234", "US"), { country: "PH", value: "917 555 1234" });
  assert.deepEqual(formatPhoneInput("+639175551234", "PH"), { country: "PH", value: "917 555 1234" });
  assert.deepEqual(formatPhoneInput("+14155552671", "PH"), { country: "US", value: "415 555 2671" });
  assert.equal(formatPhoneInput("+44 20 7946 0958", "PH").country, "GB");
  assert.deepEqual(formatPhoneInput("0063 917 555 1234", "PH"), { country: "PH", value: "917 555 1234" });
});

test("shared calling codes open on the best-known country", () => {
  assert.equal(formatPhoneInput("+44 7911 123456", "PH").country, "GB");
  assert.equal(formatPhoneInput("+447911123456", "US").country, "GB");
  assert.equal(formatPhoneInput("+1 415 555 2671", "PH").country, "US");
  assert.equal(formatPhoneInput("+1 876 555 1234", "PH").country, "JM");
  assert.equal(formatPhoneInput("+44 7911 123456", "GG").country, "GG");
});

test("a lone + or an unknown prefix is kept as typed", () => {
  assert.deepEqual(formatPhoneInput("+", "PH"), { country: "PH", value: "+" });
  assert.deepEqual(formatPhoneInput("+6", "PH"), { country: "PH", value: "+6" });
});

test("too short or too long is invalid", () => {
  assert.deepEqual(validatePhone("917 555 12", "PH"), { ok: false, reason: "invalid" });
  assert.deepEqual(validatePhone("917 555 12345", "PH"), { ok: false, reason: "invalid" });
  assert.deepEqual(validatePhone("415 555", "US"), { ok: false, reason: "invalid" });
});

test("empty is reported as empty", () => {
  assert.deepEqual(validatePhone("   ", "PH"), { ok: false, reason: "empty" });
});

test("letters and symbols are kept as typed and flagged", () => {
  assert.deepEqual(formatPhoneInput("917abc", "PH"), { country: "PH", value: "917abc" });
  assert.deepEqual(validatePhone("917abc", "PH"), { ok: false, reason: "chars" });
  assert.deepEqual(validatePhone("917 555 1234 #", "PH"), { ok: false, reason: "chars" });
  assert.deepEqual(validatePhone("91+7", "PH"), { ok: false, reason: "chars" });
  assert.equal(hasPhoneBadChars("(917) 555-1234"), false);
  assert.equal(hasPhoneBadChars("1-800-FLOWERS"), true);
});

test("input is capped at 15 digits", () => {
  const out = formatPhoneInput("9".repeat(30), "PH");
  assert.equal(out.value.replace(/\D/g, "").length <= 15, true);
});

test("error text names the country and PH gives an example", () => {
  assert.equal(phoneErrorMessage("invalid", "PH"), "Enter a valid Philippine number, e.g. 917 555 1234.");
  assert.equal(phoneErrorMessage("invalid", "US"), "Enter a valid phone number for United States.");
  assert.equal(phoneErrorMessage("empty", "PH"), "Enter your phone number.");
  assert.match(phoneErrorMessage("chars", "PH"), /numbers only/i);
});

test("server check accepts E.164 and a PH national number, rejects junk", () => {
  assert.equal(isValidPhoneValue("+639175551234"), true);
  assert.equal(isValidPhoneValue("+1 415 555 2671"), true);
  assert.equal(isValidPhoneValue("0917 555 1234"), true);
  assert.equal(isValidPhoneValue("+63917"), false);
  assert.equal(isValidPhoneValue("12345"), false);
  assert.equal(isValidPhoneValue("+63917555123a"), false);
  assert.equal(isValidPhoneValue("1-800-FLOWERS"), false);
  assert.equal(isValidPhoneValue(""), false);
  assert.equal(isValidPhoneValue("+".padEnd(60, "1")), false);
});
