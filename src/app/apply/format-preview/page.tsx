import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RichText } from "@/components/molecules/content/RichText";
import { SiteFooter } from "@/components/organisms/layout/SiteFooter";
import { SiteHeader } from "@/components/organisms/layout/SiteHeader";
import { MainTemplate } from "@/components/templates/MainTemplate";
import { JOB_DESCRIPTION_FIXTURE_HTML } from "@/lib/job-description-fixture";
import { createMetadata } from "@/lib/seo";
import styles from "../[positionId]/ApplyPage.module.css";

const noindexRobots: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = createMetadata({
  title: "Job description formatting preview",
  description:
    "Preview of sanitized job-description HTML. This page is not a job listing.",
  path: "/apply/format-preview",
  robots: noindexRobots,
});

export default function JobDescriptionFormatPreviewPage() {
  if (process.env.VERCEL_ENV === "production") notFound();

  return (
    <MainTemplate header={<SiteHeader />} footer={<SiteFooter />}>
      <div className={styles.page}>
        <div className={styles.inner}>
          <header className={styles.header}>
            <p className={styles.eyebrow}>Romega Solutions · Careers</p>
            <h1 className={styles.title}>Formatting preview</h1>
            <div className={styles.metaRow}>
              <span className={styles.metaItem}>Sample description</span>
              <span className={styles.statusOpen}>Open</span>
            </div>
          </header>
          <section className={styles.card} id="job-description">
            <h2 className={styles.cardEyebrow}>About the role</h2>
            <RichText html={JOB_DESCRIPTION_FIXTURE_HTML} />
          </section>
        </div>
      </div>
    </MainTemplate>
  );
}
