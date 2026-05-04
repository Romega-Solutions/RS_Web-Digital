import Image from "next/image";
import { AppButton } from "@/components/atoms/Button";
import { ScrollReveal } from "@/components/atoms/Motion";
import styles from "./HomeHero.module.css";

type HomeHeroProps = {
  buttonHref?: string;
};

export function HomeHero({
  buttonHref = "https://calendly.com/romega-solutions/discoverycall?back=1",
}: HomeHeroProps) {
  return (
    <section className={styles.root}>
      <Image
        src="/2.0%20Website%20Assets/Hero%20Background.webp"
        alt=""
        fill
        priority
        className={styles.image}
        sizes="100vw"
        quality={85}
      />
      <div className={styles.overlay} aria-hidden="true" />

      <div className={styles.content}>
        <ScrollReveal variant="slideUp" distance={40} duration={0.8}>
          <h1 className={styles.headline}>
            <span className={`${styles.line} ${styles.lineFirst}`}>
              Built for <span className={styles.growingWord}>growing</span> businesses.
            </span>
          </h1>
        </ScrollReveal>

        <ScrollReveal variant="slideUp" distance={20} delay={0.2} duration={0.8}>
          <p className={`${styles.line} ${styles.subtitle}`}>
            Designed for <span className={styles.accent}>what&apos;s next.</span>
          </p>
        </ScrollReveal>

        <ScrollReveal variant="fade" delay={0.4} duration={1}>
          <p className={styles.copy}>
            <span className={styles.copyLine}>
              Partnering with businesses to grow teams,
            </span>
            <span className={styles.copyLine}>
              strengthen brands, and scale with confidence.
            </span>
          </p>
        </ScrollReveal>

        <ScrollReveal variant="slideUp" distance={10} delay={0.6} duration={0.8}>
          <AppButton href={buttonHref} variant="primary" size="lg" className={styles.action}>
            Book your Call today!
          </AppButton>
        </ScrollReveal>
      </div>
    </section>
  );
}
