import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { AboutExpertsSection } from "@/components/organisms/about/AboutExpertsSection";
import { AboutGrowthSection } from "@/components/organisms/about/AboutGrowthSection";
import { AboutMissionSection } from "@/components/organisms/about/AboutMissionSection";
import { AboutPartnersSection } from "@/components/organisms/about/AboutPartnersSection";
import { AboutValuesSection } from "@/components/organisms/about/AboutValuesSection";
import { AboutVisionSection } from "@/components/organisms/about/AboutVisionSection";
import { ConsultationBanner } from "@/components/organisms/shared/ConsultationBanner";
import { SiteFooter } from "@/components/organisms/layout/SiteFooter";
import { SiteHeader } from "@/components/organisms/layout/SiteHeader";
import { absoluteUrl, createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "About Romega Solutions",
  description:
    "Learn how Romega Solutions helps businesses grow through people-first strategy, global talent experience, and practical operational support.",
  path: "/about",
  keywords: [
    "about romega solutions",
    "people-first growth",
    "global talent partner",
    "business support company",
    "team and brand strategy",
  ],
});

export default function AboutPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": absoluteUrl("/about#webpage"),
        url: absoluteUrl("/about"),
        name: "About Romega Solutions",
        description:
          "Learn how Romega Solutions helps businesses grow through people-first strategy, global talent experience, and practical operational support.",
        isPartOf: {
          "@id": absoluteUrl("/#website"),
        },
        about: {
          "@id": absoluteUrl("/#organization"),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: absoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "About",
            item: absoluteUrl("/about"),
          },
        ],
      },
    ],
  };

  return (
    <div className="site-shell" id="top">
      <JsonLd id="about-structured-data" data={structuredData} />
      <SiteHeader activeItem="About" />

      <main id="main-content" tabIndex={-1}>
        <section className="about-hero">
          <div className="about-hero-inner">
            <div className="about-hero-photo-frame">
              <Image
                src="/prompt-images/about/1_hero.png"
                alt="Romega team collaborating around a table"
                fill
                preload
                sizes="(max-width: 767px) 100vw, 36vw"
                className="about-hero-photo"
              />
            </div>

            <div className="about-hero-copy">
              <h1 className="about-hero-title">
                Built on <span className="about-hero-highlight">Purpose,</span>
                <br />
                Driven by <span className="about-hero-highlight">People</span>
              </h1>

              <div className="about-hero-text">
                <p>
                  Romega Solutions was founded on a simple insight{" "}
                  <strong>Growth shouldn&apos;t feel overwhelming or disconnected.</strong>{" "}
                  Too often, businesses struggle with hiring the right people,
                  clarifying their brand message, and aligning operations, all at
                  the same time. We saw an opportunity to bring those elements
                  together, not separately, but as an integrated approach to
                  intentional growth.
                </p>

                <p>
                  We started by helping Philippine-based talent connect with
                  global opportunity. Today, we&apos;ve grown into a trusted
                  partner for businesses worldwide, supporting teams, refining
                  brand presence, and powering sustainable growth.
                </p>
              </div>

              <Link href="/services" className="about-hero-cta">
                Connect with Us today!
              </Link>
            </div>
          </div>
        </section>

        <AboutMissionSection />

        <AboutVisionSection />

        <AboutValuesSection />

        <AboutPartnersSection />

        <AboutExpertsSection />

        <AboutGrowthSection />

        <ConsultationBanner />
      </main>

      <SiteFooter />
    </div>
  );
}
