// One email rule shared by the Apply form, the Contact form, /api/contact and
// the /api/apply pre-check. Callers trim the value before testing it.

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const EMAIL_MAX_LENGTH = 254;
export const EMAIL_PLACEHOLDER = "juan.delacruz@gmail.com";
export const EMAIL_REQUIRED_MESSAGE = "Enter your email address.";
export const EMAIL_INVALID_MESSAGE = "Enter a valid email, e.g. name@example.com";

export function isValidEmail(email: string): boolean {
  return email.length <= EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(email);
}
