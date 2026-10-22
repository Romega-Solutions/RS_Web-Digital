// Server-only data layer for the careers feed. Both the public REST
// endpoint (/api/careers/jobs) and the server-rendered Careers page use
// this so the source-of-truth Supabase query stays in one place.

import { positionApplyPath } from "@/lib/position-slug";
import { fetchOpenPositionRecords, type PublicPosition } from "@/lib/positions";
import { employmentTypeLabel, googleEmploymentType } from "@/lib/employment-type";
import { jobDescriptionContent } from "@/lib/sanitize";
import type { CareerJob } from "@/types/careers";

export type OpenPosition = CareerJob & {
  /** Sanitized HTML for JobPosting structured data. Empty when there is no description. */
  descriptionHtml: string;
};

function summaryExcerpt(title: string, excerpt: string): string {
  const trimmedTitle = title.trim();
  if (!excerpt || !trimmedTitle) return excerpt;
  if (!excerpt.toLowerCase().startsWith(trimmedTitle.toLowerCase())) return excerpt;
  const remainder = excerpt.slice(trimmedTitle.length).replace(/^[\s|:–—-]+/, "").trim();
  return remainder || excerpt;
}

function mapPosition(row: PublicPosition): OpenPosition {
  const description = jobDescriptionContent(row.job_description);
  return {
    id: String(row.id),
    title: row.job_title,
    department: row.client?.trim() || "Romega Solutions",
    location: row.location?.trim() || "Remote",
    type: employmentTypeLabel(row.employment_type),
    employmentType: googleEmploymentType(row.employment_type),
    summary: summaryExcerpt(row.job_title, description.excerpt),
    descriptionHtml: description.html,
    skills: [],
    // Public URL is the stored slug. The form still posts to /api/apply/{numeric id}.
    applyUrl: positionApplyPath(row.resolvedSlug),
  };
}

export function toPublicCareerJob(position: OpenPosition): CareerJob {
  return {
    id: position.id,
    title: position.title,
    department: position.department,
    location: position.location,
    type: position.type,
    summary: position.summary,
    skills: position.skills,
    applyUrl: position.applyUrl,
  };
}

export async function fetchOpenPositions(): Promise<OpenPosition[]> {
  const rows = await fetchOpenPositionRecords();
  return rows.map(mapPosition);
}
