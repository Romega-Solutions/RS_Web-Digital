import assert from "node:assert/strict";
import test from "node:test";
import { countryOptions, flagEmoji, normalizeCountry, toCountryOption } from "./countries.ts";

test("flag emoji and label", () => {
  assert.equal(flagEmoji("PH"), "\u{1F1F5}\u{1F1ED}");
  const ph = toCountryOption("PH");
  assert.equal(ph.label, "\u{1F1F5}\u{1F1ED} Philippines (+63)");
});

test("the list is A to Z and has the main countries", () => {
  const list = countryOptions();
  const names = list.map((country) => country.name);
  assert.deepEqual(names, [...names].sort((a, b) => a.localeCompare(b, "en")));
  for (const code of ["PH", "US", "GB", "AU", "SG"]) {
    assert.ok(list.some((country) => country.code === code), code);
  }
});

test("normalizeCountry falls back to PH for missing or unknown values", () => {
  assert.equal(normalizeCountry("us"), "US");
  assert.equal(normalizeCountry(" ph "), "PH");
  assert.equal(normalizeCountry(null), "PH");
  assert.equal(normalizeCountry("XX"), "PH");
  assert.equal(normalizeCountry("T1"), "PH");
  assert.equal(normalizeCountry("zz", "US"), "US");
});
