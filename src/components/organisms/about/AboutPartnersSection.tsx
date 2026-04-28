import Image from "next/image";
import styles from "./AboutPartnersSection.module.css";

export function AboutPartnersSection() {
  return (
    <section className={styles.root} aria-labelledby="about-partners-title">
      <div className={styles.inner}>
        <h2 id="about-partners-title" className={styles.title}>
          Who We Partner With
        </h2>

        <div className={styles.copy}>
          <p>
            We work with founders, executives, and growing teams from startups to
            established organizations, all who share one thing in common: a
            commitment to build growth that&apos;s intentional, confident, and strategic.
          </p>
          <p>
            Whether you&apos;re expanding into new markets, building internal
            capabilities, or strengthening your brand identity,{" "}
            <strong>Romega stands with you as a growth partner.</strong>
          </p>
        </div>

        <div className={styles.map} aria-label="Romega partner regions">
          <Image
            src="/map.webp"
            alt="World map showing Romega partner regions"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
            className={styles.world}
            priority={false}
          />
        </div>
      </div>
    </section>
  );
}
