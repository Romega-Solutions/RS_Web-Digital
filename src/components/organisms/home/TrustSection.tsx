import Image from "next/image";
import { ScrollReveal } from "@/components/atoms/Motion";
import styles from "./TrustSection.module.css";

const trustPillars = [
  {
    title: "Strategic Team Growth",
    description: "Build teams aligned with your goals, culture, and long-term vision.",
    iconSrc: "/2.0%20Website%20Assets/Icon%2001%20_%20Strategic%20Team%20Growth.webp",
    iconAlt: "Strategic Team Growth icon",
  },
  {
    title: "Stronger Brand Foundations",
    description: "Clarify your message and create a brand that builds trust across markets.",
    iconSrc: "/2.0%20Website%20Assets/Icon%2002%20_%20Stronger%20Brand%20Foundations.webp",
    iconAlt: "Stronger Brand Foundations icon",
  },
  {
    title: "Operational Clarity",
    description: "Simplified processes that give leaders more time to focus on impact.",
    iconSrc: "/2.0%20Website%20Assets/Icon%2003%20_%20Operational%20Clarity.webp",
    iconAlt: "Operational Clarity icon",
  },
  {
    title: "Cost-Smart Growth",
    description: "Invest wisely while protecting revenue and momentum.",
    iconSrc: "/2.0%20Website%20Assets/Icon%2004%20_%20Cost-Smart%20Growth.webp",
    iconAlt: "Cost-Smart Growth icon",
  },
  {
    title: "Long-Term Confidence",
    description: "Strategic support that evolves as your business grows.",
    iconSrc: "/2.0%20Website%20Assets/Icon%2005%20_%20Long-Term%20Confidence.webp",
    iconAlt: "Long-Term Confidence icon",
  },
  {
    title: "Global Perspective",
    description: "Insight and talent that help you compete on a global stage.",
    iconSrc: "/2.0%20Website%20Assets/Icon%2006%20_%20Global%20Perspective.webp",
    iconAlt: "Global Perspective icon",
  },
] as const;

export function TrustSection() {
  return (
    <section className={styles.root}>
      <div className={styles.inner}>
        <ScrollReveal variant="slideUp">
          <h2 className={styles.title}>
            <span className={styles.titleHighlight}>Why Businesses Trust Romega</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal variant="slideUp" delay={0.1}>
          <p className={styles.kicker}>
            Not just another service provider.
            <span className={styles.kickerEmphasis}> A long-term growth partner.</span>
          </p>
        </ScrollReveal>

        <ScrollReveal variant="fade" delay={0.2}>
          <p className={styles.intro}>
            Businesses choose Romega because we do not offer one-size-fits-all
            solutions. We take the time to understand your goals, your
            challenges, and where you are headed, then build the teams and
            brand foundations that support real, lasting growth.
          </p>
        </ScrollReveal>

        <div className={styles.grid}>
          {trustPillars.map((pillar, index) => (
            <ScrollReveal
              key={pillar.title}
              variant="scale"
              delay={0.1 * index}
              duration={0.5}
            >
              <article className={styles.card}>
                <Image
                  src={pillar.iconSrc}
                  alt={pillar.iconAlt}
                  width={112}
                  height={112}
                  sizes="(max-width: 767px) 96px, 112px"
                  className={styles.iconImage}
                />
                <h3 className={styles.cardTitle}>{pillar.title}</h3>
                <p className={styles.cardCopy}>{pillar.description}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
