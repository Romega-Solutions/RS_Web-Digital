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
    <section className="talent-hero" aria-labelledby="talent-hero-heading">
      <div className="talent-hero__container">
        <div className="talent-hero__content">
          <p className="talent-hero__badge">
            <span className="talent-hero__stars" aria-hidden="true">
              ★★★★★
            </span>
            <span>Trusted by growing teams across markets</span>
          </p>

          <h1 id="talent-hero-heading" className="talent-hero__title">
            Explore Talent Ready To
            <br />
            Move Your Business Forward
          </h1>

          <p className="talent-hero__description">
            Browse a curated pool of professionals across operations, brand, sales,
            product, and technical delivery. The structure mirrors the Romega talent
            experience, adapted here for the digital site with local mock profiles.
          </p>

          <div className="talent-hero__features">
            {features.map((feature) => (
              <article key={feature.title} className="talent-hero__feature-card">
                <div className="talent-hero__feature-icon" aria-hidden="true">
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
                <h2 className="talent-hero__feature-title">{feature.title}</h2>
                <p className="talent-hero__feature-copy">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
