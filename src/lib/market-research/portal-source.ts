// Server-only. Reads published Market Research posts that the intelligence
// analyst wrote in the portal (table: research_posts, same Supabase project as
// Careers). The portal writes; the website only reads.
//
// This file uses the service-role key through getTicketingSupabase(), so it
// must never reach the browser. The import below makes the build fail if a
// client component ever pulls it in.

import "server-only";
import { cache } from "react";
import { getTicketingSupabase } from "@/lib/supabase";
import { mapPortalRow, sanitizeBody } from "./portal-mapping";
import { queryPublishedRowBySlug, queryPublishedRows } from "./portal-query";
import type { ResearchPost } from "./types";

const supabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL;

// cache() de-duplicates the query within one render, so generateMetadata and
// the page share a single database call.
export const listPortalPosts = cache(async (): Promise<ResearchPost[]> => {
  const rows = await queryPublishedRows(getTicketingSupabase());
  return rows.flatMap((row) => mapPortalRow(row, supabaseUrl()) ?? []);
});

export type PortalArticle = { post: ResearchPost; html: string };

export const getPortalArticle = cache(async (slug: string): Promise<PortalArticle | null> => {
  const row = await queryPublishedRowBySlug(getTicketingSupabase(), slug);
  if (!row) return null;

  const post = mapPortalRow(row, supabaseUrl());
  if (!post) return null;

  return { post, html: sanitizeBody(row.body_html) };
});
