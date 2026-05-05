import type { Metadata } from "next";
import { MainTemplate } from "@/components/templates/MainTemplate";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteFooter } from "@/components/organisms/layout/SiteFooter";
import { SiteHeader } from "@/components/organisms/layout/SiteHeader";
import { absoluteUrl, createMetadata, createBreadcrumbSchema } from "@/lib/seo";
import CareersPageClient from "./CareersPageClient";

export const metadata: Metadata = createMetadata({
  title: "Careers",
  description:
    "Explore career opportunities and review leadership and growth-focused roles at Romega Solutions.",
  path: "/careers",
  keywords: [
    "romega careers",
    "remote leadership jobs",
    "talent partner jobs",
    "brand strategist jobs",
    "operations coordinator jobs",
  ],
});

export default function CareersPage() {
  const breadcrumbData = createBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Careers", path: "/careers" },
  ]);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumbData,
      {
        "@type": "CollectionPage",
        "@id": absoluteUrl("/careers#webpage"),
        url: absoluteUrl("/careers"),
        name: "Romega Solutions Careers",
        description:
          "Explore Romega Solutions career opportunities, learn how the hiring process works, and review leadership and growth-focused roles.",
        isPartOf: {
          "@id": absoluteUrl("/#website"),
        },
      },
    ],
  };

  return (
    <MainTemplate
      jsonLd={<JsonLd id="careers-structured-data" data={structuredData} />}
      header={<SiteHeader activeItem="Careers" />}
      footer={<SiteFooter />}
      shellVariant="hero"
    >
      <CareersPageClient />
    </MainTemplate>
  );
}
