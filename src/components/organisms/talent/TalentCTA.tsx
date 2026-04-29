import Image from "next/image";
import { AppButton } from "@/components/atoms/Button";
import styles from "./TalentCTA.module.css";

export function TalentCTA() {
  return (
    <section className={styles.root} aria-labelledby="talent-cta-heading">
      <div className={styles.card}>
        <div className={styles.left}>
          <h2 id="talent-cta-heading" className={styles.title}>
            Request a Custom Talent Search
          </h2>
          <p className={styles.copy}>
            If you are hiring for a role that is harder to define, we can narrow the
            brief, source the right profile, and guide the next conversation.
          </p>
          <div className={styles.actions}>
            <AppButton
              href="/contact"
              variant="primary"
              size="md"
              className={styles.actionPrimary}
            >
              Contact us
            </AppButton>
            <AppButton
              href="/services"
              variant="outline"
              size="md"
              className={styles.actionSecondary}
            >
              Explore services
            </AppButton>
          </div>
        </div>

        <div className={styles.divider} aria-hidden="true" />

        <div className={styles.right}>
          <div className={styles.avatarWrap}>
            <Image
              src="/images/about/IC/IC_CEO_Robbie.png"
              alt="Sir Robbie"
              fill
              sizes="96px"
              className={styles.avatar}
            />
          </div>
          <p className={styles.expertLabel}>YOUR EXPERT</p>
          <p className={styles.expertName}>Romega Talent Team</p>
          <p className={styles.expertTitle}>Talent Matching and Growth Support</p>
        </div>
      </div>
    </section>
  );
}
