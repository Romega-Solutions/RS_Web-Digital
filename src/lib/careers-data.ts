// Server-only data layer for the careers feed. Both the public REST
// endpoint (/api/careers/jobs) and the server-rendered Careers page use
// this so the source-of-truth Supabase query stays in one place.

import { jobDescriptionContent } from "@/lib/sanitize";
import { getTicketingSupabase } from "@/lib/supabase";
import type { CareerJob } from "@/types/careers";

export type OpenPosition = CareerJob & {
  /** Sanitized HTML for JobPosting structured data. Empty when there is no description. */
  descriptionHtml: string;
};

type PositionRow = {
  id: number;
  job_title: string;
  client: string | null;
  location: string | null;
  job_description: string | null;
  is_open: boolean;
  created_at: string;
};

function summaryExcerpt(title: string, excerpt: string): string {
  const trimmedTitle = title.trim();
  if (!excerpt || !trimmedTitle) return excerpt;
  if (!excerpt.toLowerCase().startsWith(trimmedTitle.toLowerCase())) return excerpt;
  const remainder = excerpt.slice(trimmedTitle.length).replace(/^[\s|:–—-]+/, "").trim();
  return remainder || excerpt;
}

function mapPosition(row: PositionRow): OpenPosition {
  const description = jobDescriptionContent(row.job_description);
  return {
    id: String(row.id),
    title: row.job_title,
    department: row.client?.trim() || "Romega Solutions",
    location: row.location?.trim() || "Remote",
    type: "Full-time",
    summary: summaryExcerpt(row.job_title, description.excerpt),
    descriptionHtml: description.html,
    skills: [],
    // Same-domain apply page; src/app/apply/[positionId] renders the
    // position from Supabase and posts the application to the
    // ticketing system via /api/apply/[positionId].
    applyUrl: `/apply/${row.id}`,
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
  const supabase = getTicketingSupabase();
  const { data, error } = await supabase
    .from("positions")
    .select("id, job_title, client, location, job_description, is_open, created_at")
    .eq("is_open", true)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);

  return (data as PositionRow[] | null)?.map(mapPosition) ?? [];
}
