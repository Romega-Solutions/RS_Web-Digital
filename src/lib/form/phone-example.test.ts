import assert from "node:assert/strict";
import test from "node:test";
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString } from "libphonenumber-js";
import examples from "libphonenumber-js/examples.mobile.json";
import { toCountryOption, type CountryCode } from "./countries.ts";
import { exampleDigits, phonePlaceholder } from "./phone-example.ts";
import { formatPhoneInput, validatePhone } from "./phone.ts";

// What the visitor sees after typing: the previous text plus one key at a time, like the field does.
function typeDigits(digits: string, country: CountryCode) {
  let text = "";
  let current = country;
  for (const d of digits) {
    const next = formatPhoneInput(text + d, current);
    text = next.value;
    current = next.country;
  }
  return { text, country: current };
}

test("the Philippine example stays 917 555 1234", () => {
  assert.equal(phonePlaceholder("PH"), "917 555 1234");
});

test("representative countries show their own grouping", () => {
  const expected: Record<string, string> = {
    US: "201 555 0123",
    CA: "506 234 5678",
    GB: "7400 123456",
    FR: "6 12 34 56 78",
    DE: "1512 3456789",
    IN: "81234 56789",
    JP: "90 1234 5678",
    KR: "10 2000 0000",
    AU: "412 345 678",
    BR: "11 96123 4567",
    MX: "222 123 4567",
    SG: "8123 4567",
    AE: "50 123 4567",
    ZA: "71 123 4567",
    NG: "802 123 4567",
    ID: "812 345 678",
    IT: "312 345 6789",
    ES: "612 34 56 78",
    NL: "6 12345678",
    CN: "131 2345 6789",
  };
  for (const [country, text] of Object.entries(expected)) {
    assert.equal(phonePlaceholder(country as CountryCode), text, country);
  }
});

test("the leading trunk 0 is not shown, typed or in the placeholder", () => {
  // GB, FR, DE, AU, JP, KR, IN, BR write a 0 at home; the "(+CC)" button replaces it here, as for PH.
  assert.equal(formatPhoneInput("07400123456", "GB").value, "7400 123456");
  assert.equal(formatPhoneInput("0612345678", "FR").value, "6 12 34 56 78");
  assert.equal(formatPhoneInput("015123456789", "DE").value, "1512 3456789");
  assert.equal(formatPhoneInput("0412345678", "AU").value, "412 345 678");
  assert.equal(formatPhoneInput("09012345678", "JP").value, "90 1234 5678");
  assert.equal(formatPhoneInput("01020000000", "KR").value, "10 2000 0000");
  assert.equal(formatPhoneInput("081234 56789", "IN").value, "81234 56789");
  for (const c of ["GB", "FR", "DE", "AU", "JP", "KR", "IN", "BR"] as CountryCode[]) {
    assert.doesNotMatch(phonePlaceholder(c), /^0/, c);
  }
});

test("typing the representative examples digit by digit gives the placeholder and the E.164", () => {
  for (const c of ["US", "CA", "GB", "FR", "DE", "IN", "JP", "AU", "BR", "MX", "SG", "PH", "AE", "ZA", "NG"] as CountryCode[]) {
    const typed = typeDigits(exampleDigits(c), c);
    assert.equal(typed.country, c, `${c} country stays`);
    assert.equal(typed.text, phonePlaceholder(c), c);
    assert.deepEqual(validatePhone(typed.text, c), { ok: true, e164: `+${getCountryCallingCode(c)}${exampleDigits(c)}` }, c);
  }
});

test("pasting the +CC form of a representative number shows the same text", () => {
  for (const c of ["US", "GB", "FR", "DE", "IN", "JP", "AU", "BR", "SG", "AE", "ZA", "NG"] as CountryCode[]) {
    const out = formatPhoneInput(`+${getCountryCallingCode(c)}${exampleDigits(c)}`, c);
    assert.deepEqual(out, { country: c, value: phonePlaceholder(c) }, c);
  }
});

test("every country in the picker has a library example number", () => {
  const missing = getCountries().filter((c) => !(examples as Record<string, string>)[c]);
  assert.deepEqual(missing, []);
});

test("all countries: a placeholder that is a valid number, and typing it gives the same text and E.164", () => {
  const problems: string[] = [];
  for (const c of getCountries()) {
    const name = `${c} ${toCountryOption(c).name}`;
    const cc = getCountryCallingCode(c);
    const digits = exampleDigits(c);
    const placeholder = phonePlaceholder(c);
    if (!placeholder) problems.push(`${name}: empty placeholder`);
    if (!/^[0-9 ().-]+$/.test(placeholder)) problems.push(`${name}: odd characters in "${placeholder}"`);
    if (placeholder.replace(/\D/g, "") !== digits) problems.push(`${name}: placeholder digits differ from the example`);
    const parsed = parsePhoneNumberFromString(`+${cc}${digits}`);
    if (!parsed || !parsed.isValid()) problems.push(`${name}: example +${cc}${digits} is not valid`);
    const typed = typeDigits(digits, c);
    if (typed.country !== c) problems.push(`${name}: country switched to ${typed.country}`);
    if (typed.text !== placeholder) problems.push(`${name}: typed "${typed.text}" != placeholder "${placeholder}"`);
    const check = validatePhone(typed.text, c);
    if (!check.ok || check.e164 !== `+${cc}${digits}`) problems.push(`${name}: E.164 round trip failed`);
    const pasted = formatPhoneInput(`+${cc}${digits}`, c);
    if (pasted.value !== placeholder || pasted.country !== c) problems.push(`${name}: pasted +${cc} form gives "${pasted.value}" (${pasted.country})`);
  }
  assert.deepEqual(problems, []);
});

test("the placeholder never shows more digits than the example and is stable between calls", () => {
  for (const c of getCountries()) {
    assert.equal(phonePlaceholder(c), phonePlaceholder(c));
    assert.ok(phonePlaceholder(c).replace(/\D/g, "").length <= 15, c);
  }
});
