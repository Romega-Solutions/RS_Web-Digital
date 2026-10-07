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
 * source (MDX files today, a database later) can change without touching
 * them.
 */
export type ResearchPost = {
  slug: string;
  title: string;
  /** ISO calendar date, YYYY-MM-DD. */
  date: string;
  summary: string;
  cover: {
    /** Site-relative path (/images/...) or absolute https URL. */
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  authors: PostAuthor[];
  /** Where the piece was first published, if elsewhere. */
  originalUrl?: string;
};
