import assert from "node:assert/strict";
import test from "node:test";
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString } from "libphonenumber-js";
import { exampleDigits } from "./phone-example.ts";
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
  assert.equal(phoneErrorMessage("invalid", "US"), "Enter a valid phone number for the United States.");
  assert.equal(phoneErrorMessage("invalid", "GB"), "Enter a valid phone number for the United Kingdom.");
  assert.equal(phoneErrorMessage("invalid", "NL"), "Enter a valid phone number for the Netherlands.");
  assert.equal(phoneErrorMessage("invalid", "AE"), "Enter a valid phone number for the United Arab Emirates.");
  assert.equal(phoneErrorMessage("invalid", "JP"), "Enter a valid phone number for Japan.");
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

test("short local numbers do not get an area code added while typing (AS, TT, GG)", () => {
  // libphonenumber turns a 7-digit American Samoa or 6-digit Guernsey number into a full one;
  // the box must keep exactly the digits typed.
  const typeAll = (digits: string, country: "AS" | "TT" | "GG" | "JE" | "IM") => {
    let text = "";
    for (const d of digits) text = formatPhoneInput(text + d, country).value;
    return text;
  };
  assert.equal(typeAll("6847331234", "AS"), "684 733 1234");
  assert.equal(typeAll("8682911234", "TT"), "868 291 1234");
  assert.equal(typeAll("7781123456", "GG"), "7781 123456");
  assert.equal(typeAll("7797712345", "JE"), "7797 712345");
  assert.equal(typeAll("7924123456", "IM"), "7924 123456");
  assert.equal(formatPhoneInput("6847331", "AS").value, "684 733 1");
  assert.equal(formatPhoneInput("778112", "GG").value, "7781 12");
});

test("a trunk 0 written after +CC is dropped: GB, PH, AU, DE, JP", () => {
  const show = (raw: string, from: "PH" | "GB" | "US" | "AU" = "PH") => formatPhoneInput(raw, from);
  assert.deepEqual(show("+44 (0)7400 123456"), { country: "GB", value: "7400 123456" });
  assert.deepEqual(show("+44 07400 123456"), { country: "GB", value: "7400 123456" });
  assert.deepEqual(show("+44 (0)7400 123456", "GB"), { country: "GB", value: "7400 123456" });
  assert.deepEqual(show("+44 7400 123456"), { country: "GB", value: "7400 123456" });
  assert.deepEqual(show("+63 (0)917 555 1234", "US"), { country: "PH", value: "917 555 1234" });
  assert.deepEqual(show("+63 0917 555 1234"), { country: "PH", value: "917 555 1234" });
  assert.deepEqual(show("+61 (0)412 345 678"), { country: "AU", value: "412 345 678" });
  assert.deepEqual(show("+61 0412 345 678", "AU"), { country: "AU", value: "412 345 678" });
  assert.deepEqual(show("+49 (0)151 23456789"), { country: "DE", value: "1512 3456789" });
  assert.deepEqual(show("+81 (0)90 1234 5678"), { country: "JP", value: "90 1234 5678" });
  // Guernsey keeps its own trunk handling and the Guernsey mobile still shows as UK
  assert.deepEqual(show("+44 (0)7781 123456"), { country: "GB", value: "7781 123456" });
  // the submitted value is E.164 either way
  assert.deepEqual(validatePhone("7400 123456", "GB"), { ok: true, e164: "+447400123456" });
  assert.deepEqual(validatePhone("917 555 1234", "PH"), { ok: true, e164: "+639175551234" });
  assert.deepEqual(validatePhone("412 345 678", "AU"), { ok: true, e164: "+61412345678" });
});

test("a leading 0 that is part of the number is kept after +CC (Italy)", () => {
  assert.deepEqual(formatPhoneInput("+39 06 1234 5678", "PH"), { country: "IT", value: "06 1234 5678" });
  assert.deepEqual(formatPhoneInput("+39 06", "IT"), { country: "IT", value: "06" });
  assert.deepEqual(formatPhoneInput("+39 0", "PH"), { country: "IT", value: "0" });
  assert.deepEqual(validatePhone("06 1234 5678", "IT"), { ok: true, e164: "+390612345678" });
  // a lone 0 after +44 stays visible until the next digit, as for a plain "0"
  assert.deepEqual(formatPhoneInput("+44 0", "PH"), { country: "GB", value: "0" });
  assert.deepEqual(formatPhoneInput("+44", "PH"), { country: "GB", value: "" });
});

test("+CC 0... and +CC (0)... show the same text as +CC ... in every country where the library drops the 0", () => {
  let checked = 0;
  for (const country of getCountries()) {
    const code = getCountryCallingCode(country);
    const digits = exampleDigits(country);
    const clean = parsePhoneNumberFromString(`+${code}${digits}`);
    const withZero = parsePhoneNumberFromString(`+${code}0${digits}`);
    // only countries where the library itself reads the 0 as a trunk prefix
    if (!clean || !withZero || withZero.number !== clean.number) continue;
    const expected = formatPhoneInput(`+${code}${digits}`, country);
    for (const raw of [`+${code} 0${digits}`, `+${code} (0)${digits}`, `+${code}0${digits}`]) {
      assert.deepEqual(formatPhoneInput(raw, country), expected, `${country} ${raw}`);
    }
    checked += 1;
  }
  assert.ok(checked > 80, `only ${checked} countries had a trunk 0`);
});

test("+1 territories and Guernsey, Jersey, Isle of Man: a short local number is not accepted", () => {
  // the box shows what was typed, so the submitted number must not gain digits
  for (const [text, country] of [
    ["684 733 1", "AS"],
    ["733 1234", "AS"],
    ["291 1234", "TT"],
    ["7781 12", "GG"],
    ["+1 684 733 1", "US"],
  ] as const) {
    assert.deepEqual(validatePhone(text, country), { ok: false, reason: "invalid" }, `${country} ${text}`);
  }
  assert.equal(phoneErrorMessage("invalid", "AS"), "Enter a valid phone number for American Samoa.");
});

test("full numbers still give the same E.164 (US, CA, PR, GU, JM, AS, TT, GG, JE, IM)", () => {
  for (const [text, country, e164] of [
    ["201 555 0123", "US", "+12015550123"],
    ["(201) 555-0123", "US", "+12015550123"],
    ["1 201 555 0123", "US", "+12015550123"],
    ["506 234 5678", "CA", "+15062345678"],
    ["787 234 5678", "PR", "+17872345678"],
    ["671 300 1234", "GU", "+16713001234"],
    ["876 210 1234", "JM", "+18762101234"],
    ["684 733 1234", "AS", "+16847331234"],
    ["868 291 1234", "TT", "+18682911234"],
    ["7781 123456", "GG", "+447781123456"],
    ["07781 123456", "GG", "+447781123456"],
    ["7797 712345", "JE", "+447797712345"],
    ["7924 123456", "IM", "+447924123456"],
    ["07400 123456", "GB", "+447400123456"],
    ["+44 7400 123456", "PH", "+447400123456"],
    ["09175551234", "PH", "+639175551234"],
  ] as const) {
    assert.deepEqual(validatePhone(text, country), { ok: true, e164 }, `${country} ${text}`);
  }
});

test("every country's example number is accepted as shown and gives its E.164", () => {
  for (const country of getCountries()) {
    const digits = exampleDigits(country);
    const shown = formatPhoneInput(digits, country);
    assert.equal(shown.country, country, country);
    assert.deepEqual(
      validatePhone(shown.value, shown.country),
      { ok: true, e164: `+${getCountryCallingCode(country)}${digits}` },
      country,
    );
  }
});
