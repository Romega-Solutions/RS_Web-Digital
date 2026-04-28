import Image from "next/image";
import styles from "./SocialConnect.module.css";

export function SocialConnect() {
  return (
    <section className={styles.root}>
      <div className={styles.inner}>
        <div className={styles.copy}>
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
        </div>

        <div className={styles.visual} aria-hidden="true">
          <Image
            src="/phone.png"
            alt=""
            width={1080}
            height={1080}
            sizes="(max-width: 767px) 100vw, 36rem"
            className={styles.image}
          />
        </div>
      </div>
    </section>
  );
}
