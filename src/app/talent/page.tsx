import type { Metadata } from "next";
import { Suspense } from "react";
import { MainTemplate } from "@/components/templates/MainTemplate";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteFooter } from "@/components/organisms/layout/SiteFooter";
import { SiteHeader } from "@/components/organisms/layout/SiteHeader";
import { TalentCTA } from "@/components/organisms/talent/TalentCTA";
import { TalentPool } from "@/components/organisms/talent/TalentPool";
import { talentProfiles } from "@/components/organisms/talent/talentData";
import { absoluteUrl, createMetadata, createBreadcrumbSchema } from "@/lib/seo";
import TalentPageClient from "./TalentPageClient";

export const metadata: Metadata = createMetadata({
  title: "Talent Pool",
  description:
    "Browse curated Romega Solutions talent across operations, sales, design, and software for fast-moving teams.",
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
          "Browse Romega Solutions talent across operations, sales, design, software, AI, and executive support for fast-moving teams.",
        isPartOf: {
          "@id": absoluteUrl("/#website"),
        },
        about: {
          "@id": absoluteUrl("/#organization"),
        },
      },
      {
        "@type": "ItemList",
        name: "Featured Talent Profiles",
        numberOfItems: talentProfiles.length,
        itemListElement: talentProfiles.map((talent, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Person",
            name: talent.name,
            jobTitle: talent.role,
            homeLocation: {
              "@type": "Place",
              name: talent.location,
            },
            description: talent.tagline,
            knowsAbout: talent.skills,
          },
        })),
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
      <TalentPageClient talents={talentProfiles} />
      <Suspense fallback={null}>
        <TalentPool talents={talentProfiles} />
      </Suspense>
      <TalentCTA />
    </MainTemplate>
  );
}
