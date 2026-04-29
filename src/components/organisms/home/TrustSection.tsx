import Image from "next/image";
import { ScrollReveal } from "@/components/atoms/Motion";
import styles from "./TrustSection.module.css";

const trustPillars = [
  {
    title: "Strategic Hiring",
    description:
      "Build teams around your goals, culture, and long-term direction instead of short-term headcount fixes.",
    iconSrc: "/2.0%20Website%20Assets/Icon%2001%20_%20Strategic%20Team%20Growth.webp",
    iconAlt: "Strategic Team Growth icon",
  },
  {
    title: "Stronger Brand Positioning",
    description:
      "Sharpen your message and presence so customers, partners, and hires understand your value faster.",
    iconSrc: "/2.0%20Website%20Assets/Icon%2002%20_%20Stronger%20Brand%20Foundations.webp",
    iconAlt: "Stronger Brand Foundations icon",
  },
  {
    title: "Operational Clarity",
    description:
      "Simplify the moving parts behind growth so leaders can focus on decisions, delivery, and momentum.",
    iconSrc: "/2.0%20Website%20Assets/Icon%2003%20_%20Operational%20Clarity.webp",
    iconAlt: "Operational Clarity icon",
  },
  {
    title: "Smarter Cost Control",
    description:
      "Invest where it matters most while protecting revenue, focus, and execution capacity.",
    iconSrc: "/2.0%20Website%20Assets/Icon%2004%20_%20Cost-Smart%20Growth.webp",
    iconAlt: "Cost-Smart Growth icon",
  },
  {
    title: "Long-Term Support",
    description:
      "Get support that adapts as your business matures, rather than a one-off solution that stalls later.",
    iconSrc: "/2.0%20Website%20Assets/Icon%2005%20_%20Long-Term%20Confidence.webp",
    iconAlt: "Long-Term Confidence icon",
  },
  {
    title: "Global-Ready Perspective",
    description:
      "Bring in insight and talent that help your business compete with confidence across markets.",
    iconSrc: "/2.0%20Website%20Assets/Icon%2006%20_%20Global%20Perspective.webp",
    iconAlt: "Global Perspective icon",
  },
] as const;

const trustSignals = [
  {
    label: "Tailored to your stage",
    description:
      "No one-size-fits-all package. We shape support around your priorities, pace, and business context.",
  },
  {
    label: "Built across teams and brand",
    description:
      "Romega connects talent, operations, and brand support so growth decisions work together instead of in silos.",
  },
  {
    label: "Designed for long-term traction",
    description:
      "The goal is not quick activity. It is durable progress you can sustain as the business expands.",
  },
] as const;

export function TrustSection() {
  return (
    <section className={styles.root}>
      <div className={styles.inner}>
        <div className={styles.overview}>
          <div className={styles.copyColumn}>
            <ScrollReveal variant="slideUp">
              <p className={styles.eyebrow}>Why businesses choose Romega</p>
            </ScrollReveal>

            <ScrollReveal variant="slideUp" delay={0.06}>
              <h2 className={styles.title}>
                Built for
                <span className={styles.titleHighlight}> sustainable growth, </span>
                not short-term fixes.
              </h2>
            </ScrollReveal>

            <ScrollReveal variant="slideUp" delay={0.12}>
              <p className={styles.kicker}>
                More than a service provider.
                <span className={styles.kickerEmphasis}> A growth partner built for the long term.</span>
              </p>
            </ScrollReveal>

            <ScrollReveal variant="fade" delay={0.18}>
              <p className={styles.intro}>
                Romega helps businesses grow with the right people, clearer
                brand direction, and more disciplined operations. Every
                engagement is shaped around your goals so growth stays
                practical, sustainable, and aligned.
              </p>
            </ScrollReveal>
          </div>

          <ScrollReveal variant="slideUp" delay={0.22} className={styles.signalPanel}>
            <p className={styles.signalHeading}>What makes the partnership different</p>
            <div className={styles.signalList}>
              {trustSignals.map((signal) => (
                <article key={signal.label} className={styles.signalItem}>
                  <h3 className={styles.signalTitle}>{signal.label}</h3>
                  <p className={styles.signalCopy}>{signal.description}</p>
                </article>
              ))}
            </div>
          </ScrollReveal>
        </div>

        <div className={styles.grid}>
          {trustPillars.map((pillar, index) => (
            <ScrollReveal
              key={pillar.title}
              variant="scale"
              delay={0.1 * index}
              duration={0.5}
            >
              <article className={styles.card}>
                <div className={styles.cardTop}>
                  <Image
                    src={pillar.iconSrc}
                    alt={pillar.iconAlt}
                    width={88}
                    height={88}
                    sizes="(max-width: 767px) 72px, 88px"
                    className={styles.iconImage}
                  />
                  <span className={styles.cardIndex}>0{index + 1}</span>
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{pillar.title}</h3>
                  <p className={styles.cardCopy}>{pillar.description}</p>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
