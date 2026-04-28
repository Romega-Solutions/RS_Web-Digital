import type { Metadata } from "next";
import { SiteFooter } from "@/components/organisms/layout/SiteFooter";
import { SiteHeader } from "@/components/organisms/layout/SiteHeader";
import { LegalPageCard } from "@/components/organisms/shared/LegalPageCard";
import { TermsAndConditionsContent } from "@/components/organisms/shared/TermsAndConditionsContent";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Terms and Conditions",
  description:
    "Read Romega Solutions' Terms and Conditions governing access to and use of this website and related services.",
  path: "/terms",
  keywords: ["terms and conditions", "terms of use", "legal agreement"],
});

export default function TermsPage() {
  return (
    <div className="site-shell" id="top">
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="legal-page-shell">
        <LegalPageCard>
          <TermsAndConditionsContent />
        </LegalPageCard>
      </main>
      <SiteFooter />
    </div>
  );
}
