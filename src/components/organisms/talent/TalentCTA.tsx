import Image from "next/image";
import { AppButton } from "@/components/atoms/Button";
import styles from "./TalentCTA.module.css";

const supportPoints = [
  "Role scoping support within 24 hours",
  "Candidate shortlist aligned to your requirements",
  "Interview scheduling and handoff coordination",
];

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
          <ul className={styles.supportList}>
            {supportPoints.map((point) => (
              <li key={point} className={styles.supportItem}>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M5 12.5 9.2 16.5 19 7.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{point}</span>
              </li>
            ))}
          </ul>
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
