import type { Metadata } from "next";
import { LegalTemplate } from "@/components/templates/LegalTemplate";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteFooter } from "@/components/organisms/layout/SiteFooter";
import { SiteHeader } from "@/components/organisms/layout/SiteHeader";
import { LegalPageCard } from "@/components/organisms/shared/LegalPageCard";
import { TermsAndConditionsContent } from "@/components/organisms/shared/TermsAndConditionsContent";
import { absoluteUrl, createBreadcrumbSchema, createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Terms and Conditions",
  description:
    "Read Romega Solutions' Terms and Conditions for using our services and website.",
  path: "/terms",
  keywords: ["terms and conditions", "legal", "user agreement"],
});

export default function TermsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      createBreadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Terms and Conditions", path: "/terms" },
      ]),
      {
        "@type": "WebPage",
        "@id": absoluteUrl("/terms#webpage"),
        url: absoluteUrl("/terms"),
        name: "Romega Solutions Terms and Conditions",
        description:
          "The legal framework and guidelines for using Romega Solutions services and website.",
        isPartOf: { "@id": absoluteUrl("/#website") },
        about: { "@id": absoluteUrl("/#organization") },
        inLanguage: "en-US",
        datePublished: "2025-08-27",
        dateModified: "2025-08-27",
      },
    ],
  };

  return (
    <LegalTemplate
      jsonLd={<JsonLd id="terms-structured-data" data={structuredData} />}
      header={<SiteHeader />}
      footer={<SiteFooter />}
      title="Terms and Conditions"
      subtitle="The legal framework and guidelines for using our services and website."
      lastUpdated="August 27, 2025"
    >
      <LegalPageCard>
        <TermsAndConditionsContent />
      </LegalPageCard>
    </LegalTemplate>
  );
}
