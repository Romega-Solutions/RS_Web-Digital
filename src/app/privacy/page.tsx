import type { Metadata } from "next";
import { LegalTemplate } from "@/components/templates/LegalTemplate";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteFooter } from "@/components/organisms/layout/SiteFooter";
import { SiteHeader } from "@/components/organisms/layout/SiteHeader";
import { LegalPageCard } from "@/components/organisms/shared/LegalPageCard";
import { PrivacyPolicyContent } from "@/components/organisms/shared/PrivacyPolicyContent";
import { absoluteUrl, createBreadcrumbSchema, createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Privacy Policy",
  description:
    "Read Romega Solutions' Privacy and Consent Policy for data handling, consent, and privacy rights.",
  path: "/privacy",
  keywords: ["privacy policy", "data policy", "consent policy"],
});

export default function PrivacyPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      createBreadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Privacy Policy", path: "/privacy" },
      ]),
      {
        "@type": "WebPage",
        "@id": absoluteUrl("/privacy#webpage"),
        url: absoluteUrl("/privacy"),
        name: "Romega Solutions Privacy Policy",
        description:
          "How Romega Solutions collects, uses, and protects your personal information.",
        isPartOf: { "@id": absoluteUrl("/#website") },
        about: { "@id": absoluteUrl("/#organization") },
        inLanguage: "en-US",
        datePublished: "2025-08-27",
        dateModified: "2026-04-24",
      },
    ],
  };

  return (
    <LegalTemplate
      jsonLd={<JsonLd id="privacy-structured-data" data={structuredData} />}
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
