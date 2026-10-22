export type CareerJob = {
  id: string;
  title: string;
  department: string;
  location: string;
  /** Display label (e.g. "Internship"); null when the portal value is unknown. */
  type: string | null;
  /** schema.org JobPosting employmentType (e.g. "INTERN"); null to omit. */
  employmentType?: string | null;
  summary: string;
  skills: string[];
  applyUrl: string;
};
