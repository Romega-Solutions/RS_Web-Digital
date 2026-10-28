import { headers } from "next/headers";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { MainTemplate } from "@/components/templates/MainTemplate";
import { SiteHeader } from "@/components/organisms/layout/SiteHeader";
import { SiteFooter } from "@/components/organisms/layout/SiteFooter";
import { JsonLd } from "@/components/seo/JsonLd";
import { RichText } from "@/components/molecules/content/RichText";
import { isRichTextEmpty, jobDescriptionContent } from "@/lib/sanitize";
import { absoluteUrl, createBreadcrumbSchema, createMetadata, siteConfig } from "@/lib/seo";
import { employmentTypeLabel, googleEmploymentType } from "@/lib/employment-type";
import { normalizeCountry, type CountryCode } from "@/lib/form/countries";
import { positionApplyPath } from "@/lib/position-slug";
import { resolveApplyPosition, type PublicPosition } from "@/lib/positions";
import { ApplyForm } from "./ApplyForm";
import styles from "./ApplyPage.module.css";

type Position = PublicPosition;

const noindexRobots: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
  },
};

const fallbackDescription =
  "Submit your application to Romega Solutions. Our recruitment team will be in touch within 5–7 business days.";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ positionId: string }>;
}): Promise<Metadata> {
  const { positionId } = await params;
  const resolved = await resolveApplyPosition(positionId);
  if (resolved.status !== "ok" && resolved.status !== "redirect") {
    return createMetadata({
      title: "Apply",
      description: fallbackDescription,
      path: `/apply/${positionId}`,
      robots: noindexRobots,
    });
  }

  const position = resolved.position;
  const path = positionApplyPath(position.resolvedSlug);
  const roleDescription = [
    `Apply for ${position.job_title} with Romega Solutions.`,
    position.location ? `Location: ${position.location}.` : "",
    position.client ? `Client or team: ${position.client}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
  const pageDescription = jobDescriptionContent(position.job_description).meta || roleDescription;

  return createMetadata({
    title: `Apply for ${position.job_title}`,
    description: pageDescription,
    path,
    keywords: [position.job_title, position.location, "romega solutions application"].filter(
      (keyword): keyword is string => Boolean(keyword),
    ),
    robots: position.is_open ? undefined : noindexRobots,
  });
}

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ positionId: string }>;
}) {
  const { positionId } = await params;
  const resolved = await resolveApplyPosition(positionId);
  if (resolved.status === "redirect") permanentRedirect(resolved.path);
  if (resolved.status === "not_found") notFound();

  const position = resolved.status === "ok" ? resolved.position : null;
  // Vercel's edge sets this header; locally it is absent and the form opens on PH.
  const defaultCountry = normalizeCountry((await headers()).get("x-vercel-ip-country"));
  const path = position ? positionApplyPath(position.resolvedSlug) : "";
  const descriptionContent = position ? jobDescriptionContent(position.job_description) : null;
  const jobEmploymentType = position ? googleEmploymentType(position.employment_type) : null;
  const structuredData =
    position && descriptionContent
      ? {
          "@context": "https://schema.org",
          "@graph": [
            createBreadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Careers", path: "/careers" },
              { name: position.job_title, path },
            ]),
            {
              "@type": "WebPage",
              "@id": absoluteUrl(`${path}#webpage`),
              url: absoluteUrl(path),
              name: `Apply for ${position.job_title}`,
              description:
                descriptionContent.plain ||
                `Application page for ${position.job_title} with Romega Solutions.`,
              isPartOf: { "@id": absoluteUrl("/#website") },
              about: { "@id": absoluteUrl("/#organization") },
              inLanguage: "en-US",
            },
            ...(position.is_open
              ? [
                  {
                    "@type": "JobPosting",
                    "@id": absoluteUrl(`${path}#jobposting`),
                    title: position.job_title,
                    description:
                      descriptionContent.html || `Open role through ${siteConfig.name}.`,
                    datePosted: new Date().toISOString().slice(0, 10),
                    ...(jobEmploymentType ? { employmentType: jobEmploymentType } : {}),
                    hiringOrganization: {
                      "@type": "Organization",
                      name: siteConfig.name,
                      sameAs: absoluteUrl("/"),
                      logo: absoluteUrl(siteConfig.logo),
                    },
                    jobLocation: {
                      "@type": "Place",
                      name: position.location || "Remote or client-dependent",
                      address: {
                        "@type": "PostalAddress",
                        addressLocality: position.location || "Remote",
                        addressCountry: "US",
                      },
                    },
                    directApply: true,
                    url: absoluteUrl(path),
                  },
                ]
              : []),
          ],
        }
      : undefined;

  return (
    <MainTemplate
      jsonLd={
        structuredData ? (
          <JsonLd id="apply-position-structured-data" data={structuredData} />
        ) : undefined
      }
      header={<SiteHeader />}
      footer={<SiteFooter />}
    >
      <div className={styles.page}>
        <div className={styles.inner}>
          {position ? (
            <PositionView position={position} defaultCountry={defaultCountry} />
          ) : (
            <NotConfigured />
          )}
        </div>
      </div>
    </MainTemplate>
  );
}

function PositionView({
  position,
  defaultCountry,
}: {
  position: Position;
  defaultCountry: CountryCode;
}) {
  const jobType = employmentTypeLabel(position.employment_type);
  return (
    <>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Romega Solutions · Careers</p>
        <h1 className={styles.title}>{position.job_title}</h1>
        <div className={styles.metaRow}>
          {position.location && <span className={styles.metaItem}>{position.location}</span>}
          {jobType && <span className={styles.metaItem}>{jobType}</span>}
          <span className={position.is_open ? styles.statusOpen : styles.statusClosed}>
            {position.is_open ? "Open" : "Closed"}
          </span>
        </div>
      </header>

      {!position.is_open ? (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>This position is closed</h2>
          <p className={styles.cardBody}>
            We&apos;re no longer accepting applications for this role. Please check{" "}
            <Link href="/careers" className={styles.link}>
              our other open opportunities
            </Link>
            .
          </p>
        </section>
      ) : (
        <>
          {!isRichTextEmpty(position.job_description) ? (
            <section className={styles.card} id="job-description">
              <h2 className={styles.cardEyebrow}>About the role</h2>
              <RichText html={position.job_description ?? ""} />
            </section>
          ) : null}

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Apply</h2>
            <p className={styles.cardLead}>
              Submit your details and resume below. We&apos;ll send you a confirmation email.
            </p>
            <ApplyForm
              positionId={position.id}
              jobTitle={position.job_title}
              defaultCountry={defaultCountry}
            />
          </section>
        </>
      )}
    </>
  );
}

function NotConfigured() {
  return (
    <section className={styles.card}>
      <h1 className={styles.cardTitle}>Careers page not ready</h1>
      <p className={styles.cardBody}>
        Our applications system is still being set up. Please check back soon, or email{" "}
        <a href="mailto:careers@romega-solutions.com" className={styles.link}>
          careers@romega-solutions.com
        </a>
        .
      </p>
    </section>
  );
}
