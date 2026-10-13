import { NextResponse } from "next/server";
import { fetchOpenPositions, toPublicCareerJob } from "@/lib/careers-data";

export async function GET() {
  try {
    const jobs = (await fetchOpenPositions()).map(toPublicCareerJob);
    return NextResponse.json(
      { jobs, updatedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
    );
  } catch (err) {
    console.error(
      "[RS_Web-Digital /api/careers/jobs] Failed to load positions:",
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json(
      { jobs: [], updatedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}
