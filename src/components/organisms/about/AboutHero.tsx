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
          <h1 className={styles.title}>
            Built on <span className={styles.highlight}>Purpose,</span>
            <br />
            Driven by <span className={styles.highlight}>People</span>
          </h1>

          <div className={styles.text}>
            <p>
              Romega Solutions was founded on a simple insight{" "}
              <strong>Growth shouldn&apos;t feel overwhelming or disconnected.</strong>{" "}
              Too often, businesses struggle with hiring the right people,
              clarifying their brand message, and aligning operations, all at
              the same time. We saw an opportunity to bring those elements
              together, not separately, but as an integrated approach to
              intentional growth.
            </p>

            <p>
              We started by helping Philippine-based talent connect with
              global opportunity. Today, we&apos;ve grown into a trusted
              partner for businesses worldwide, supporting teams, refining
              brand presence, and powering sustainable growth.
            </p>
          </div>

          <AppButton 
            href="/services" 
            variant="primary" 
            size="lg"
            className={styles.button}
          >
            Connect with Us today!
          </AppButton>
        </div>
      </div>
    </section>
  );
}
