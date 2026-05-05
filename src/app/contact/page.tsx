import type { Metadata } from "next";
import { MainTemplate } from "@/components/templates/MainTemplate";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteFooter } from "@/components/organisms/layout/SiteFooter";
import { SiteHeader } from "@/components/organisms/layout/SiteHeader";
import { absoluteUrl, createMetadata } from "@/lib/seo";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = createMetadata({
  title: "Contact Romega Solutions",
  description:
    "Get in touch with Romega Solutions to discuss talent, brand, and operations support tailored to your growth goals.",
  path: "/contact",
  keywords: [
    "contact romega",
    "hire romega solutions",
    "business inquiry",
    "talent consulting contact",
    "brand strategy inquiry",
  ],
});

export default function ContactPage() {
  const contactFormAvailable =
    Boolean(process.env.RESEND_API_KEY) ||
    (process.env.EMAIL_CONTACT_FALLBACK_ENABLED?.toLowerCase() === "true" &&
      process.env.NODE_ENV !== "production");

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": absoluteUrl("/contact#webpage"),
        url: absoluteUrl("/contact"),
        name: "Contact Romega Solutions",
        description:
          "Get in touch with Romega Solutions to discuss talent, brand, and operations support tailored to your growth goals.",
        isPartOf: {
          "@id": absoluteUrl("/#website"),
        },
        about: {
          "@id": absoluteUrl("/#organization"),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: absoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Contact",
            item: absoluteUrl("/contact"),
          },
        ],
      },
    ],
  };

  return (
    <MainTemplate
      jsonLd={<JsonLd id="contact-structured-data" data={structuredData} />}
      header={<SiteHeader />}
      footer={<SiteFooter />}
    >
      <ContactPageClient contactFormAvailable={contactFormAvailable} />
    </MainTemplate>
  );
}
