// Phone rules shared by the PhoneField component, /api/contact and the
// /api/apply pre-check. Uses libphonenumber-js with its "min" metadata.

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

function countryForCallingCode(code: string, detected: CountryCode | undefined): CountryCode | null {
  if (detected && callingCode(detected) === code) return detected;
  const preferred = PREFERRED_FOR_CALLING_CODE[code];
  if (preferred && callingCode(preferred) === code) return preferred;
  return null;
}

// "917555" -> "917 555" for PH, without the country code or national 0.
function formatNational(country: CountryCode, nationalNumber: string): string {
  const prefix = `+${callingCode(country)}`;
  const formatted = new AsYouType().input(`${prefix}${nationalNumber}`);
  return formatted.startsWith(prefix) ? formatted.slice(prefix.length).trim() : nationalNumber;
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
  const national = typed.getNationalNumber();
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

export function phoneErrorMessage(reason: PhoneReason, country: CountryCode): string {
  if (reason === "empty") return PHONE_REQUIRED_MESSAGE;
  if (reason === "chars") return PHONE_CHARS_MESSAGE;
  if (country === "PH") return "Enter a valid PH number (10 digits after +63).";
  return `Enter a valid ${country} phone number.`;
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
