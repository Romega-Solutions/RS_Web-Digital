import type { Metadata } from "next";
import { AboutHero } from "@/components/organisms/about/AboutHero";
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
        <AboutHero />

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
