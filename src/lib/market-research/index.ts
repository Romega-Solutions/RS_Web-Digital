// Server-only. The single entry point for Market Research content. Pages,
// metadata and the sitemap call only these functions and use only the
// ResearchPost shape.
//
// Two sources are joined here: MDX files in the repo, and posts the analyst
// publishes from the portal (research_posts). When a slug exists in both, the
// portal post wins. If the portal cannot be read (not configured, or the
// database is down), the MDX posts are still served, like the Careers feed
// degrades to an empty list instead of failing the page.

import { TEAM_MEMBERS } from "@/lib/constants";
import { listMdxPosts } from "./mdx-source";
import { mergePosts } from "./portal-mapping";
import { getPortalArticle, listPortalPosts } from "./portal-source";
import type { ArticleBody, PostAuthor, ResearchPost } from "./types";

export type { ArticleBody, PostAuthor, ResearchPost } from "./types";
export { formatPostDate, joinNames } from "./format";

function logPortalProblem(action: string, error: unknown) {
  console.error(
    `[market-research] couldn't ${action} from the portal:`,
    error instanceof Error ? error.message : error,
  );
}

/** All published posts from both sources, newest first. */
export async function getAllPosts(): Promise<ResearchPost[]> {
  const mdxPosts = listMdxPosts();

  let portalPosts: ResearchPost[] = [];
  try {
    portalPosts = await listPortalPosts();
  } catch (error) {
    logPortalProblem("load posts", error);
  }

  return mergePosts(mdxPosts, portalPosts);
}

export type Article = { post: ResearchPost; body: ArticleBody };

/**
 * One article, or null if there is no published post with that slug. A draft,
 * an unpublished post and a deleted post all come back as null, so the page
 * can return a 404.
 */
export async function getArticle(slug: string): Promise<Article | null> {
  try {
    const portal = await getPortalArticle(slug);
    if (portal) return { post: portal.post, body: { kind: "html", html: portal.html } };
  } catch (error) {
    logPortalProblem(`load "${slug}"`, error);
  }

  const post = listMdxPosts().find((candidate) => candidate.slug === slug);
  return post ? { post, body: { kind: "mdx" } } : null;
}

/** The profile link for an author: an explicit url, else the team member's LinkedIn. */
export function getAuthorHref(author: PostAuthor): string | undefined {
  if (author.url) return author.url;
  if (!author.teamId) return undefined;
  return TEAM_MEMBERS.find((member) => member.id === author.teamId)?.linkedin;
}
