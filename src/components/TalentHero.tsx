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

export function TalentHero() {
  return (
    <section className={styles.hero} aria-labelledby="talent-hero-heading">
      <div className={styles.container}>
        <div className={styles.content}>
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

          <div className={styles.features}>
            {features.map((feature) => (
              <article key={feature.title} className={styles.featureCard}>
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
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
