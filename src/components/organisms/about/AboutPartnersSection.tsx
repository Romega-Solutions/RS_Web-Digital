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
            We work with founders, executives, and growing teams, from startups
            to established organizations, who share one common goal: building
            growth that feels intentional, confident, and well-directed.
          </p>
          <p>
            Whether you&apos;re entering new markets, building internal
            capability, or strengthening your brand,{" "}
            <strong>Romega works alongside you as a growth partner.</strong>
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
