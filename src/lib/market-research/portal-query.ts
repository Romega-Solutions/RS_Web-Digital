// The Supabase queries for portal posts. They take the client as an argument
// so a test can hand in a fake and prove the rule that matters most: EVERY
// query filters on published = true. The website reads with the service-role
// key, which skips database security, so this filter is the only thing that
// keeps drafts private.
//
// Pure: no "@/" imports and no env access. portal-source.ts wires in the real
// client.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { PortalRow } from "./portal-mapping";

export type PortalClient = Pick<SupabaseClient, "from">;

const TABLE = "research_posts";
const LIST_COLUMNS = "slug, title, summary, cover_image_path, author_name, published_at, updated_at";

/** Published posts, newest first. Used by the listing, the sitemap and generateStaticParams. */
export async function queryPublishedRows(client: PortalClient): Promise<PortalRow[]> {
  const { data, error } = await client
    .from(TABLE)
    .select(LIST_COLUMNS)
    .eq("published", true) // REQUIRED: keeps drafts off the site
    .order("published_at", { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);
  return (data ?? []) as PortalRow[];
}

/** One published post with its body, or null for a missing, unpublished or deleted post. */
export async function queryPublishedRowBySlug(client: PortalClient, slug: string): Promise<PortalRow | null> {
  const { data, error } = await client
    .from(TABLE)
    .select(`${LIST_COLUMNS}, body_html`)
    .eq("slug", slug)
    .eq("published", true) // REQUIRED: a draft's slug must 404
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as PortalRow | null) ?? null;
}
