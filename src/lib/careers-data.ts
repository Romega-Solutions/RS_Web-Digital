// Server-only data layer for the careers feed. Both the public REST
// endpoint (/api/careers/jobs) and the server-rendered Careers page use
// this so the source-of-truth Supabase query stays in one place.

import { positionApplyPath } from "@/lib/position-slug";
import { fetchOpenPositionRecords, type PublicPosition } from "@/lib/positions";
import type { CareerJob } from "@/types/careers";

function mapPosition(row: PublicPosition): CareerJob {
  return {
    id: String(row.id),
    title: row.job_title,
    department: row.client?.trim() || "Romega Solutions",
    location: row.location?.trim() || "Remote",
    type: "Full-time",
    summary: row.job_description?.trim() || "",
    skills: [],
    // Public URL is the slug. The form still posts to /api/apply/{numeric id}.
    applyUrl: positionApplyPath(row.resolvedSlug),
  };
}

export async function fetchOpenPositions(): Promise<CareerJob[]> {
  const rows = await fetchOpenPositionRecords();
  return rows.map(mapPosition);
}
