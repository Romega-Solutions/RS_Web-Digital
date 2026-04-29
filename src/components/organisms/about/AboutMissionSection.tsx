import Image from "next/image";
import styles from "./AboutMissionSection.module.css";

export function AboutMissionSection() {
  return (
    <section className={styles.root} aria-labelledby="about-mission-title">
      <div className={styles.inner}>
        <div className={styles.grid} aria-hidden="true" />

        <div className={styles.heading}>
          <h2 id="about-mission-title" className={styles.title}>
            Why We <em>Do</em>
            <br />
            What We <em>Do</em>
          </h2>
        </div>

        <div className={`${styles.photo} ${styles.photoMain}`}>
          <Image
            src="/why-1.webp"
            alt="Team members reviewing work at a computer"
            fill
            sizes="(max-width: 767px) 100vw, 44vw"
            className={styles.image}
          />
        </div>

        <div className={`${styles.photo} ${styles.photoMid}`}>
          <Image
            src="/why-2.webp"
            alt="Two team members collaborating over a laptop"
            fill
            sizes="(max-width: 767px) 48vw, 15rem"
            className={styles.image}
          />
        </div>

        <div className={`${styles.photo} ${styles.photoLow}`}>
          <Image
            src="/why-3.webp"
            alt="A team discussing work around a laptop"
            fill
            sizes="(max-width: 767px) 52vw, 16rem"
            className={styles.image}
          />
        </div>

        <div className={styles.copy}>
          <p>
            We believe businesses grow best when people, purpose, and clarity
            are aligned. Too often, momentum stalls not because opportunity is
            missing, but because teams, systems, and brand direction are moving
            out of sync.
          </p>
          <p>
            <strong>
              Romega exists to help founders, leaders, and teams grow with more
              structure, confidence, and intention, not constant catch-up.
            </strong>
          </p>
        </div>

        <div className={styles.statement}>
          <p>
            Our <em>mission</em> is to help businesses grow with stronger teams,
            clearer direction, and support that lasts.
          </p>
        </div>
      </div>
    </section>
  );
}
