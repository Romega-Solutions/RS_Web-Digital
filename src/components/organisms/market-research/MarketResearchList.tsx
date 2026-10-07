import { ResearchPostCard } from "@/components/molecules/Card/ResearchPostCard";
import type { ResearchPost } from "@/lib/market-research/types";
import styles from "./MarketResearchList.module.css";

interface MarketResearchListProps {
  posts: ResearchPost[];
}

export function MarketResearchList({ posts }: MarketResearchListProps) {
  return (
    <section className={styles.root} aria-labelledby="market-research-title">
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Market Research</p>
          <div className={styles.byline}>
            <p>Market Researchers</p>
            <p>Robbie Galoso | Founder & Industry Analyst</p>
            <p>Sarah Busto | Market Analyst</p>
          </div>
          <h1 id="market-research-title" className={styles.title}>
            Research and insights from the Romega team
          </h1>
          <p className={styles.lead}>
            Analysis of the markets, technologies, and trends shaping how
            businesses grow, written by the people who work in them every day.
          </p>
        </header>

        {posts.length > 0 ? (
          <ul className={styles.grid}>
            {posts.map((post, index) => (
              <li key={post.slug} className={styles.item}>
                <ResearchPostCard post={post} priority={index < 3} />
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.empty}>
            <p>New research is on the way. Check back soon.</p>
          </div>
        )}
      </div>
    </section>
  );
}
