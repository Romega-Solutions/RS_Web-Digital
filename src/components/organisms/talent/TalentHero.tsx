import { AppButton } from "@/components/atoms/Button";
import { ScrollReveal } from "@/components/atoms/Motion";
import styles from "./TalentHero.module.css";

const features = [
  {
    title: "Curated Talent",
    description: "Professionals chosen for fit, communication, and execution.",
  },
  {
    title: "Flexible Matching",
    description: "Support for long-term hires, embedded specialists, and project work.",
  },
  {
    title: "Growth Ready",
    description: "Talent aligned with scaling teams, sharper delivery, and cleaner operations.",
  },
];

type TalentHeroProps = {
  totalTalents: number;
  totalCategories: number;
  totalLocations: number;
};

export function TalentHero({ totalTalents, totalCategories, totalLocations }: TalentHeroProps) {
  const stats = [
    { label: "Talent profiles", value: totalTalents.toString() },
    { label: "Specializations", value: totalCategories.toString() },
    { label: "Locations", value: totalLocations.toString() },
  ];

  return (
    <section className={styles.root} aria-labelledby="talent-hero-heading">
      <div className={styles.container}>
        <div className={styles.content}>
          <ScrollReveal variant="fade" duration={0.8} distance={20}>
            <p className={styles.badge}>
              <span className={styles.stars} aria-hidden="true">
                ★★★★★
              </span>
              <span>Trusted by growing teams across markets</span>
            </p>

            <h1 id="talent-hero-heading" className={styles.title}>
              Explore Talent Ready To
              <br />
              Move Your Business Forward
            </h1>

            <p className={styles.description}>
              Browse a curated pool of professionals across operations, brand, sales,    
              product, and technical delivery. The structure mirrors the Romega talent   
              experience, adapted here for the digital site with local mock profiles.    
            </p>
          </ScrollReveal>

          <ScrollReveal variant="slideUp" delay={0.2} duration={0.8} distance={20}>
            <div className={styles.actions}>
              <AppButton href="#talent-pool" className={styles.primaryAction}>
                Browse talent pool
              </AppButton>
              <AppButton href="/contact" variant="outline" className={styles.secondaryAction}>
                Talk to a talent specialist
              </AppButton>
            </div>
          </ScrollReveal>

          <div className={styles.stats}>
            {stats.map((stat, index) => (
              <ScrollReveal key={stat.label} variant="scale" delay={0.3 + index * 0.1} duration={0.8} distance={0}>
                <dl className={styles.statItem}>
                  <dt className={styles.statLabel}>{stat.label}</dt>
                  <dd className={styles.statValue}>{stat.value}</dd>
                </dl>
              </ScrollReveal>
            ))}
          </div>

          <div className={styles.features}>
            {features.map((feature, index) => (
              <ScrollReveal key={feature.title} variant="fade" delay={0.4 + index * 0.1} duration={0.8} distance={20}>
                <article className={styles.featureCard}>
                  <div className={styles.featureIcon} aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 12.5 9.2 16.5 19 7.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h2 className={styles.featureTitle}>{feature.title}</h2>
                  <p className={styles.featureCopy}>{feature.description}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
