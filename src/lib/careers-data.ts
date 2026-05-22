// Server-only data layer for the careers feed. Both the public REST
// endpoint (/api/careers/jobs) and the server-rendered Careers page use
// this so the source-of-truth Supabase query stays in one place.

import { getTicketingSupabase } from "@/lib/supabase";
import type { CareerJob } from "@/types/careers";

type PositionRow = {
  id: number;
  job_title: string;
  client: string | null;
  location: string | null;
  job_description: string | null;
  is_open: boolean;
  created_at: string;
};

function mapPosition(row: PositionRow): CareerJob {
  return {
    id: String(row.id),
    title: row.job_title,
    department: row.client?.trim() || "Romega Solutions",
    location: row.location?.trim() || "Remote",
    type: "Full-time",
    summary: row.job_description?.trim() || "",
    skills: [],
    // Same-domain apply page; src/app/apply/[positionId] renders the
    // position from Supabase and posts the application to the
    // ticketing system via /api/apply/[positionId].
    applyUrl: `/apply/${row.id}`,
  };
}

export async function fetchOpenPositions(): Promise<CareerJob[]> {
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
