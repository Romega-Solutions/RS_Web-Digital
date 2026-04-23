import type { Metadata } from "next";
import { SiteFooter } from "@/components/organisms/layout/SiteFooter";
import { SiteHeader } from "@/components/organisms/layout/SiteHeader";
import { LegalPageCard } from "@/components/organisms/shared/LegalPageCard";
import { PrivacyPolicyContent } from "@/components/organisms/shared/PrivacyPolicyContent";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Privacy Policy",
  description:
    "Read Romega Solutions' Applicant Data Privacy and Consent Policy for data handling, consent, and privacy rights.",
  path: "/privacy",
  keywords: ["privacy policy", "applicant data policy", "consent policy"],
});

export default function PrivacyPage() {
  return (
    <div className="site-shell" id="top">
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-4xl px-4 py-16 md:px-6">
        <h1 className="text-3xl font-semibold text-gray-900 md:text-4xl">
          Applicant Data Privacy and Consent Policy
        </h1>
        <LegalPageCard>
          <PrivacyPolicyContent />
        </LegalPageCard>
      </main>
      <SiteFooter />
    </div>
  );
}
