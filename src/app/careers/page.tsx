import type { Metadata } from "next";
import { MainTemplate } from "@/components/templates/MainTemplate";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteFooter } from "@/components/organisms/layout/SiteFooter";
import { SiteHeader } from "@/components/organisms/layout/SiteHeader";
import { mockCareerJobs } from "@/lib/mock-careers";
import { absoluteUrl, createMetadata, siteConfig } from "@/lib/seo";
import CareersPageClient from "./CareersPageClient";

export const metadata: Metadata = createMetadata({
  title: "Careers and Leadership Opportunities",
  description:
    "Explore Romega Solutions career opportunities, learn how the hiring process works, and review leadership and growth-focused roles.",
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
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
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
      {
        "@type": "ItemList",
        name: "Current Career Opportunities",
        numberOfItems: mockCareerJobs.length,
        itemListElement: mockCareerJobs.map((job, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "JobPosting",
            title: job.title,
            description: job.summary,
            employmentType: job.type,
            hiringOrganization: {
              "@type": "Organization",
              name: siteConfig.name,
              sameAs: absoluteUrl("/"),
            },
            jobLocationType: "TELECOMMUTE",
            applicantLocationRequirements: job.location,
            url: job.applyUrl,
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
            name: "Careers",
            item: absoluteUrl("/careers"),
          },
        ],
      },
    ],
  };

  return (
    <MainTemplate
      jsonLd={<JsonLd id="careers-structured-data" data={structuredData} />}
      header={<SiteHeader activeItem="Careers" />}
      footer={<SiteFooter />}
    >
      <CareersPageClient />
    </MainTemplate>
  );
}
