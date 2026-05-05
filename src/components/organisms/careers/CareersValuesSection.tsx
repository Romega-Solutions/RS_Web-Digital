import Image from "next/image";
import { ScrollReveal } from "@/components/atoms/Motion";
import styles from "./CareersValuesSection.module.css";

interface ValueItem {
  title: string;
  description: string;
  icon: string;
}

interface CareersValuesSectionProps {
  cultureValues: readonly ValueItem[];
  benefits: readonly ValueItem[];
}

export function CareersValuesSection({ cultureValues, benefits }: CareersValuesSectionProps) {
  return (
    <section className={styles.root}>
      <div className={styles.inner}>
        <div className={styles.section}>
          <ScrollReveal variant="fade" distance={20}>
            <span className={styles.label}>Our Culture</span>
            <h2 className={styles.title}>The Romega Way</h2>
            <p className={styles.copy}>
              We build more than teams—we build a culture of excellence,
              reliability, and meaningful collaboration.
            </p>
          </ScrollReveal>

          <div className={styles.grid}>
            {cultureValues.map((value, index) => (
              <ScrollReveal key={value.title} variant="scale" delay={0.1 * index} distance={0}>
                <article className={styles.card}>
                  <Image
                    src={value.icon}
                    alt=""
                    width={44}
                    height={44}
                    className={styles.icon}
                  />
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <ScrollReveal variant="fade" distance={20} delay={0.2}>
            <span className={styles.label}>Benefits</span>
            <h2 className={styles.title}>Why Join Us?</h2>
            <p className={styles.copy}>
              Designed for impact and flexibility, we provide the environment
              where skilled professionals can truly thrive.
            </p>
          </ScrollReveal>

          <div className={styles.grid}>
            {benefits.map((benefit, index) => (
              <ScrollReveal key={benefit.title} variant="scale" delay={0.3 + 0.1 * index} distance={0}>
                <article className={styles.card}>
                  <Image
                    src={benefit.icon}
                    alt=""
                    width={44}
                    height={44}
                    className={styles.icon}
                  />
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
