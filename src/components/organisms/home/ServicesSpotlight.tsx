import { ExploreServicesButton } from "@/components/atoms/Button";
import { ServiceCard } from "@/components/molecules/Card/ServiceCard";
import styles from "./ServicesSpotlight.module.css";

export function ServicesSpotlight() {
  return (
    <section className={styles.root}>
      <div className={styles.arrow} aria-hidden="true">
        <span className={styles.chevron} />
      </div>

      <div className={styles.inner}>
        <p className={styles.intro}>
          Whether you are building your team, refining your brand, or
          preparing for your next stage of growth, Romega Solutions brings
          the people, insight, and support to move your business forward
          with confidence.
        </p>

        <div className={styles.grid}>
          <ServiceCard
            title="Talent Solutions"
            imageSrc="/2.0%20Website%20Assets/Image%201%20_%20Talent%20Solutions.webp"
            imageAlt="Talent Solutions"
            className={styles.card}
            imageClassName={styles.image}
          />

          <ServiceCard
            title="Brand & Growth Support"
            imageSrc="/2.0%20Website%20Assets/Image%202%20_%20Brand%20%26%20Growth%20Support.webp"
            imageAlt="Brand & Growth Support"
            className={styles.card}
            imageClassName={styles.image}
          />

          <ServiceCard
            title="Strategic Operations"
            imageSrc="/2.0%20Website%20Assets/Image%203%20_%20Strategic%20Operations.webp"
            imageAlt="Strategic Operations"
            className={styles.card}
            imageClassName={styles.image}
          />
        </div>

        <ExploreServicesButton
          className={styles.button}
          href="/services"
          label="See How We Can Help"
          variant="primary"
          size="lg"
        />
      </div>
    </section>
  );
}
