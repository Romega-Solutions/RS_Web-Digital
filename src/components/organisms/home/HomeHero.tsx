import Image from "next/image";
import { ExploreServicesButton } from "@/components/atoms/Button";
import styles from "./HomeHero.module.css";

type HomeHeroProps = {
  buttonHref?: string;
};

export function HomeHero({ buttonHref = "/services" }: HomeHeroProps) {
  return (
    <section className={styles.root}>
      <Image
        src="/2.0%20Website%20Assets/Hero%20Background.webp"
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
        quality={85}
      />
      <div className={styles.overlay} aria-hidden="true" />

      <div className={styles.content}>
        <h1 className={styles.headline}>
          <span className={`${styles.line} ${styles.lineFirst}`}>
            Built for <span className={styles.growingWord}>growing</span> businesses.
          </span>
        </h1>
        <p className={`${styles.line} ${styles.subtitle}`}>
          Designed for <span className={styles.accent}>what&apos;s next.</span>
        </p>

        <p className={styles.copy}>
          <span className={styles.copyLine}>
            Partnering with businesses to grow teams,
          </span>
          <span className={styles.copyLine}>
            strengthen brands, and scale with confidence.
          </span>
        </p>

        <ExploreServicesButton variant="primary" size="lg" href={buttonHref} />
      </div>
    </section>
  );
}
