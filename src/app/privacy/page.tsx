import type { Metadata } from "next";
import { SiteFooter } from "@/components/organisms/layout/SiteFooter";
import { SiteHeader } from "@/components/organisms/layout/SiteHeader";
import { LegalPageCard } from "@/components/organisms/shared/LegalPageCard";
import { PrivacyPolicyContent } from "@/components/organisms/shared/PrivacyPolicyContent";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Privacy Policy",
  description:
    "Read Romega Solutions' Privacy and Consent Policy for data handling, consent, and privacy rights.",
  path: "/privacy",
  keywords: ["privacy policy", "data policy", "consent policy"],
});

export default function PrivacyPage() {
  return (
    <div className="site-shell" id="top">
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="legal-page-shell">
        <h1 className="sr-only">Privacy Policy</h1>
        <LegalPageCard>
          <PrivacyPolicyContent />
        </LegalPageCard>
      </main>
      <SiteFooter />
    </div>
  );
}
