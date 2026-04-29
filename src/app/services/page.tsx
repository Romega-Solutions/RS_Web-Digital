import type { Metadata } from "next";
import { MainTemplate } from "@/components/templates/MainTemplate";
import { ServicesHero } from "@/components/organisms/services/ServicesHero";
import { ServicesDetailSection } from "@/components/organisms/services/ServicesDetailSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { ServiceStrip } from "@/components/organisms/home/ServiceStrip";
import { SiteFooter } from "@/components/organisms/layout/SiteFooter";
import { SiteHeader } from "@/components/organisms/layout/SiteHeader";
import { ConsultationBanner } from "@/components/organisms/shared/ConsultationBanner";
import { absoluteUrl, createMetadata, createBreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Our Services",
  description:
    "Expert talent acquisition, brand and growth support, and strategic operations for businesses ready to scale.",
  path: "/services",
  keywords: [
    "talent solutions",
    "brand strategy services",
    "strategic operations consulting",
    "remote hiring support",
    "business growth services",
  ],
});

const detailedServices = [
  {
    id: "talent-solutions",
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
    imageSrc: "/2.0%20Website%20Assets/Image%201%20_%20Talent%20Solutions.webp",
    imageAlt: "Talent Solutions",
  },
  {
    id: "brand-growth-support",
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
    imageSrc: "/2.0%20Website%20Assets/Image%202%20_%20Brand%20%26%20Growth%20Support.webp",
    imageAlt: "Brand and Growth Support",
  },
  {
    id: "strategic-operations",
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
    imageSrc: "/2.0%20Website%20Assets/Image%203%20_%20Strategic%20Operations.webp",
    imageAlt: "Strategic Operations",
  },
] as const;

export default function ServicesPage() {
  const breadcrumbData = createBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
  ]);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumbData,
      {
        "@type": "CollectionPage",
        "@id": absoluteUrl("/services#webpage"),
        url: absoluteUrl("/services"),
        name: "Romega Solutions Services",
        description:
          "Explore Romega Solutions services across talent acquisition, brand and growth support, and strategic operations for scaling businesses.",
        isPartOf: {
          "@id": absoluteUrl("/#website"),
        },
      },
      {
        "@type": "OfferCatalog",
        name: "Romega Solutions Service Catalog",
        itemListElement: detailedServices.map((service) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: service.title,
            description: service.copy,
          },
        })),
      },
    ],
  };

  return (
    <MainTemplate
      jsonLd={<JsonLd id="services-structured-data" data={structuredData} />}
      header={<SiteHeader activeItem="Services" />}
      footer={<SiteFooter />}
    >
      <ServicesHero />

      <div id="services-overview">
        <ServiceStrip />
      </div>

      <ServicesDetailSection services={detailedServices} />

      <div id="consultation">
        <ConsultationBanner />
      </div>
    </MainTemplate>
  );
}
