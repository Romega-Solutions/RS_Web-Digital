import type { Metadata } from "next";
import { HomeTemplate } from "@/components/templates/HomeTemplate";
import { GrowthSection } from "@/components/organisms/home/GrowthSection";
import { TrustSection } from "@/components/organisms/home/TrustSection";
import { ApproachSection } from "@/components/organisms/home/ApproachSection";
import { ServicesSpotlight } from "@/components/organisms/home/ServicesSpotlight";
import { JsonLd } from "@/components/seo/JsonLd";
import { HomeHero } from "@/components/organisms/home/HomeHero";
import { ServiceStrip } from "@/components/organisms/home/ServiceStrip";
import { TestimonialSection } from "@/components/organisms/home/TestimonialSection";
import { SocialConnect } from "@/components/organisms/home/SocialConnect";
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
    <HomeTemplate
      jsonLd={<JsonLd id="home-structured-data" data={structuredData} />}
      header={<SiteHeader activeItem="Home" />}
      hero={<HomeHero />}
      serviceStrip={<ServiceStrip />}
      growth={<GrowthSection />}
      trust={<TrustSection />}
      approach={<ApproachSection />}
      spotlight={<ServicesSpotlight />}
      testimonials={<TestimonialSection />}
      social={<SocialConnect />}
      footer={<SiteFooter />}
    />
  );
}
