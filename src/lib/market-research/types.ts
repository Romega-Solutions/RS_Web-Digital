export type PostAuthor = {
  name: string;
  /** Id of a person in TEAM_MEMBERS; their LinkedIn is used as the link. */
  teamId?: string;
  /** Explicit profile link. Wins over the team member's LinkedIn. */
  url?: string;
};

/**
 * Everything the listing, the article header, the metadata and the sitemap
 * need about a post. This is the only shape the pages depend on, so the
 * source (MDX files or the portal's research_posts table) can change without
 * touching them.
 */
export type ResearchPost = {
  slug: string;
  title: string;
  /** ISO calendar date (UTC), YYYY-MM-DD, shown to readers. */
  date: string;
  /** Full ISO timestamp, used for ordering. MDX posts use noon UTC of `date`. */
  publishedAt: string;
  /** When the post was last edited, if the source knows. */
  updatedAt?: string;
  summary: string;
  cover: {
    /** Site-relative path (/images/...) or absolute https URL. */
    src: string;
    alt: string;
    /** Intrinsic size, when known. Portal covers do not store one. */
    width?: number;
    height?: number;
  };
  authors: PostAuthor[];
  /** Where the piece was first published, if elsewhere. */
  originalUrl?: string;
  /** Which source the post came from. */
  origin: "mdx" | "portal";
};

/** How an article body is rendered. */
export type ArticleBody =
  | { kind: "mdx" }
  /** HTML that has already been sanitized and is safe to render. */
  | { kind: "html"; html: string };
