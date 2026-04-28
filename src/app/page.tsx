import type { Metadata } from "next";
import Image from "next/image";
import { ExploreServicesButton } from "@/components/atoms/Button";
import { GrowthSection } from "@/components/organisms/home/GrowthSection";
import { TrustSection } from "@/components/organisms/home/TrustSection";
import { ApproachSection } from "@/components/organisms/home/ApproachSection";
import { ServiceCard } from "@/components/molecules/Card/ServiceCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { HomeHero } from "@/components/organisms/home/HomeHero";
import { ServiceStrip } from "@/components/organisms/home/ServiceStrip";
import { TestimonialSection } from "@/components/organisms/home/TestimonialSection";
import { SiteFooter } from "@/components/organisms/layout/SiteFooter";
import { SiteHeader } from "@/components/organisms/layout/SiteHeader";
import { createMetadata, createOrganizationSchema, createWebsiteSchema, absoluteUrl, siteConfig } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Smart Talent, Brand, and Operations Support",
  description:
    "Romega Solutions helps founders and growth teams build stronger talent pipelines, clearer brands, and steadier operations.",
  path: "/",
  keywords: [
    "strategic team growth",
    "brand support",
    "operations support",
    "founder support",
    "growth partner",
    "business consulting",
  ],
});

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      createOrganizationSchema(),
      createWebsiteSchema(),
      {
        "@type": "ProfessionalService",
        "@id": absoluteUrl("/#service"),
        name: siteConfig.name,
        url: absoluteUrl("/"),
        image: absoluteUrl(siteConfig.ogImage),
        description: siteConfig.description,
        provider: {
          "@id": absoluteUrl("/#organization"),
        },
        areaServed: ["United States", "APAC", "Global"],
        serviceType: [
          "Talent solutions",
          "Brand and growth support",
          "Strategic operations support",
        ],
      },
      {
        "@type": "WebPage",
        "@id": absoluteUrl("/#webpage"),
        url: absoluteUrl("/"),
        name: "Romega Solutions Home",
        description:
          "Romega Solutions helps founders and growth teams build stronger talent pipelines, clearer brands, and steadier operations.",
        isPartOf: {
          "@id": absoluteUrl("/#website"),
        },
        about: {
          "@id": absoluteUrl("/#organization"),
        },
      },
    ],
  };

  return (
    <div className="site-shell site-shell--home" id="top">
      <JsonLd id="home-structured-data" data={structuredData} />
      <SiteHeader activeItem="Home" />

      <main id="main-content" tabIndex={-1}>
        <HomeHero />

        <ServiceStrip />

        <GrowthSection />

        <TrustSection />

        <ApproachSection />

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
              <ServiceCard
                title="Talent Solutions"
                imageSrc="/2.0%20Website%20Assets/Image%201%20_%20Talent%20Solutions.webp"
                imageAlt="Talent Solutions"
                className="services-card-talent"
              />

              <ServiceCard
                title="Brand & Growth Support"
                imageSrc="/2.0%20Website%20Assets/Image%202%20_%20Brand%20%26%20Growth%20Support.webp"
                imageAlt="Brand & Growth Support"
                className="services-card-brand"
              />

              <ServiceCard
                title="Strategic Operations"
                imageSrc="/2.0%20Website%20Assets/Image%203%20_%20Strategic%20Operations.webp"
                imageAlt="Strategic Operations"
                className="services-card-ops"
              />
            </div>

            <ExploreServicesButton
              className="services-spotlight-button"
              href="/services"
              label="See How We Can Help"
            />
          </div>
        </section>

        <TestimonialSection />
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
              <Image
                src="/phone.png"
                alt=""
                width={1080}
                height={1080}
                sizes="(max-width: 767px) 100vw, 36rem"
                className="social-connect-visual-image"
              />
            </div>
          </div>
        </section>

        <SiteFooter />
      </main>
    </div>
  );
}
