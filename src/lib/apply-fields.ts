// Size limits for the text fields of a job application, and the rule for files.
// The portal stays the source of truth for what a field may contain; these are
// generous ceilings that no real applicant reaches, so an oversized request is
// turned away here instead of being forwarded with the site's bearer token.
//
// - A text field over its limit is refused (never silently cut).
// - Text fields the form does not know about are passed on unchanged, within the
//   default limit, so the portal can add a field without a change here.
// - Files are different: the form sends exactly one, "resume". Any other file
//   part is dropped before the forward.

export const APPLY_FIELD_LIMITS: Record<string, number> = {
  fullName: 200,
  email: 254,
  phone: 40,
  linkedinUrl: 500,
  message: 5000,
  company_website: 200,
};

export const APPLY_DEFAULT_FIELD_LIMIT = 5000;
export const APPLY_MAX_TEXT_FIELDS = 30;

export const APPLY_FIELD_TOO_LONG_MESSAGE =
  "One of the fields is too long. Please shorten it and try again.";
export const APPLY_TOO_MANY_FIELDS_MESSAGE =
  "The form has more fields than expected. Please refresh the page and try again.";

export type ApplyFieldFailure = {
  ok: false;
  code: "FIELD_TOO_LONG" | "TOO_MANY_FIELDS";
  error: string;
};

type Entries = { entries(): IterableIterator<[string, unknown]> };

export function checkApplyFields(form: Entries): ApplyFieldFailure | null {
  let textFields = 0;
  for (const [name, value] of form.entries()) {
    if (typeof value !== "string") continue;
    textFields += 1;
    const limit = APPLY_FIELD_LIMITS[name] ?? APPLY_DEFAULT_FIELD_LIMIT;
    if (value.length > limit) {
      return { ok: false, code: "FIELD_TOO_LONG", error: APPLY_FIELD_TOO_LONG_MESSAGE };
    }
  }
  if (textFields > APPLY_MAX_TEXT_FIELDS) {
    return { ok: false, code: "TOO_MANY_FIELDS", error: APPLY_TOO_MANY_FIELDS_MESSAGE };
  }
  return null;
}

/**
 * Removes every file part except the first "resume". Text values that share a
 * name with a dropped file are kept. Returns the number of file parts removed.
 */
export function dropUnknownFiles(form: FormData): number {
  const names = new Set<string>();
  for (const [name, value] of form.entries()) {
    if (typeof value !== "string") names.add(name);
  }
  let removed = 0;
  for (const name of names) {
    const all = form.getAll(name);
    const texts = all.filter((v): v is string => typeof v === "string");
    const files = all.filter((v) => typeof v !== "string");
    const keepFiles = name === "resume" ? files.slice(0, 1) : [];
    const dropped = files.length - keepFiles.length;
    if (dropped === 0) continue;
    removed += dropped;
    form.delete(name);
    for (const t of texts) form.append(name, t);
    for (const f of keepFiles) form.append(name, f as File);
  }
  return removed;
}
