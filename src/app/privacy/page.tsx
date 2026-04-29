import type { Metadata } from "next";
import { LegalTemplate } from "@/components/templates/LegalTemplate";
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
    <LegalTemplate
      header={<SiteHeader />}
      footer={<SiteFooter />}
      title="Privacy Policy"
      subtitle="How we collect, use, and protect your personal information at Romega Solutions."
      lastUpdated="April 24, 2026"
    >
      <LegalPageCard>
        <PrivacyPolicyContent />
      </LegalPageCard>
    </LegalTemplate>
  );
}
