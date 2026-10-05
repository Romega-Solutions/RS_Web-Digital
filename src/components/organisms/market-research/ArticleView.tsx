import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPostDate } from "@/lib/market-research/format";
import type { ResearchPost } from "@/lib/market-research/types";
import styles from "./ArticleView.module.css";

export type ArticleAuthor = {
  name: string;
  href?: string;
};

interface ArticleViewProps {
  post: ResearchPost;
  authors: ArticleAuthor[];
  /** The compiled article body. */
  children: ReactNode;
}

function sourceLabel(url: string): string {
  const host = new URL(url).hostname.replace(/^www\./, "");
  return host.endsWith("substack.com") ? "Substack" : host;
}

function AuthorName({ author }: { author: ArticleAuthor }) {
  if (!author.href) return <>{author.name}</>;
  return (
    <a href={author.href} target="_blank" rel="noopener noreferrer" className={styles.authorLink}>
      {author.name}
    </a>
  );
}

export function ArticleView({ post, authors, children }: ArticleViewProps) {
  return (
    <article className={styles.root}>
      <div className={styles.inner}>
        <Link href="/market-research" className={styles.back}>
          <span aria-hidden="true">←</span> All research
        </Link>

        <header className={styles.header}>
          <h1 className={styles.title}>{post.title}</h1>
          <p className={styles.meta}>
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            <span aria-hidden="true" className={styles.dot}>
              •
            </span>
            <span>
              By{" "}
              {authors.map((author, index) => (
                <span key={author.name}>
                  {index > 0 ? (index === authors.length - 1 ? " and " : ", ") : null}
                  <AuthorName author={author} />
                </span>
              ))}
            </span>
          </p>
        </header>

        <figure className={styles.cover}>
          <Image
            src={post.cover.src}
            alt={post.cover.alt}
            width={post.cover.width}
            height={post.cover.height}
            priority
            sizes="(min-width: 1024px) 64rem, 100vw"
            className={styles.coverImage}
          />
        </figure>

        <div className={styles.body}>{children}</div>

        <footer className={styles.footer}>
          {post.originalUrl ? (
            <p className={styles.original}>
              Originally published on{" "}
              <a href={post.originalUrl} target="_blank" rel="noopener noreferrer">
                {sourceLabel(post.originalUrl)}
              </a>
              .
            </p>
          ) : null}
          <Link href="/market-research" className={styles.backButton}>
            <span aria-hidden="true">←</span> Back to Market Research
          </Link>
        </footer>
      </div>
    </article>
  );
}
