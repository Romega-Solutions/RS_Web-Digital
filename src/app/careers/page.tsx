import type { Metadata } from "next";
import { MainTemplate } from "@/components/templates/MainTemplate";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteFooter } from "@/components/organisms/layout/SiteFooter";
import { SiteHeader } from "@/components/organisms/layout/SiteHeader";
import { CareersOpenRolesSection } from "@/components/organisms/careers/CareersOpenRolesSection";
import { absoluteUrl, createMetadata, createBreadcrumbSchema, siteConfig } from "@/lib/seo";
import { fetchOpenPositions } from "@/lib/careers-data";
import type { CareerJob } from "@/types/careers";
import CareersPageClient from "./CareersPageClient";

// Refresh the careers page every 5 minutes so newly-opened positions
// surface without redeploying.
export const revalidate = 300;

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

function buildJobPostingSchema(jobs: CareerJob[]) {
  const postedDate = new Date().toISOString().slice(0, 10);
  return {
    "@type": "ItemList",
    "@id": absoluteUrl("/careers#open-roles"),
    name: "Open Roles at Romega Solutions",
    itemListElement: jobs.map((job, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "JobPosting",
        "@id": absoluteUrl(job.applyUrl),
        title: job.title,
        description: job.summary || `Open role at ${job.department}.`,
        datePosted: postedDate,
        employmentType: job.type.toUpperCase().replace(/[\s-]/g, "_"),
        hiringOrganization: {
          "@type": "Organization",
          name: siteConfig.name,
          sameAs: siteConfig.url.toString(),
          logo: absoluteUrl(siteConfig.logo),
        },
        jobLocation: {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: job.location,
          },
        },
        directApply: true,
        url: absoluteUrl(job.applyUrl),
      },
    })),
  };
}

export default async function CareersPage() {
  let jobs: CareerJob[] = [];
  try {
    jobs = await fetchOpenPositions();
  } catch (err) {
    console.error(
      "[careers] failed to load open positions for SSR:",
      err instanceof Error ? err.message : err,
    );
  }

  const breadcrumbData = createBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Careers", path: "/careers" },
  ]);

  const graph: object[] = [
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
  ];
  if (jobs.length > 0) {
    graph.push(buildJobPostingSchema(jobs));
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <MainTemplate
      jsonLd={<JsonLd id="careers-structured-data" data={structuredData} />}
      header={<SiteHeader activeItem="Careers" />}
      footer={<SiteFooter />}
      shellVariant="hero"
    >
      <CareersPageClient />
      <CareersOpenRolesSection jobs={jobs} />
    </MainTemplate>
  );
}
