import type { Metadata } from "next";
import { Suspense } from "react";
import { MainTemplate } from "@/components/templates/MainTemplate";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteFooter } from "@/components/organisms/layout/SiteFooter";
import { SiteHeader } from "@/components/organisms/layout/SiteHeader";
import { TalentCTA } from "@/components/organisms/talent/TalentCTA";
import { TalentPool } from "@/components/organisms/talent/TalentPool";
import { absoluteUrl, createMetadata, createBreadcrumbSchema } from "@/lib/seo";
import { fetchPublishedTalent } from "@/lib/talent-data";
import type { TalentProfile } from "@/components/organisms/talent/talentData";
import TalentPageClient from "./TalentPageClient";

// Refresh the talent page every 5 minutes so newly-published candidates
// surface without redeploying.
export const revalidate = 300;

export const metadata: Metadata = createMetadata({
  title: "Talent Pool",
  description:
    "Curated Romega Solutions talent across operations, sales, design, software, AI, and executive support. Profiles published by our recruiting team — full details shared on request.",
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

function buildPersonItemList(talents: TalentProfile[]) {
  return {
    "@type": "ItemList",
    "@id": absoluteUrl("/talent#talent-pool"),
    name: "Published Talent Profiles",
    numberOfItems: talents.length,
    itemListElement: talents.map((talent, index) => ({
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
  };
}

export default async function TalentPage() {
  const talents = await fetchPublishedTalent();

  const breadcrumbData = createBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Talent", path: "/talent" },
  ]);

  const graph: object[] = [
    breadcrumbData,
    {
      "@type": "CollectionPage",
      "@id": absoluteUrl("/talent#webpage"),
      url: absoluteUrl("/talent"),
      name: "Romega Solutions Talent Pool",
      description:
        "Curated Romega Solutions talent across operations, sales, design, software, AI, and executive support. Recruiter-published profiles; full details shared on request through direct outreach.",
      isPartOf: { "@id": absoluteUrl("/#website") },
      about: { "@id": absoluteUrl("/#organization") },
    },
  ];
  if (talents.length > 0) {
    graph.push(buildPersonItemList(talents));
  }

  const structuredData = { "@context": "https://schema.org", "@graph": graph };

  return (
    <MainTemplate
      jsonLd={<JsonLd id="talent-structured-data" data={structuredData} />}
      header={<SiteHeader activeItem="Careers & Talents" />}
      footer={<SiteFooter />}
      shellVariant="hero"
    >
      <TalentPageClient talents={talents} />
      {talents.length > 0 ? (
        <Suspense fallback={null}>
          <TalentPool talents={talents} />
        </Suspense>
      ) : null}
      <TalentCTA />
    </MainTemplate>
  );
}
