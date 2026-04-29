import type { Metadata } from "next";
import { MainTemplate } from "@/components/templates/MainTemplate";
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
import {
  createMetadata,
  createOrganizationSchema,
  createWebsiteSchema,
  createLocalBusinessSchema,
  absoluteUrl,
  siteConfig,
} from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Talent, Brand, and Operations Support",
  description:
    "Expert talent acquisition, brand growth support, and strategic operations consulting for businesses ready to scale with intention.",
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
      createLocalBusinessSchema(),
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
          "Expert talent acquisition, brand growth support, and strategic operations consulting for businesses ready to scale with intention.",
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
    <MainTemplate
      jsonLd={<JsonLd id="home-structured-data" data={structuredData} />}
      header={<SiteHeader activeItem="Home" />}
      footer={<SiteFooter />}
      shellVariant="home"
    >
      <HomeHero />
      <ServiceStrip />
      <GrowthSection />
      <TrustSection />
      <ApproachSection />
      <ServicesSpotlight />
      <TestimonialSection />
      <SocialConnect />
    </MainTemplate>
  );
}
