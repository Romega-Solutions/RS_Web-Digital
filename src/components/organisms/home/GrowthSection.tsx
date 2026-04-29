import { AppButton } from "@/components/atoms/Button";
import { ScrollReveal } from "@/components/atoms/Motion";
import { ActionCluster } from "@/components/molecules/actions/ActionCluster";
import styles from "./GrowthSection.module.css";

const growthFocusAreas = [
  "Talent support",
  "Operational clarity",
  "Brand guidance",
] as const;

export function GrowthSection() {
  return (
    <section id="growth-section" className={styles.root}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.contentGrid}>
          <div className={styles.copyWrap}>
            <ScrollReveal variant="slideRight">
              <div className={styles.eyebrowRow}>
                <span className={styles.eyebrowLine} aria-hidden="true" />
                <p className={styles.eyebrow}>Growth support for founders and leadership teams</p>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="slideRight" delay={0.08}>
              <h2 className={styles.title}>
                Growth feels easier when you have the right <span className={styles.growingWord}>partner.</span>
              </h2>
            </ScrollReveal>

            <ScrollReveal variant="fade" delay={0.16}>
              <p className={styles.text}>
                We work alongside founders and leaders who want to scale without
                chaos. From talent and operations to brand support, Romega
                brings structure, perspective, and steady guidance so growth
                feels intentional, not overwhelming.
              </p>
            </ScrollReveal>

            <ScrollReveal variant="fade" delay={0.2}>
              <p className={styles.supportNote}>
                Support designed around your stage, priorities, and pace of growth.
              </p>
            </ScrollReveal>

            <ScrollReveal variant="slideUp" delay={0.22} className={styles.focusList}>
              {growthFocusAreas.map((area) => (
                <p key={area} className={styles.focusItem}>
                  {area}
                </p>
              ))}
            </ScrollReveal>
          </div>

          <ScrollReveal variant="slideUp" delay={0.2} className={styles.side}>
            <div className={styles.media}>
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
              <div className={styles.mediaOverlay} aria-hidden="true" />
            </div>
            <p className={styles.mediaNote}>
              A steadier way to scale, across talent, operations, and brand.
            </p>
          </ScrollReveal>
        </div>
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
