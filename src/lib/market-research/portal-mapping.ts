// Pure helpers for posts written in the portal (table: research_posts in the
// ticketing Supabase project). No Node APIs, no Supabase client, no "@/"
// imports, so the safety rules here can be unit tested on their own.

import sanitizeHtml from "sanitize-html";
import type { ResearchPost } from "./types";

/** The columns the website reads. The portal fills every one before it lets a post go live. */
export type PortalRow = {
  slug: string;
  title: string;
  summary: string | null;
  cover_image_path: string | null;
  author_name: string | null;
  published_at: string | null;
  updated_at?: string | null;
  body_html?: string | null;
};

export const DEFAULT_AUTHOR = "Romega Solutions";

const FONT_SIZE = /^\d+(?:\.\d+)?(?:px|pt|em|rem|%)$/;

/**
 * Cleans the article HTML before it is rendered. The portal already sanitizes
 * on save, but the website must not trust the database: this is the same
 * allowlist the portal uses (RS-Tool-Ticketing-System src/lib/sanitize.ts), so
 * a row edited some other way still cannot reach a visitor as a script.
 * Idempotent, so running it on already-clean HTML changes nothing.
 */
export function sanitizeBody(html: string | null | undefined): string {
  return sanitizeHtml(html ?? "", {
    allowedTags: [
      "p", "br", "strong", "b", "em", "i", "u", "s", "strike",
      "ul", "ol", "li", "blockquote", "h1", "h2", "h3", "code", "pre",
      "span", "a",
    ],
    allowedAttributes: { a: ["href", "target", "rel"], span: ["style"] },
    allowedStyles: { "*": { "font-size": [FONT_SIZE] } },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      // The page already has its own h1 (the post title), so an h1 in the
      // body would give the page two. Demote it.
      h1: "h2",
      a: (_tag, attribs) => ({
        tagName: "a",
        attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer nofollow" },
      }),
    },
  });
}

/** Public URL of a cover in the research-covers bucket, or null if it cannot be built. */
export function researchCoverUrl(path: string | null | undefined, supabaseUrl: string | undefined): string | null {
  if (!path || !supabaseUrl) return null;
  const base = supabaseUrl.trim().replace(/\/+$/, "");
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${base}/storage/v1/object/public/research-covers/${encoded}`;
}

/**
 * Maps a published row to the shape the pages use. Returns null for a row the
 * website cannot show properly (no publish date, or no cover): the portal
 * blocks both, so this only guards against a row edited by hand.
 */
export function mapPortalRow(row: PortalRow, supabaseUrl: string | undefined): ResearchPost | null {
  const coverSrc = researchCoverUrl(row.cover_image_path, supabaseUrl);
  const published = row.published_at ? new Date(row.published_at) : null;
  if (!coverSrc || !published || Number.isNaN(published.getTime())) return null;

  const publishedAt = published.toISOString();
  return {
    slug: row.slug,
    title: row.title,
    date: publishedAt.slice(0, 10),
    publishedAt,
    ...(row.updated_at ? { updatedAt: new Date(row.updated_at).toISOString() } : {}),
    summary: row.summary?.trim() ?? "",
    // The portal stores no alt text, so the cover is treated as decorative
    // (the title sits right next to it).
    cover: { src: coverSrc, alt: "" },
    authors: [{ name: row.author_name?.trim() || DEFAULT_AUTHOR }],
    origin: "portal",
  };
}

/** Newest first; ties broken by title so the order is stable. */
export function sortPosts(posts: ResearchPost[]): ResearchPost[] {
  return [...posts].sort(
    (a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.title.localeCompare(b.title),
  );
}

/** Merges two sources. When a slug appears in both, the portal post wins. */
export function mergePosts(mdxPosts: ResearchPost[], portalPosts: ResearchPost[]): ResearchPost[] {
  const bySlug = new Map<string, ResearchPost>();
  for (const post of mdxPosts) bySlug.set(post.slug, post);
  for (const post of portalPosts) bySlug.set(post.slug, post);
  return sortPosts([...bySlug.values()]);
}
