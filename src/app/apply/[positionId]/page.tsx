import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { MainTemplate } from "@/components/templates/MainTemplate";
import { SiteHeader } from "@/components/organisms/layout/SiteHeader";
import { SiteFooter } from "@/components/organisms/layout/SiteFooter";
import { getTicketingSupabase } from "@/lib/supabase";
import { createMetadata } from "@/lib/seo";
import { ApplyForm } from "./ApplyForm";
import styles from "./ApplyPage.module.css";

type Position = {
  id: number;
  job_title: string;
  client: string | null;
  location: string | null;
  job_description: string | null;
  is_open: boolean;
};

async function fetchPosition(id: number): Promise<Position | null | "not_configured"> {
  try {
    const supabase = getTicketingSupabase();
    const { data, error } = await supabase
      .from("positions")
      .select("id, job_title, client, location, job_description, is_open")
      .eq("id", id)
      .maybeSingle();

    if (error?.message?.toLowerCase().includes("does not exist")) {
      return "not_configured";
    }
    if (error) {
      console.error("[apply] supabase error:", error.message);
      return null;
    }
    return (data as Position | null) ?? null;
  } catch (err) {
    console.error("[apply] fetchPosition failed:", err instanceof Error ? err.message : err);
    return "not_configured";
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ positionId: string }>;
}): Promise<Metadata> {
  const { positionId } = await params;
  const description =
    "Submit your application to Romega Solutions. Our recruitment team will be in touch within 5–7 business days.";
  const id = Number.parseInt(positionId, 10);
  if (!Number.isFinite(id) || id <= 0) {
    return createMetadata({ title: "Apply", description, path: `/apply/${positionId}` });
  }
  const result = await fetchPosition(id);
  const title =
    result && result !== "not_configured" ? `Apply for ${result.job_title}` : "Apply";
  return createMetadata({ title, description, path: `/apply/${id}` });
}

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ positionId: string }>;
}) {
  const { positionId } = await params;
  const id = Number.parseInt(positionId, 10);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const result = await fetchPosition(id);

  return (
    <MainTemplate header={<SiteHeader />} footer={<SiteFooter />}>
      <div className={styles.page}>
        <div className={styles.inner}>
          {result === "not_configured" ? (
            <NotConfigured />
          ) : !result ? (
            <NotFound />
          ) : (
            <PositionView position={result} />
          )}
        </div>
      </div>
    </MainTemplate>
  );
}

function PositionView({ position }: { position: Position }) {
  return (
    <>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Romega Solutions · Careers</p>
        <h1 className={styles.title}>{position.job_title}</h1>
        <div className={styles.metaRow}>
          {position.client && <span className={styles.metaItem}>{position.client}</span>}
          {position.location && <span className={styles.metaItem}>{position.location}</span>}
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
          {position.job_description && (
            <section className={styles.card}>
              <h2 className={styles.cardEyebrow}>About the role</h2>
              <p className={styles.description}>{position.job_description}</p>
            </section>
          )}

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Apply</h2>
            <p className={styles.cardLead}>
              Submit your details and resume below. We&apos;ll send you a confirmation email.
            </p>
            <ApplyForm positionId={position.id} jobTitle={position.job_title} />
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

function NotFound() {
  return (
    <section className={styles.card}>
      <h1 className={styles.cardTitle}>Position not found</h1>
      <p className={styles.cardBody}>
        This role may have been removed or filled. See{" "}
        <Link href="/careers" className={styles.link}>
          all open opportunities
        </Link>
        .
      </p>
    </section>
  );
}
