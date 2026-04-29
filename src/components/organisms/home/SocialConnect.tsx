import Image from "next/image";
import { ScrollReveal } from "@/components/atoms/Motion";
import styles from "./SocialConnect.module.css";

export function SocialConnect() {
  return (
    <section className={styles.root}>
      <div className={styles.inner}>
        <ScrollReveal variant="slideRight" duration={0.8} className={styles.copy}>
          <h2 className={styles.title}>
            <span>Stay </span>
            <span className={styles.titleEmphasis}>Connected.</span>
          </h2>

          <p className={styles.text}>
            Growth does not stop at hiring or branding. On LinkedIn, we
            share real-world insights on building high-performing teams,
            strengthening brands, and navigating growth in today&apos;s evolving
            business landscape.
          </p>

          <p className={`${styles.text} ${styles.textLast}`}>
            Follow Romega and be part of the conversation shaping what&apos;s
            next.
          </p>
        </ScrollReveal>

        <ScrollReveal variant="slideLeft" delay={0.2} duration={0.8} className={styles.visual}>
          <Image
            src="/phone.png"
            alt=""
            width={1080}
            height={1080}
            sizes="(max-width: 767px) 100vw, 36rem"
            className={styles.image}
          />
        </ScrollReveal>
      </div>
    </section>
  );
}
