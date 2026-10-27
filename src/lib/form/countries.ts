// Country list for the phone field. Names come from Intl.DisplayNames and the
// flag is built from regional-indicator letters, so there are no image files.

import { getCountries, getCountryCallingCode, type CountryCode } from "libphonenumber-js";

export type { CountryCode };

export const DEFAULT_COUNTRY: CountryCode = "PH";

export type CountryOption = {
  code: CountryCode;
  name: string;
  callingCode: string;
  flag: string;
  label: string;
};

const SUPPORTED = new Set<string>(getCountries());

export function isCountryCode(value: unknown): value is CountryCode {
  return typeof value === "string" && SUPPORTED.has(value);
}

/** Turns a header or prop value such as "us" into a supported code, else the fallback. */
export function normalizeCountry(
  value: string | null | undefined,
  fallback: CountryCode = DEFAULT_COUNTRY,
): CountryCode {
  const code = (value ?? "").trim().toUpperCase();
  return isCountryCode(code) ? code : fallback;
}

export function flagEmoji(code: string): string {
  return Array.from(code.toUpperCase())
    .map((letter) => String.fromCodePoint(0x1f1e6 + letter.charCodeAt(0) - 65))
    .join("");
}

export function callingCodeOf(code: CountryCode): string {
  return getCountryCallingCode(code);
}

let regionNames: Intl.DisplayNames | null | undefined;

function nameOf(code: CountryCode): string {
  if (regionNames === undefined) {
    try {
      regionNames = new Intl.DisplayNames(["en"], { type: "region" });
    } catch {
      regionNames = null;
    }
  }
  return regionNames?.of(code) || code;
}

export function toCountryOption(code: CountryCode): CountryOption {
  const name = nameOf(code);
  const callingCode = callingCodeOf(code);
  const flag = flagEmoji(code);
  return { code, name, callingCode, flag, label: `${flag} ${name} (+${callingCode})` };
}

let allCountries: CountryOption[] | undefined;

/** Every supported country, A to Z by name. */
export function countryOptions(): CountryOption[] {
  if (!allCountries) {
    allCountries = getCountries()
      .map(toCountryOption)
      .sort((a, b) => a.name.localeCompare(b.name, "en"));
  }
  return allCountries;
}
