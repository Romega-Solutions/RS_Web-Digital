// One pass over every Apply field on a submit attempt, so everything that is
// wrong is marked red at the same time (the resume included), not one thing
// per click.

import { isResumeTooLarge } from "../apply-upload.ts";
import { EMAIL_INVALID_MESSAGE, EMAIL_REQUIRED_MESSAGE, isValidEmail } from "./email.ts";
import type { CountryCode } from "./countries.ts";
import { fieldError } from "./field-state.ts";
import { phoneErrorMessage, validatePhone } from "./phone.ts";

export const RESUME_MISSING_MESSAGE = "Please attach your resume.";
export const RESUME_TYPE_MESSAGE = "Resume must be a PDF file.";

export function nameError(value: string): string | undefined {
  return value.trim() ? undefined : "Enter your full name.";
}

export function emailError(value: string): string | undefined {
  const email = value.trim();
  if (!email) return EMAIL_REQUIRED_MESSAGE;
  return isValidEmail(email) ? undefined : EMAIL_INVALID_MESSAGE;
}

export function phoneError(value: string, country: CountryCode): string | undefined {
  const check = validatePhone(value, country);
  return check.ok ? undefined : phoneErrorMessage(check.reason, country);
}

/** What is wrong with the chosen resume, if anything. "too-large" has its own note, so it has no message here. */
export type ResumeProblem = "missing" | "type" | "too-large";

export function resumeProblem(file: { size: number; type: string } | null | undefined): ResumeProblem | undefined {
  if (!file || file.size === 0) return "missing";
  if (file.type !== "application/pdf") return "type";
  if (isResumeTooLarge(file.size)) return "too-large";
  return undefined;
}

export function resumeMessage(problem: ResumeProblem | undefined): string {
  if (problem === "missing") return RESUME_MISSING_MESSAGE;
  if (problem === "type") return RESUME_TYPE_MESSAGE;
  return "";
}

export type ApplySubmitInput = {
  fullName: string;
  email: string;
  phone: string;
  phoneCountry: CountryCode;
  resume: { size: number; type: string } | null | undefined;
};

export type ApplySubmitResult = {
  fullName?: string;
  email?: string;
  phone?: string;
  resume?: ResumeProblem;
};

export function applySubmitErrors(input: ApplySubmitInput): ApplySubmitResult {
  return {
    fullName: fieldError("submit", input.fullName, nameError),
    email: fieldError("submit", input.email, emailError),
    phone: fieldError("submit", input.phone, (value) => phoneError(value, input.phoneCountry)),
    resume: resumeProblem(input.resume),
  };
}

export function hasApplyErrors(result: ApplySubmitResult): boolean {
  return Boolean(result.fullName || result.email || result.phone || result.resume);
}
