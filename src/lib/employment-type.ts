// Portal positions.employment_type → website label and schema.org JobPosting
// employmentType. Unknown or empty values return null: the card shows no type
// badge and the structured data omits employmentType. Never defaults to Full-time.

export type PortalEmploymentType = "full_time" | "part_time" | "contractual" | "internship";

const LABELS: Record<PortalEmploymentType, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contractual: "Contractual",
  internship: "Internship",
};

// https://developers.google.com/search/docs/appearance/structured-data/job-posting
const GOOGLE_TYPES: Record<PortalEmploymentType, string> = {
  full_time: "FULL_TIME",
  part_time: "PART_TIME",
  contractual: "CONTRACTOR",
  internship: "INTERN",
};

function normalize(value: string | null | undefined): PortalEmploymentType | null {
  const v = (value ?? "").trim();
  return Object.prototype.hasOwnProperty.call(LABELS, v) ? (v as PortalEmploymentType) : null;
}

/** Card label, or null when the value is unknown/empty (logs a warning for unknown). */
export function employmentTypeLabel(value: string | null | undefined): string | null {
  const t = normalize(value);
  if (!t && value != null && value.trim() !== "") {
    console.warn(`[careers] unknown employment_type "${value}"; hiding the type badge.`);
  }
  return t ? LABELS[t] : null;
}

/** Google JobPosting employmentType, or null to omit it. */
export function googleEmploymentType(value: string | null | undefined): string | null {
  const t = normalize(value);
  return t ? GOOGLE_TYPES[t] : null;
}
