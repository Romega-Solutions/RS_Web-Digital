import Image from "next/image";
import Link from "next/link";
import { formatPostDate, joinNames } from "@/lib/market-research/format";
import type { ResearchPost } from "@/lib/market-research/types";
import styles from "./ResearchPostCard.module.css";

interface ResearchPostCardProps {
  post: ResearchPost;
  /** Mark the first row's images as high priority. */
  priority?: boolean;
}

export function ResearchPostCard({ post, priority = false }: ResearchPostCardProps) {
  const href = `/market-research/${post.slug}`;

  return (
    <article className={styles.root}>
      <div className={styles.media}>
        {/* Decorative here: the card's link text already names the article. */}
        <Image
          src={post.cover.src}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1024px) 24rem, (min-width: 640px) 45vw, 100vw"
          className={styles.image}
        />
      </div>

      <div className={styles.body}>
        <div className={styles.meta}>
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          <span className={styles.authors}>
            By {joinNames(post.authors.map((author) => author.name))}
          </span>
        </div>

        <h3 className={styles.title}>
          <Link href={href} className={styles.link}>
            {post.title}
          </Link>
        </h3>

        <p className={styles.summary}>{post.summary}</p>

        <span className={styles.cta} aria-hidden="true">
          Read article <span className={styles.arrow}>→</span>
        </span>
      </div>
    </article>
  );
}
