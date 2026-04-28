import { NextResponse } from "next/server";
import { mockCareerJobs } from "@/lib/mock-careers";

export async function GET() {
  return NextResponse.json(
    {
      jobs: mockCareerJobs,
      source: "mock",
      updatedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
