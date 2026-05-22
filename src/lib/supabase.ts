// Server-only. Never import this into a "use client" component.
//
// Connects RS_Web-Digital to the shared Supabase project that backs the
// RS-Tool-Ticketing-System (Applicant Tracking System). Today this is used
// only to read open positions for the public Careers page.
//
// SECURITY NOTE: This uses the service-role key, which fully bypasses RLS.
// That mirrors how the ticketing system's own public /apply page reads the
// `positions` table (no RLS policy is currently configured for anon reads).
// The key is only used server-side inside Route Handlers — it is never
// shipped to the browser. The cleaner long-term fix is to add a Supabase
// RLS policy that allows anonymous SELECT on `positions` where
// `is_open = true`, then swap this for NEXT_PUBLIC_SUPABASE_ANON_KEY.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getTicketingSupabase(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Ticketing Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  cached = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}
