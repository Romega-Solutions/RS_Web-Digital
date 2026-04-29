import { AppButton } from "@/components/atoms/Button";
import { ScrollReveal } from "@/components/atoms/Motion";
import { ActionCluster } from "@/components/molecules/actions/ActionCluster";
import styles from "./GrowthSection.module.css";

export function GrowthSection() {
  return (
    <section className={styles.root}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.inner}>
        <ScrollReveal variant="slideRight" className={styles.copyWrap}>
          <h2 className={styles.title}>
            Growth feels easier when you have the right <span className={styles.growingWord}>partner.</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal variant="slideUp" delay={0.2} className={styles.side}>
          <div className={styles.media} aria-hidden="true">
            <video
              className={styles.video}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/growth.png"
            >
              <source src="/romega-video-web.mp4" type="video/mp4" />
            </video>
          </div>
          <p className={styles.text}>
            We work alongside founders and leaders who want to scale
            without chaos. <strong>From talent and operations to brand support,</strong>
            Romega brings structure, perspective, and steady guidance so
            growth feels intentional, not overwhelming.
          </p>
        </ScrollReveal>
      </div>

      <ScrollReveal variant="fade" delay={0.3} className={styles.banner}>
        <div className={styles.bannerOverlay} aria-hidden="true" />
        <div className={styles.bannerContent}>
          <h3 className={styles.bannerTitle}>Let&apos;s Build What&apos;s Next</h3>
          <ActionCluster align="center" className={styles.bannerActions}>
            <AppButton href="/services" variant="primary" size="lg">
              Explore Our Services
            </AppButton>
          </ActionCluster>
        </div>
      </ScrollReveal>
    </section>
  );
}
