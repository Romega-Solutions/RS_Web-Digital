// Phone rules shared by the PhoneField component, /api/contact and the
// /api/apply pre-check. Uses libphonenumber-js with its "min" metadata.

import { toCountryOption } from "./countries.ts";
import {
  AsYouType,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

export const PHONE_MAX_DIGITS = 15;
export const PHONE_REQUIRED_MESSAGE = "Enter your phone number.";
export const PHONE_CHARS_MESSAGE = "Use numbers only. Letters and symbols aren't allowed.";

export type PhoneReason = "empty" | "chars" | "invalid";
export type PhoneCheck = { ok: true; e164: string } | { ok: false; reason: PhoneReason };

// Digits, spaces, ( ) . - and a single leading +. Anything else is "letters or symbols".
const ALLOWED_CHARS = /^\+?[0-9\s().-]*$/;

// Calling codes shared by several countries open on the best-known one.
const PREFERRED_FOR_CALLING_CODE: Record<string, CountryCode> = {
  "1": "US",
  "7": "RU",
  "39": "IT",
  "44": "GB",
  "47": "NO",
  "61": "AU",
  "212": "MA",
  "262": "RE",
  "290": "SH",
  "358": "FI",
  "590": "GP",
  "599": "CW",
};

export function hasPhoneBadChars(raw: string): boolean {
  return !ALLOWED_CHARS.test(raw.trim());
}

function callingCode(country: CountryCode): string {
  return getCountryCallingCode(country);
}

// +44 is shared with Guernsey, Jersey and the Isle of Man, and some ordinary UK
// mobile ranges are detected as one of them. Visitors expect GB.
const ALWAYS_PREFERRED_FOR_CALLING_CODE = new Set(["44"]);

function countryForCallingCode(code: string, detected: CountryCode | undefined): CountryCode | null {
  if (!ALWAYS_PREFERRED_FOR_CALLING_CODE.has(code) && detected && callingCode(detected) === code) {
    return detected;
  }
  const preferred = PREFERRED_FOR_CALLING_CODE[code];
  if (preferred && callingCode(preferred) === code) return preferred;
  return null;
}

// "917555" -> "917 555" for PH, without the country code or national 0.
// The grouping is the country's own (the same as after "+CC " in its international
// form, e.g. "6 12 34 56 78" for FR), so what is shown next to the "(+CC)" button
// reads like the number written with that code.
export function formatNational(country: CountryCode, nationalNumber: string): string {
  const prefix = `+${callingCode(country)}`;
  const formatted = new AsYouType().input(`${prefix}${nationalNumber}`);
  return formatted.startsWith(prefix) ? formatted.slice(prefix.length).trim() : nationalNumber;
}

// The national number for what was typed: the digits minus the trunk prefix (0, 8,
// 1...). libphonenumber also turns a short local number into a full one by adding
// an area code (American Samoa "733 1234" -> "684 733 1234", Guernsey "7781 12" ->
// "1481 7781 12"). That would put digits in the box the visitor never typed and
// shift every later key, so a result longer than what was typed is not used.
function nationalDigits(typed: AsYouType, digits: string): string {
  const national = typed.getNationalNumber();
  if (!national) return "";
  return national.length > digits.length ? digits : national;
}

/**
 * Re-formats what the visitor typed or pasted, as they type.
 * - Letters or symbols are kept as typed (and flagged by validatePhone) so the
 *   field can turn red instead of silently deleting them.
 * - A leading 0 (national prefix) is dropped: "09175551234" -> "917 555 1234".
 * - Pasted "+63 917 555 1234" switches the country and shows the national part.
 */
export function formatPhoneInput(
  raw: string,
  country: CountryCode,
): { country: CountryCode; value: string } {
  if (raw.trim() === "") return { country, value: "" };
  if (hasPhoneBadChars(raw)) return { country, value: raw.slice(0, 40) };

  const digits = raw.replace(/\D/g, "").slice(0, PHONE_MAX_DIGITS);

  if (raw.trim().startsWith("+")) {
    const international = new AsYouType();
    international.input(`+${digits}`);
    const code = international.getCallingCode();
    if (!code) return { country, value: `+${digits}` };
    const nextCountry =
      callingCode(country) === code
        ? country
        : countryForCallingCode(code, international.getCountry());
    if (!nextCountry) return { country, value: `+${digits}` };
    return { country: nextCountry, value: formatNational(nextCountry, digits.slice(code.length)) };
  }

  const typed = new AsYouType(country);
  typed.input(digits);
  const typedCode = typed.getCallingCode();
  if (typedCode && typedCode !== callingCode(country)) {
    // e.g. the visitor typed an international dialling prefix such as 0063...
    return formatPhoneInput(`+${typedCode}${typed.getNationalNumber()}`, country);
  }
  const national = nationalDigits(typed, digits);
  // A lone "0" has no national number yet; show it until the next digit arrives.
  return { country, value: national ? formatNational(country, national) : digits };
}

export function validatePhone(value: string, country: CountryCode): PhoneCheck {
  const text = value.trim();
  if (!text) return { ok: false, reason: "empty" };
  if (hasPhoneBadChars(text)) return { ok: false, reason: "chars" };
  const parsed = parsePhoneNumberFromString(text, country);
  if (!parsed || !parsed.isValid()) return { ok: false, reason: "invalid" };
  return { ok: true, e164: parsed.number };
}

// Country names that read with "the": "for the United States".
const NAMES_WITH_THE = new Set<string>([
  "AE", "AX", "BQ", "BS", "CC", "CF", "CK", "DO", "FK", "FO", "GB", "GM", "KM", "KY", "MH", "MP",
  "MV", "NL", "PN", "PS", "SB", "SC", "TC", "US", "VG", "VI",
]);

function countryNameForSentence(country: CountryCode): string {
  const name = toCountryOption(country).name;
  return NAMES_WITH_THE.has(country) ? `the ${name}` : name;
}

export function phoneErrorMessage(reason: PhoneReason, country: CountryCode): string {
  if (reason === "empty") return PHONE_REQUIRED_MESSAGE;
  if (reason === "chars") return PHONE_CHARS_MESSAGE;
  if (country === "PH") return "Enter a valid Philippine number, e.g. 917 555 1234.";
  return `Enter a valid phone number for ${countryNameForSentence(country)}.`;
}

/**
 * Server-side check. Accepts E.164 ("+639175551234") and, for older cached
 * pages, a national number that is valid for the fallback country.
 */
export function isValidPhoneValue(value: string, fallbackCountry: CountryCode = "PH"): boolean {
  const text = value.trim();
  if (!text || text.length > 40 || hasPhoneBadChars(text)) return false;
  return isValidPhoneNumber(text, fallbackCountry);
}
