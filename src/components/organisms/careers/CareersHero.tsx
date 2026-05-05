import Image from "next/image";
import { AppButton } from "@/components/atoms/Button";
import { ScrollReveal } from "@/components/atoms/Motion";
import styles from "./CareersHero.module.css";

interface CareersHeroProps {
  updatedDate: string;
  onOpenJobs: () => void;
}

export function CareersHero({ updatedDate, onOpenJobs }: CareersHeroProps) {
  return (
    <section className={styles.root}>
      <div className={styles.background}>
        <Image
          src="/images/careers/bg-top.webp"
          alt=""
          fill
          priority
          className={styles.backgroundImage}
        />
      </div>

      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.copyWrap}>
            <ScrollReveal variant="fade" duration={0.8} distance={20}>
              <div className={styles.head}>
                <span className={styles.kicker}>Join Our Network</span>
                <h1 className={styles.title}>Build Your Career with Purpose</h1>
                <p className={styles.copy}>
                  We look for individuals who are skilled, curious, and committed
                  to excellence. At Romega, you will work on projects that matter,
                  with a team that values your contribution and growth.
                </p>
                <p className={styles.date}>Last updated: {updatedDate}</p>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="slideUp" delay={0.2} duration={0.8} distance={20}>
              <div className={styles.actions}>
                <AppButton
                  onClick={onOpenJobs}
                  variant="primary"
                  size="lg"
                  className="w-full md:w-auto"
                >
                  <Image
                    src="/images/careers/bag-white.svg"
                    alt=""
                    width={24}
                    height={24}
                    className="mr-2"
                  />
                  View Open Opportunities
                </AppButton>
                <AppButton
                  href="mailto:careers@romega-solutions.com"
                  variant="outline"
                  size="lg"
                  className="w-full md:w-auto"
                >
                  <Image
                    src="/images/careers/human.png"
                    alt=""
                    width={24}
                    height={24}
                    className="mr-2"
                  />
                  Send Your Profile
                </AppButton>
              </div>
            </ScrollReveal>
          </div>
        </div>

        <div className={styles.columns}>
          <ScrollReveal variant="scale" delay={0.3} duration={0.8}>
            <div className={styles.infoCard}>
              <h2>Why Romega?</h2>
              <ul className={styles.bulletList}>
                <li>
                  <Image
                    src="/images/careers/search-check.svg"
                    alt=""
                    width={28}
                    height={28}
                  />
                  <span>
                    <strong>Global Exposure:</strong> Work with diverse clients
                    and projects that sharpen your skills.
                  </span>
                </li>
                <li>
                  <Image
                    src="/images/careers/search-check.svg"
                    alt=""
                    width={28}
                    height={28}
                  />
                  <span>
                    <strong>Integrated Growth:</strong> Learn how talent, brand,
                    and operations work together.
                  </span>
                </li>
                <li>
                  <Image
                    src="/images/careers/search-check.svg"
                    alt=""
                    width={28}
                    height={28}
                  />
                  <span>
                    <strong>People-First Culture:</strong> We believe strong teams
                    are built on trust and respect.
                  </span>
                </li>
              </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="scale" delay={0.4} duration={0.8}>
            <div className={styles.infoCard}>
              <h2>Our Values in Action</h2>
              <ul className={styles.bulletList}>
                <li>
                  <Image
                    src="/images/careers/heart-handshake.svg"
                    alt=""
                    width={28}
                    height={28}
                  />
                  <span>
                    <strong>Intentional Collaboration:</strong> We don&apos;t just
                    assign tasks; we solve problems together.
                  </span>
                </li>
                <li>
                  <Image
                    src="/images/careers/heart-handshake.svg"
                    alt=""
                    width={28}
                    height={28}
                  />
                  <span>
                    <strong>Steady Excellence:</strong> We prioritize quality and
                    consistency in everything we deliver.
                  </span>
                </li>
                <li>
                  <Image
                    src="/images/careers/heart-handshake.svg"
                    alt=""
                    width={28}
                    height={28}
                  />
                  <span>
                    <strong>Dynamic Adaptation:</strong> We stay agile and responsive
                    to the needs of our partners and team.
                  </span>
                </li>
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
