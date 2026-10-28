// One email rule shared by the Apply form, the Contact form, /api/contact and
// the /api/apply pre-check. Callers trim the value before testing it.

// - Name part: no spaces, "@", "<" or ">", and no leading, trailing or doubled dots.
// - Domain: dot-separated labels that do not start or end with a hyphen.
// - Last label (the TLD): letters only, 2 to 24 of them, so "a@b.12" and "a@b.com." fail.
const NAME_PART = "[^\\s@.<>]+(?:\\.[^\\s@.<>]+)*";
const DOMAIN_LABEL = "[^\\s@.<>-](?:[^\\s@.<>]*[^\\s@.<>-])?";
export const EMAIL_PATTERN = new RegExp(`^${NAME_PART}@(?:${DOMAIN_LABEL}\\.)+\\p{L}{2,24}$`, "u");
export const EMAIL_MAX_LENGTH = 254;
export const EMAIL_PLACEHOLDER = "juan.delacruz@gmail.com";
export const EMAIL_REQUIRED_MESSAGE = "Enter your email address.";
export const EMAIL_INVALID_MESSAGE = "Enter a valid email, e.g. name@example.com";

export function isValidEmail(email: string): boolean {
  return email.length <= EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(email);
}
