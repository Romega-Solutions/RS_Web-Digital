// Proxies a public job-application submission from romega-solutions.com
// to the RS-Tool-Ticketing-System's public endpoint. Keeps the bearer
// token and the ticketing-system URL server-side, so the browser only
// ever talks to its own origin. The checks and the forwarding live in
// lib/apply-proxy so their order can be tested.

import type { NextRequest } from "next/server";
import { handleApplyRequest } from "@/lib/apply-proxy";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ positionId: string }> },
) {
  const { positionId } = await ctx.params;
  return handleApplyRequest(req, positionId, { env: process.env, fetchImpl: fetch });
}
