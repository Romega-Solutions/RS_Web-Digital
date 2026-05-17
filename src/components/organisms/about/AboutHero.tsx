import Image from "next/image";
import { AppButton } from "@/components/atoms/Button";
import styles from "./AboutHero.module.css";

export function AboutHero() {
  return (
    <section className={styles.root}>
      <div className={styles.inner}>
        <div className={styles.photoFrame}>
          <Image
            src="/prompt-images/about/1_hero.png"
            alt="Romega team collaborating around a table"
            fill
            priority
            sizes="(max-width: 767px) 100vw, 36vw"
            className={styles.photo}
          />
        </div>

        <div className={styles.copy}>
          <div className={styles.eyebrowRow}>
            <span className={styles.eyebrowLine} aria-hidden="true" />
            <p className={styles.eyebrow}>About Romega Solutions</p>
          </div>

          <h1 className={styles.title}>
            <span className={styles.titleLine}>
              Built on <span className={styles.highlight}>Purpose,</span>
            </span>
            <span className={styles.titleLine}>
              Driven by <span className={styles.highlight}>People</span>
            </span>
          </h1>

          <div className={styles.text}>
            <p>
              Romega Solutions was founded on one simple belief:
              <strong> growth should feel clear, connected, and sustainable.</strong>
              {" "}
              Many businesses face the same challenge at once: finding the
              right people, clarifying their message, and keeping operations
              aligned. We built Romega to bring those moving parts together in
              one practical approach to growth.
            </p>

            <p>
              What started by connecting Philippine-based talent with global
              opportunity has grown into broader support for businesses
              worldwide. Today, we help teams scale with people-first strategy,
              stronger brand direction, and operational support that keeps
              progress steady.
            </p>
          </div>

          <AppButton
            href="/services"
            variant="primary"
            size="lg"
            className={styles.button}
          >
            Explore Our Services
          </AppButton>
        </div>
      </div>
    </section>
  );
}
