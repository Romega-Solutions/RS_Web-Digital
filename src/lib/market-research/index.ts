// Server-only. The single entry point for Market Research content. Pages,
// metadata and the sitemap call only these functions and use only the
// ResearchPost shape, so the source behind them (MDX files today) can be
// swapped for the portal's research_posts table without touching them.

import { TEAM_MEMBERS } from "@/lib/constants";
import { listMdxPosts } from "./mdx-source";
import type { PostAuthor, ResearchPost } from "./types";

export type { PostAuthor, ResearchPost } from "./types";
export { formatPostDate, joinNames } from "./format";

/** All published posts, newest first. */
export async function getAllPosts(): Promise<ResearchPost[]> {
  return listMdxPosts();
}

export async function getPostBySlug(slug: string): Promise<ResearchPost | null> {
  const posts = await getAllPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

/** The profile link for an author: an explicit url, else the team member's LinkedIn. */
export function getAuthorHref(author: PostAuthor): string | undefined {
  if (author.url) return author.url;
  if (!author.teamId) return undefined;
  return TEAM_MEMBERS.find((member) => member.id === author.teamId)?.linkedin;
}
