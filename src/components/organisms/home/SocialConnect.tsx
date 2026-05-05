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
              href="https://www.linkedin.com/company/romega-solutions/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Romega on LinkedIn"
            >
              <Image
                src="/images/careers/linkedin.svg"
                alt=""
                width={18}
                height={18}
                aria-hidden="true"
                className={styles.linkedinIcon}
                unoptimized
              />
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
          <div id="social-visual" className={styles.visualFrame}>
            <Image
              src="/phone.png"
              alt=""
              width={1080}
              height={1080}
              sizes="(max-width: 767px) 100vw, 36rem"
              className={styles.image}
            />
            <a
              className={`${styles.visualHotspot} ${styles.brandHotspot}`}
              href="https://www.linkedin.com/company/romega-solutions/people"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Romega people on LinkedIn"
              data-tooltip="People"
              title="View people"
            />
            <a
              className={`${styles.visualHotspot} ${styles.linkedinHotspot}`}
              href="https://www.linkedin.com/company/romega-solutions/posts/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Romega latest posts on LinkedIn"
              data-tooltip="Latest posts"
              title="View latest posts"
            />
            <a
              className={`${styles.visualHotspot} ${styles.hiringHotspot}`}
              href="https://www.linkedin.com/company/romega-solutions/jobs/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Romega jobs on LinkedIn"
              data-tooltip="Open jobs"
              title="View open jobs"
            />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
