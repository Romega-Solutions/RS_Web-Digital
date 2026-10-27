// Gray example numbers for the phone box, one per country.
//
// libphonenumber-js ships one example mobile number per country (the same data
// Google publishes). The whole file is about 4 KB and it is only imported by the
// phone field, so it is loaded on /apply and /contact only. The example is run
// through the same formatter the visitor's own typing goes through, so the gray
// text shows exactly the spacing they will see once they type.

import examples from "libphonenumber-js/examples.mobile.json";
import type { CountryCode } from "./countries.ts";
import { formatNational } from "./phone.ts";

// The Philippine example the form has always shown. The library's own example
// for PH is 905 123 4567.
const EXAMPLE_OVERRIDES: Partial<Record<CountryCode, string>> = {
  PH: "9175551234",
};

const cache = new Map<CountryCode, string>();

/** Example national number for a country, digits only ("9175551234"), or "" if none. */
export function exampleDigits(country: CountryCode): string {
  const override = EXAMPLE_OVERRIDES[country];
  if (override) return override;
  return (examples as Record<string, string>)[country] ?? "";
}

/** The gray placeholder for a country, e.g. "917 555 1234" for PH, "6 12 34 56 78" for FR. */
export function phonePlaceholder(country: CountryCode): string {
  const hit = cache.get(country);
  if (hit !== undefined) return hit;
  const digits = exampleDigits(country);
  const text = digits ? formatNational(country, digits) : "";
  cache.set(country, text);
  return text;
}
