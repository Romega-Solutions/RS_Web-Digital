// When a form field is shown in red. One rule for every field on Apply and
// Contact, so a field is red only while its current value is wrong.
//
// - blur:   red only if the field has content and the content is invalid.
//           An empty field is never made red by a blur; if a submit attempt
//           already flagged it, it stays flagged until the visitor edits it.
// - submit: every invalid field is red, including empty required ones.
// - edit:   any change clears the field; the next blur or submit decides again.

export type FieldEvent = "blur" | "submit" | "edit";

/** The rule returns an error message for a value (including the "Enter ..." one for empty), or undefined. */
export type FieldRule = (value: string) => string | undefined;

/** `current` is the error the field shows now; only a blur on an empty field keeps it. */
export function fieldError(
  event: FieldEvent,
  value: string,
  rule: FieldRule,
  current?: string,
): string | undefined {
  if (event === "edit") return undefined;
  if (event === "blur" && value.trim() === "") return current;
  return rule(value);
}
