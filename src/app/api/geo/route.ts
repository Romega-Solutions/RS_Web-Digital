// Tells the Contact form which country to open its phone picker on. Reads the
// header Vercel's edge sets on every request; no third-party geo lookup. Locally
// (no header) and for unknown values it answers with the default country.

import { NextResponse, type NextRequest } from "next/server";
import { normalizeCountry } from "@/lib/form/countries";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const country = normalizeCountry(request.headers.get("x-vercel-ip-country"));
  return NextResponse.json({ country }, { headers: { "Cache-Control": "private, no-store" } });
}
