import type { Metadata } from "next";
import { MainTemplate } from "@/components/templates/MainTemplate";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteFooter } from "@/components/organisms/layout/SiteFooter";
import { SiteHeader } from "@/components/organisms/layout/SiteHeader";
import { MarketResearchList } from "@/components/organisms/market-research/MarketResearchList";
import { getAllPosts } from "@/lib/market-research";
import { absoluteUrl, createBreadcrumbSchema, createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Market Research",
  description:
    "Research and analysis from the Romega Solutions team on the markets, technologies, and trends shaping business growth.",
  path: "/market-research",
  keywords: ["market research", "industry analysis", "AI data centers", "Romega research"],
});

export default async function MarketResearchPage() {
  const posts = await getAllPosts();

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      createBreadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Market Research", path: "/market-research" },
      ]),
      {
        "@type": "CollectionPage",
        "@id": absoluteUrl("/market-research#webpage"),
        url: absoluteUrl("/market-research"),
        name: "Romega Solutions Market Research",
        isPartOf: { "@id": absoluteUrl("/#website") },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: posts.map((post, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: absoluteUrl(`/market-research/${post.slug}`),
            name: post.title,
          })),
        },
      },
    ],
  };

  return (
    <MainTemplate
      jsonLd={<JsonLd id="market-research-structured-data" data={structuredData} />}
      header={<SiteHeader activeItem="Market Research" />}
      footer={<SiteFooter />}
    >
      <MarketResearchList posts={posts} />
    </MainTemplate>
  );
}
