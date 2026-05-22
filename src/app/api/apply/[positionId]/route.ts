// Proxies a public job-application submission from romega-solutions.com
// to the RS-Tool-Ticketing-System's public endpoint. Keeps the bearer
// token and the ticketing-system URL server-side, so the browser only
// ever talks to its own origin.

import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const TICKETING_APP_URL = (
  process.env.TICKETING_APP_URL || "http://localhost:3000"
).replace(/\/+$/, "");

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ positionId: string }> },
) {
  const token = process.env.PUBLIC_APPLICATIONS_TOKEN;
  if (!token) {
    return NextResponse.json(
      { ok: false, code: "NOT_CONFIGURED", error: "Applications are temporarily unavailable." },
      { status: 503 },
    );
  }

  const { positionId: rawId } = await ctx.params;
  const positionId = Number.parseInt(rawId, 10);
  if (!Number.isInteger(positionId) || positionId <= 0) {
    return NextResponse.json(
      { ok: false, code: "INVALID_POSITION", error: "Invalid position id" },
      { status: 400 },
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { ok: false, code: "BAD_REQUEST", error: "Expected multipart/form-data" },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(
      `${TICKETING_APP_URL}/api/public/applications/${positionId}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
        // Don't cache application submissions, and don't reuse a stale agent.
        cache: "no-store",
      },
    );

    const text = await upstream.text();
    // Pass through whatever the upstream returned, preserving status.
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error(
      "[RS_Web-Digital /api/apply] forward to ticketing failed:",
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json(
      { ok: false, code: "UPSTREAM_ERROR", error: "Couldn't reach the application service. Please try again in a moment." },
      { status: 502 },
    );
  }
}
