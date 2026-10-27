// Shared by the Apply and Contact forms: the summary line shown after a
// submit with invalid fields, and when it is no longer needed.

export const FIELD_ERRORS_MESSAGE = "Please correct the highlighted fields and try again.";

export function hasFieldErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}

/** True for the summary line itself. Other messages (server errors, a missing resume) always show. */
export function isFieldSummary(message: string): boolean {
  return message === FIELD_ERRORS_MESSAGE;
}

/** The summary hides as soon as every field is valid; any other message stays. */
export function shouldShowBanner(message: string, errors: Record<string, string | undefined>): boolean {
  return Boolean(message) && (!isFieldSummary(message) || hasFieldErrors(errors));
}
