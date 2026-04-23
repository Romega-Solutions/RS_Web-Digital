import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteFooter } from "@/components/organisms/layout/SiteFooter";
import { SiteHeader } from "@/components/organisms/layout/SiteHeader";
import { TalentCTA } from "@/components/organisms/talent/TalentCTA";
import { TalentPool } from "@/components/organisms/talent/TalentPool";
import { talentProfiles } from "@/components/organisms/talent/talentData";
import { absoluteUrl, createMetadata } from "@/lib/seo";
import TalentPageClient from "./TalentPageClient";

export const metadata: Metadata = createMetadata({
  title: "Curated Talent Pool for Growth Teams",
  description:
    "Browse Romega Solutions talent across operations, sales, design, software, AI, and executive support for fast-moving teams.",
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
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
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
            name: "Talent",
            item: absoluteUrl("/talent"),
          },
        ],
      },
    ],
  };

  return (
    <div className="site-shell" id="top">
      <JsonLd id="talent-structured-data" data={structuredData} />
      <SiteHeader activeItem="Careers & Talents" />
      <main>
        <TalentPageClient />
        <TalentPool talents={talentProfiles} />
        <TalentCTA />
      </main>
      <SiteFooter />
    </div>
  );
}
