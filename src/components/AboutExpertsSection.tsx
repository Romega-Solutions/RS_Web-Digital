const experts = [
  {
    name: "Rich Day",
    role: "Graphic Designer",
    className: "about-expert-card-rich",
  },
  {
    name: "Eliza Mae Perez",
    role: "Bookkeeper",
    className: "about-expert-card-eliza",
  },
  {
    name: "Robbie Galoso",
    role: "Founder and CEO",
    className: "about-expert-card-robbie",
    featured: true,
  },
  {
    name: "Christine Valencia",
    role: "Business Partner & Recruiter",
    className: "about-expert-card-christine",
  },
  {
    name: "John Patrick",
    role: "Full Stack Engineer",
    className: "about-expert-card-john",
  },
];

export function AboutExpertsSection() {
  return (
    <section className="about-experts-section" aria-labelledby="about-experts-title">
      <div className="about-experts-inner">
        <h2 id="about-experts-title" className="about-experts-title">
          Meet the Experts
        </h2>
        <p className="about-experts-copy">
          Our team brings a blend of strategic insight, market perspective, and
          practical experience in team building and brand support. We believe in
          work that matters and partnerships that last.
        </p>

        <div className="about-experts-carousel" aria-label="Romega experts">
          {experts.map((expert) => (
            <article
              key={expert.name}
              className={`about-expert-card ${expert.className} ${
                expert.featured ? "about-expert-card-featured" : ""
              }`}
            >
              <div className="about-expert-card-media" aria-hidden="true" />
              <div className="about-expert-card-overlay" />
              <div className="about-expert-card-copy">
                <h3>{expert.name}</h3>
                <p>{expert.role}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="about-experts-dots" aria-hidden="true">
          <span className="is-active" />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    </section>
  );
}
