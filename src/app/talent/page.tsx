import type { Metadata } from "next";
import { MainTemplate } from "@/components/templates/MainTemplate";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteFooter } from "@/components/organisms/layout/SiteFooter";
import { SiteHeader } from "@/components/organisms/layout/SiteHeader";
import { TalentCTA } from "@/components/organisms/talent/TalentCTA";
import { absoluteUrl, createMetadata, createBreadcrumbSchema } from "@/lib/seo";
import TalentPageClient from "./TalentPageClient";

export const metadata: Metadata = createMetadata({
  title: "Talent Pool",
  description:
    "Curated Romega Solutions talent across operations, sales, design, software, AI, and executive support. Get in touch to access profiles matched to your role.",
  path: "/talent",
  keywords: [
    "curated talent pool",
    "hire remote talent",
    "hire developers",
    "hire executive assistant",
    "hire brand strategist",
    "hire AI engineer",
  ],
});

export default function TalentPage() {
  const breadcrumbData = createBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Talent", path: "/talent" },
  ]);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumbData,
      {
        "@type": "CollectionPage",
        "@id": absoluteUrl("/talent#webpage"),
        url: absoluteUrl("/talent"),
        name: "Romega Solutions Talent Pool",
        description:
          "Curated Romega Solutions talent across operations, sales, design, software, AI, and executive support. Profiles shared on request through direct outreach.",
        isPartOf: { "@id": absoluteUrl("/#website") },
        about: { "@id": absoluteUrl("/#organization") },
      },
    ],
  };

  return (
    <MainTemplate
      jsonLd={<JsonLd id="talent-structured-data" data={structuredData} />}
      header={<SiteHeader activeItem="Careers & Talents" />}
      footer={<SiteFooter />}
      shellVariant="hero"
    >
      <TalentPageClient />
      <TalentCTA />
    </MainTemplate>
  );
}
