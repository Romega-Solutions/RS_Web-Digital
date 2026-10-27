// Light pre-check for /api/apply. The portal stays the source of truth: this
// only turns an obviously bad email or phone into a quick 400 before the
// upload is forwarded. A missing or empty field is passed through so the
// portal keeps owning its own "required" messages.

import { EMAIL_INVALID_MESSAGE, isValidEmail } from "./email.ts";
import { isValidPhoneValue } from "./phone.ts";

export type ApplyPrecheckFailure = {
  ok: false;
  code: "INVALID_EMAIL" | "INVALID_PHONE";
  error: string;
};

type FieldSource = { get(name: string): unknown };

export function precheckApplication(fields: FieldSource): ApplyPrecheckFailure | null {
  const email = fields.get("email");
  if (typeof email === "string" && email.trim() !== "" && !isValidEmail(email.trim())) {
    return { ok: false, code: "INVALID_EMAIL", error: EMAIL_INVALID_MESSAGE };
  }

  const phone = fields.get("phone");
  if (typeof phone === "string" && phone.trim() !== "" && !isValidPhoneValue(phone)) {
    return {
      ok: false,
      code: "INVALID_PHONE",
      error: "Enter a valid phone number, e.g. +639175551234.",
    };
  }

  return null;
}
