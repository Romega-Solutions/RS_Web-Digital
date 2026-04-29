import Image from "next/image";
import { AppButton } from "@/components/atoms/Button";
import styles from "./AboutVisionSection.module.css";

export function AboutVisionSection() {
  return (
    <section className={styles.root} aria-labelledby="about-vision-title">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h2 id="about-vision-title" className={styles.title}>
            Our Vision
          </h2>
          <p className={styles.text}>
            We want to help businesses scale with clarity, consistency, and
            purpose by building teams that perform well, brands people trust,
            and growth that holds up over time.
          </p>
          <AppButton href="/services" variant="primary" size="md" className={styles.button}>
            Explore Our Services
          </AppButton>
        </div>

        <div className={styles.photoFrame}>
          <Image
            src="/vision-1.webp"
            alt="A professional working from a laptop"
            fill
            sizes="(max-width: 767px) 100vw, 42vw"
            className={styles.photo}
          />
        </div>
      </div>
    </section>
  );
}
