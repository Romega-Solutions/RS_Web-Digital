import { AppButton } from "@/components/atoms/Button";
import Image from "next/image";
import styles from "./ConsultationBanner.module.css";

export function ConsultationBanner() {
  return (
    <section className={styles.root}>
      <div className={styles.media} aria-hidden="true">
        <Image
          src="/2.0%20Website%20Assets/3.webp"
          alt=""
          fill
          sizes="100vw"
          className={styles.image}
        />
      </div>
      <div className={styles.overlay} aria-hidden="true" />

      <div className={styles.content}>
        <h2 className={styles.title}>
          Ready to grow with{" "}
          <span className={styles.emphasis}>intention?</span>
        </h2>

        <p className={styles.copy}>
          Let&apos;s build your teams, strengthen your brand, and design systems
          that help you scale with confidence.
        </p>

        <AppButton 
          href="/contact" 
          variant="primary" 
          size="lg" 
          className={styles.button}
        >
          Schedule a Consultation
        </AppButton>
      </div>
    </section>
  );
}
