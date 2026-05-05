import Image from "next/image";
import { AppButton } from "@/components/atoms/Button";
import styles from "./ServicesHero.module.css";

export function ServicesHero() {
  return (
    <section className={styles.root}>
      <div className={styles.media}>
        <Image
          src="/2.0%20Website%20Assets/2.webp"
          alt=""
          fill
          priority
          className={styles.image}
        />
      </div>
      <div className={styles.overlay} aria-hidden="true" />

      <div className={styles.inner}>
        <h1 className={styles.title}>
          Built for <span className={styles.highlight}>Connection,</span>
          <br />
          Designed for <span className={styles.highlight}>Impact</span>
        </h1>

        <p className={styles.copy}>
          Tailored support in talent acquisition, brand foundation, and
          strategic operations to help your business scale with intention.
        </p>

        <AppButton 
          href="/contact" 
          variant="primary" 
          size="lg"
          className={styles.button}
        >
          Book a Growth Consultation
        </AppButton>
      </div>
    </section>
  );
}
