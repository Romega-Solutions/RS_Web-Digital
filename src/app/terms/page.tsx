import type { Metadata } from "next";
import { LegalTemplate } from "@/components/templates/LegalTemplate";
import { SiteFooter } from "@/components/organisms/layout/SiteFooter";
import { SiteHeader } from "@/components/organisms/layout/SiteHeader";
import { LegalPageCard } from "@/components/organisms/shared/LegalPageCard";
import { TermsConditionsContent } from "@/components/organisms/shared/TermsConditionsContent";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Terms and Conditions",
  description:
    "Read Romega Solutions' Terms and Conditions for using our services and website.",
  path: "/terms",
  keywords: ["terms and conditions", "legal", "user agreement"],
});

export default function TermsPage() {
  return (
    <LegalTemplate
      header={<SiteHeader />}
      footer={<SiteFooter />}
      title="Terms and Conditions"
    >
      <LegalPageCard>
        <TermsConditionsContent />
      </LegalPageCard>
    </LegalTemplate>
  );
}
