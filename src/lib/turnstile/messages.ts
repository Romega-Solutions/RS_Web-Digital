// The words a visitor sees when the security check does not pass. Every
// message names an email address so nobody is stuck behind the check; the form
// turns that address into a mailto link.

import { HR_EMAIL } from "../apply-upload.ts";
import type { AttemptFailureReason } from "./attempt.ts";
import type { TurnstileForm } from "./shared.ts";
import type { TurnstileFailureCode } from "./verify.ts";

export const CONTACT_EMAIL = "info@romega-solutions.com";

type FormCopy = { address: string; fallback: string };

const COPY: Record<TurnstileForm, FormCopy> = {
  contact: { address: CONTACT_EMAIL, fallback: `email us at ${CONTACT_EMAIL}` },
  apply: { address: HR_EMAIL, fallback: `email your resume to ${HR_EMAIL}` },
};

export function captchaMailAddress(form: TurnstileForm): string {
  return COPY[form].address;
}

export function serverCaptchaMessage(form: TurnstileForm, code: TurnstileFailureCode): string {
  const { fallback } = COPY[form];
  switch (code) {
    case "CAPTCHA_REQUIRED":
      return `The security check did not run. Please refresh the page and try again, or ${fallback}.`;
    case "CAPTCHA_FAILED":
      return `We couldn't confirm the security check. Please try again, or ${fallback}.`;
    default:
      return `We couldn't run the security check right now. Please try again in a few minutes, or ${fallback}.`;
  }
}

export function browserCaptchaMessage(form: TurnstileForm, reason: AttemptFailureReason): string {
  const { fallback } = COPY[form];
  if (reason === "timeout" || reason === "expired" || reason === "error") {
    return `The security check didn't finish. Please try again, or ${fallback}.`;
  }
  return `We couldn't load the security check. Check your connection or any content blocker and try again, or ${fallback}.`;
}

// Splits a message around the email address so the form can link just that part.
export function splitAtAddress(message: string, address: string): [string, string, string] | null {
  const index = message.indexOf(address);
  if (index === -1) return null;
  return [message.slice(0, index), address, message.slice(index + address.length)];
}

export const TURNSTILE_NOTICE = "Protected by Cloudflare Turnstile.";
