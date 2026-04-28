import { ExploreServicesButton } from "@/components/atoms/Button";
import styles from "./GrowthSection.module.css";

export function GrowthSection() {
  return (
    <section className={styles.root}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.copyWrap}>
          <h2 className={styles.title}>
            Growth feels easier when you have the right <span className={styles.growingWord}>partner.</span>
          </h2>
        </div>

        <div className={styles.side}>
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
        </div>
      </div>

      <div className={styles.banner}>
        <div className={styles.bannerOverlay} aria-hidden="true" />
        <div className={styles.bannerContent}>
          <h3 className={styles.bannerTitle}>Let&apos;s Build What&apos;s Next</h3>
          <ExploreServicesButton variant="primary" size="lg" />
        </div>
      </div>
    </section>
  );
}
