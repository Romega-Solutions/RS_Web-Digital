import Link from "next/link";
import { MainTemplate } from "@/components/templates/MainTemplate";
import { SiteHeader } from "@/components/organisms/layout/SiteHeader";
import { SiteFooter } from "@/components/organisms/layout/SiteFooter";
import styles from "./ApplyPage.module.css";

export default function ApplyNotFound() {
  return (
    <MainTemplate header={<SiteHeader />} footer={<SiteFooter />}>
      <div className={styles.page}>
        <div className={styles.inner}>
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
        </div>
      </div>
    </MainTemplate>
  );
}
