import styles from "./TestimonialCard.module.css";

type TestimonialCardProps = {
  quote: string;
  author: string;
};

export function TestimonialCard({ quote, author }: TestimonialCardProps) {
  return (
    <>
      <blockquote className={styles.quote} aria-live="polite">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <p className={styles.author}>{author}</p>
    </>
  );
}
