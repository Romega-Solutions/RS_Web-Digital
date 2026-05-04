import { AppButton } from "@/components/atoms/Button";
import { ServiceCard } from "@/components/molecules/Card/ServiceCard";
import { ScrollReveal } from "@/components/atoms/Motion";
import styles from "./ServicesSpotlight.module.css";

export function ServicesSpotlight() {
  return (
    <section className={styles.root}>
      <div className={styles.arrow} aria-hidden="true">
        <span className={styles.chevron} />
      </div>

      <div className={styles.inner}>
        <ScrollReveal variant="fade" duration={0.8} className="w-full">
          <p className={styles.intro}>
            Whether you are building your team, refining your brand, or
            preparing for your next stage of growth, Romega Solutions brings
            the people, insight, and support to move your business forward
            with confidence.
          </p>
        </ScrollReveal>

        <div className={styles.grid}>
          <ScrollReveal variant="scale" delay={0.1}>
            <ServiceCard
              title="Talent Solutions"
              description="Find aligned people who strengthen your team and support long-term growth."
              imageSrc="/2.0%20Website%20Assets/Image%201%20_%20Talent%20Solutions.webp"
              imageAlt="Talent Solutions"
              href="/services#talent-solutions"
              className={styles.card}
              imageClassName={styles.image}
            />
          </ScrollReveal>

          <ScrollReveal variant="scale" delay={0.2}>
            <ServiceCard
              title="Brand & Growth Support"
              description="Clarify your message, sharpen your presence, and build trust faster."
              imageSrc="/2.0%20Website%20Assets/Image%202%20_%20Brand%20%26%20Growth%20Support.webp"
              imageAlt="Brand & Growth Support"
              href="/services#brand-growth-support"
              className={styles.card}
              imageClassName={styles.image}
            />
          </ScrollReveal>

          <ScrollReveal variant="scale" delay={0.3}>
            <ServiceCard
              title="Strategic Operations"
              description="Bring structure to the moving parts behind growth, delivery, and execution."
              imageSrc="/2.0%20Website%20Assets/Image%203%20_%20Strategic%20Operations.webp"
              imageAlt="Strategic Operations"
              href="/services#strategic-operations"
              className={styles.card}
              imageClassName={styles.image}
            />
          </ScrollReveal>
        </div>

        <ScrollReveal variant="slideUp" delay={0.4} distance={20}>
          <AppButton className={styles.button} href="/services" variant="primary" size="lg">
            See How We Can Help
          </AppButton>
        </ScrollReveal>
      </div>
    </section>
  );
}
