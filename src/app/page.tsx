import { ExploreServicesButton } from "../components/ExploreServicesButton";
import { HomeHero } from "../components/HomeHero";
import { ServiceStrip } from "../components/ServiceStrip";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

export default function Home() {
  const trustPillars = [
    {
      title: "Strategic Team Growth",
      description: "Build teams aligned with your goals, culture, and long-term vision.",
      iconSrc: "/2.0%20Website%20Assets/Icon%2001%20_%20Strategic%20Team%20Growth.png",
      iconAlt: "Strategic Team Growth icon",
    },
    {
      title: "Stronger Brand Foundations",
      description: "Clarify your message and create a brand that builds trust across markets.",
      iconSrc: "/2.0%20Website%20Assets/Icon%2002%20_%20Stronger%20Brand%20Foundations.png",
      iconAlt: "Stronger Brand Foundations icon",
    },
    {
      title: "Operational Clarity",
      description: "Simplified processes that give leaders more time to focus on impact.",
      iconSrc: "/2.0%20Website%20Assets/Icon%2003%20_%20Operational%20Clarity.png",
      iconAlt: "Operational Clarity icon",
    },
    {
      title: "Cost-Smart Growth",
      description: "Invest wisely while protecting revenue and momentum.",
      iconSrc: "/2.0%20Website%20Assets/Icon%2004%20_%20Cost-Smart%20Growth.png",
      iconAlt: "Cost-Smart Growth icon",
    },
    {
      title: "Long-Term Confidence",
      description: "Teams that stay. Brands that last. Growth that is sustainable.",
      iconSrc: "/2.0%20Website%20Assets/Icon%2005%20_%20Long-Term%20Confidence.png",
      iconAlt: "Long-Term Confidence icon",
    },
    {
      title: "Global Perspective",
      description: "Supporting businesses across borders with insight and experience.",
      iconSrc: "/2.0%20Website%20Assets/Icon%2006%20_%20Global%20Perspective.png",
      iconAlt: "Global Perspective icon",
    },
  ];

  return (
    <div className="site-shell" id="top">
      <SiteHeader activeItem="Home" />

      <main>
        <HomeHero />

        <ServiceStrip />

        <section className="growth-section">
          <div className="growth-grid" aria-hidden="true" />

          <div className="growth-inner">
            <div className="growth-copy-wrap">
              <h2 className="growth-title">
                Growth feels easier when you have the right <span className="growing-word">partner.</span>
              </h2>
            </div>

            <div className="growth-side">
              <div className="growth-photo" aria-hidden="true" />
              <p className="growth-text">
                We work alongside founders and leaders who want to scale
                without chaos. <strong>From talent and operations to brand support,</strong>
                Romega brings structure, perspective, and steady guidance so
                growth feels intentional, not overwhelming.
              </p>
            </div>
          </div>

          <div className="growth-banner">
            <div className="growth-banner-overlay" aria-hidden="true" />
            <div className="growth-banner-content">
              <h3 className="growth-banner-title">Let&apos;s Build What&apos;s Next</h3>
              <ExploreServicesButton className="growth-banner-cta" />
            </div>
          </div>
        </section>

        <section className="trust-section">
          <div className="trust-inner">
            <h2 className="trust-title">
              <span className="trust-title-highlight">Why Businesses Trust Romega</span>
            </h2>
            <p className="trust-kicker">
              Not just another service provider.
              <span className="trust-kicker-emphasis"> A long-term growth partner.</span>
            </p>
            <p className="trust-intro">
              Businesses choose Romega because we do not offer one-size-fits-all
              solutions. We take the time to understand your goals, your
              challenges, and where you are headed, then build the teams and
              brand foundations that support real, lasting growth.
            </p>

            <div className="trust-grid">
              {trustPillars.map((pillar) => (
                <article key={pillar.title} className="trust-card">
                  <img
                    src={pillar.iconSrc}
                    alt={pillar.iconAlt}
                    className="trust-icon-image"
                    loading="lazy"
                  />
                  <h3 className="trust-card-title">{pillar.title}</h3>
                  <p className="trust-card-copy">{pillar.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="approach-section">
          <div className="approach-grid" aria-hidden="true" />

          <div className="approach-inner">
            <div className="approach-left">
              <h2 className="approach-title">
                We don&apos;t
                <br />
                rush growth.
                <br />
                <span className="approach-emphasis">We build it</span>
                <br />
                <span className="approach-circled">right.</span>
              </h2>
            </div>

            <div className="approach-right">
              <h3 className="approach-heading">Our approach is simple:</h3>
              <p className="approach-copy">
                Understand your business, align people and brand, and support
                every step with clarity and care. We believe growth works best
                when teams and brands are built side by side, with intention.
              </p>
            </div>
          </div>
        </section>

        <section className="services-spotlight">
          <div className="services-spotlight-arrow" aria-hidden="true">
            <span className="services-spotlight-chevron" />
          </div>

          <div className="services-spotlight-inner">
            <p className="services-spotlight-intro">
              Whether you are building your team, refining your brand, or
              preparing for your next stage of growth, Romega Solutions brings
              the people, insight, and support to move your business forward
              with confidence.
            </p>

            <div className="services-spotlight-grid">
              <article className="services-spotlight-card services-card-talent">
                <img
                  src="/2.0%20Website%20Assets/Image%201%20_%20Talent%20Solutions.png"
                  alt="Talent Solutions"
                  className="services-spotlight-image"
                  loading="lazy"
                />
              </article>

              <article className="services-spotlight-card services-card-brand">
                <img
                  src="/2.0%20Website%20Assets/Image%202%20_%20Brand%20%26%20Growth%20Support.png"
                  alt="Brand & Growth Support"
                  className="services-spotlight-image"
                  loading="lazy"
                />
              </article>

              <article className="services-spotlight-card services-card-ops">
                <img
                  src="/2.0%20Website%20Assets/Image%203%20_%20Strategic%20Operations.png"
                  alt="Strategic Operations"
                  className="services-spotlight-image"
                  loading="lazy"
                />
              </article>
            </div>

            <button type="button" className="services-spotlight-button">
              See How We Can Help
            </button>
          </div>
        </section>

        {/* <section className="testimonial-section">
          <div className="testimonial-backdrop" aria-hidden="true" />
          <div className="testimonial-overlay" aria-hidden="true" />

          <button className="testimonial-arrow testimonial-arrow-left" aria-label="Previous testimonial">
            &lt;
          </button>
          <button className="testimonial-arrow testimonial-arrow-right" aria-label="Next testimonial">
            &gt;
          </button>

          <div className="testimonial-content">
            <blockquote className="testimonial-quote">
              &ldquo;Romega placed three VP-level executives in record time, helping
              us avoid months of lost revenue&rdquo;
            </blockquote>
            <p className="testimonial-author">Martin Reyes, CEO</p>

            <div className="testimonial-dots" aria-hidden="true">
              <span className="testimonial-dot testimonial-dot-active" />
              <span className="testimonial-dot" />
              <span className="testimonial-dot" />
              <span className="testimonial-dot" />
              <span className="testimonial-dot" />
            </div>
          </div>
        </section> */}

        <section className="social-connect">
          <div className="social-connect-inner">
            <div className="social-connect-copy">
              <h2 className="social-connect-title">
                <span>Stay </span>
                <span className="social-connect-title-emphasis">Connected.</span>
              </h2>

              <p className="social-connect-text">
                Growth does not stop at hiring or branding. On LinkedIn, we
                share real-world insights on building high-performing teams,
                strengthening brands, and navigating growth in today&apos;s evolving
                business landscape.
              </p>

              <p className="social-connect-text social-connect-text-last">
                Follow Romega and be part of the conversation shaping what&apos;s
                next.
              </p>
            </div>

            <div className="social-connect-visual" aria-hidden="true">
              <img
                src="/stay-connected-transparent.png"
                alt=""
                className="social-connect-visual-image"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        <SiteFooter />
      </main>
    </div>
  );
}
