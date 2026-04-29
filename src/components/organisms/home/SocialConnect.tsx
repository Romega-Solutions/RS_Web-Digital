import Image from "next/image";
import { ScrollReveal } from "@/components/atoms/Motion";
import styles from "./SocialConnect.module.css";

export function SocialConnect() {
  return (
    <section className={styles.root}>
      <div className={styles.inner}>
        <ScrollReveal
          variant="slideRight"
          duration={0.8}
          className={styles.copy}
        >
          <h2 className={styles.title}>
            <span>Stay </span>
            <span className={styles.titleEmphasis}>Connected.</span>
          </h2>

          <p className={styles.text}>
            Growth does not stop at hiring or branding. On LinkedIn, we share
            real-world insights on building high-performing teams, strengthening
            brands, and navigating growth in today&apos;s evolving business
            landscape.
          </p>

          <p className={`${styles.text} ${styles.textLast}`}>
            Follow Romega and be part of the conversation shaping what&apos;s
            next.
          </p>
          <div className={styles.followRow}>
            <a
              className={styles.linkedinButton}
              href="https://www.linkedin.com/company/romega/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Romega on LinkedIn"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                focusable="false"
              >
                <rect
                  x="2"
                  y="2"
                  width="20"
                  height="20"
                  rx="2.5"
                  fill="#0A66C2"
                />
                <path
                  d="M7.75 10.5H5.5V18H7.75V10.5ZM6.625 9.375C7.519 9.375 8.25 8.636 8.25 7.75C8.25 6.864 7.519 6.125 6.625 6.125C5.731 6.125 5 6.864 5 7.75C5 8.636 5.731 9.375 6.625 9.375ZM18.5 12.25C18.5 10.25 17.75 9 15.875 9C14.625 9 14 9.75 13.75 10.25V9.5H11.5V18H13.75V13.75C13.75 12.75 14.25 12 15.125 12C15.875 12 16 12.625 16 13.125V18H18.25V13.75C18.25 12.125 18.5 12.25 18.5 12.25Z"
                  fill="#fff"
                />
              </svg>
              <span className={styles.followText}>Follow on LinkedIn</span>
            </a>
          </div>
        </ScrollReveal>

        <ScrollReveal
          variant="slideLeft"
          delay={0.2}
          duration={0.8}
          className={styles.visual}
        >
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
