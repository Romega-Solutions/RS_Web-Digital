import { NextResponse } from "next/server";

const JOBS_API_URL =
  process.env.JOBS_API_URL ||
  "https://script.google.com/macros/s/AKfycbwuPSsnmiz2B2lBIbmhWcJwQ35nrPCtdR0DXjrK7dhWvGaXuoin4rs5LhkEUpWBud0f6A/exec";

const MAX_RETRIES = 2;
const TIMEOUT_MS = 30000;

export async function GET() {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(JOBS_API_URL, {
        method: "GET",
        headers: { Accept: "application/json", "User-Agent": "Romega-Digital/1.0" },
        next: { revalidate: 300 },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`Jobs API responded with ${response.status}`);

      const data = (await response.json()) as unknown;
      const jobs = Array.isArray(data) ? data : [];

      return NextResponse.json(
        { jobs, updatedAt: new Date().toISOString() },
        { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
      );
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");
      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  console.error("[RS_Web-Digital /api/careers/jobs] All retries failed:", lastError?.message);

  return NextResponse.json(
    { jobs: [], updatedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
