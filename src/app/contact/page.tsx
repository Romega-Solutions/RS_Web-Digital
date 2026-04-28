import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteFooter } from "@/components/organisms/layout/SiteFooter";
import { SiteHeader } from "@/components/organisms/layout/SiteHeader";
import { absoluteUrl, createMetadata, siteConfig } from "@/lib/seo";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = createMetadata({
  title: "Contact Romega Solutions",
  description:
    "Contact Romega Solutions for business inquiries, partnerships, hiring support, and strategic growth conversations.",
  path: "/contact",
  keywords: [
    "contact romega solutions",
    "business inquiry",
    "hiring support consultation",
    "growth strategy consultation",
  ],
});

export default function ContactPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": absoluteUrl("/contact#webpage"),
        url: absoluteUrl("/contact"),
        name: "Contact Romega Solutions",
        description:
          "Contact Romega Solutions for business inquiries, partnerships, hiring support, and strategic growth conversations.",
        isPartOf: {
          "@id": absoluteUrl("/#website"),
        },
        about: {
          "@id": absoluteUrl("/#organization"),
        },
      },
      {
        "@type": "Organization",
        "@id": absoluteUrl("/contact#contact"),
        name: siteConfig.name,
        email: siteConfig.email,
        address: {
          "@type": "PostalAddress",
          ...siteConfig.address,
        },
        sameAs: [siteConfig.linkedIn, siteConfig.instagram, siteConfig.facebook],
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
    <div className="site-shell" id="top">
      <JsonLd id="contact-structured-data" data={structuredData} />
      <SiteHeader />
      <ContactPageClient />
      <SiteFooter />
    </div>
  );
}
