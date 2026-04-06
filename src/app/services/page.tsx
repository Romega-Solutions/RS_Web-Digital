import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ConsultationBanner } from "../../components/ConsultationBanner";
import { ServiceStrip } from "../../components/ServiceStrip";
import { SiteFooter } from "../../components/SiteFooter";
import { SiteHeader } from "../../components/SiteHeader";

export const metadata: Metadata = {
  title: "Services | Romega Solutions",
  description: "Explore Romega Solutions services for talent, brand growth, and operations.",
};

const detailedServices = [
  {
    title: "Talent Solutions",
    intro: "The right people change everything.",
    copy:
      "Your people are your greatest asset. We help you identify, attract, and retain talent aligned with your goals, culture, and long-term vision. From executive search to remote team frameworks, our service prioritizes fit, performance, and longevity so your teams drive real impact.",
    offerTitle: "What We Offer.",
    bullets: [
      "Executive and leadership search",
      "Remote and global talent sourcing",
      "Workforce planning and team structuring",
      "Hiring workflow optimization",
      "Retention and team alignment strategies",
    ],
    imageSrc: "/2.0%20Website%20Assets/Image%201%20_%20Talent%20Solutions.png",
    imageAlt: "Talent Solutions",
  },
  {
    title: "Brand & Growth Support",
    intro: "A strong brand builds trust before you speak.",
    copy:
      "In a competitive world, clarity wins. We help refine your brand's voice, strengthen your value narrative, and position you where your audience listens. From foundational strategy to messaging direction, we support brands that want to be seen, heard, and trusted.",
    offerTitle: "What We Offer.",
    bullets: [
      "Brand positioning and messaging clarity",
      "Foundational brand strategy",
      "Content direction and communication guidance",
      "Market presence alignment",
      "Growth-focused brand insights",
    ],
    imageSrc: "/2.0%20Website%20Assets/Image%202%20_%20Brand%20%26%20Growth%20Support.png",
    imageAlt: "Brand and Growth Support",
  },
  {
    title: "Strategic Operations",
    intro: "Build systems that support long-term success.",
    copy:
      "Smart growth requires thoughtful systems. We work with teams to optimize workflows, clarify processes, and align operational functions with strategic goals. When processes are clear, leaders can focus on impact, not firefighting.",
    offerTitle: "What We Offer.",
    bullets: [
      "Process optimization",
      "Operational alignment",
      "Workflow clarity and documentation",
      "Leadership support strategies",
      "Scalable systems for expanding teams",
    ],
    imageSrc: "/2.0%20Website%20Assets/Image%203%20_%20Strategic%20Operations.png",
    imageAlt: "Strategic Operations",
  },
] as const;

export default function ServicesPage() {
  return (
    <div className="site-shell" id="top">
      <SiteHeader activeItem="Services" />

      <main>
        <section className="services-hero">
          <div className="services-hero-media" aria-hidden="true">
            <Image
              src="/2.0%20Website%20Assets/2.png"
              alt=""
              fill
              priority
              sizes="100vw"
              className="services-hero-image"
            />
          </div>
          <div className="services-hero-overlay" aria-hidden="true" />

          <div className="services-hero-inner">
            <h1 className="services-hero-title">
              Where teams and brands
              <br />
              are <span className="services-hero-highlight">built side by side.</span>
            </h1>

            <p className="services-hero-copy">
              At Romega, we don&apos;t treat services as silos. We integrate team
              growth, brand support, and strategic operations so your business
              moves forward as one unified system, not separate parts.
            </p>

            <Link href="#services-overview" className="services-hero-cta">
              Book your Call today!
            </Link>
          </div>
        </section>

        <ServiceStrip />

        <section className="services-detail-section" aria-labelledby="services-detail-title">
          <div className="services-detail-inner">
            <h1 id="services-detail-title" className="sr-only">
              Service details
            </h1>

            {detailedServices.map((service, index) => (
              <div
                key={service.title}
                className={`services-detail-row ${
                  index % 2 === 1 ? "services-detail-row-reverse" : ""
                }`}
              >
                <div className="services-detail-media">
                  <Image
                    src={service.imageSrc}
                    alt={service.imageAlt}
                    fill
                    sizes="(max-width: 767px) 100vw, 42vw"
                    className="services-detail-image"
                  />
                </div>

                <article className="services-detail-copy">
                  <h2 className="services-detail-intro">{service.intro}</h2>
                  <p className="services-detail-text">{service.copy}</p>
                  <h3 className="services-detail-offer">{service.offerTitle}</h3>
                  <ul className="services-detail-list">
                    {service.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </article>
              </div>
            ))}

            <div className="services-detail-cta-wrap">
              <Link href="#services-overview" className="services-detail-cta">
                Discover How We Work
              </Link>
            </div>
          </div>
        </section>

        <ConsultationBanner />
      </main>

      <SiteFooter />
    </div>
  );
}
