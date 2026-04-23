import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.romega-solutions.com";

export const siteConfig = {
  name: "Romega Solutions",
  legalName: "Romega Solutions",
  url: new URL(siteUrl),
  description:
    "Romega Solutions helps businesses build stronger teams, sharpen brand positioning, and improve operations with steady, strategic support.",
  ogImage: "/opengraph-image",
  logo: "/RS_Logo-Blue.png",
  email: "info@romega-solutions.com",
  linkedIn: "https://www.linkedin.com/company/romega-solutions",
  address: {
    streetAddress: "222 Pacific Coast Hwy, #10",
    addressLocality: "El Segundo",
    addressRegion: "CA",
    postalCode: "90245",
    addressCountry: "US",
  },
  defaultKeywords: [
    "Romega Solutions",
    "talent solutions",
    "executive search",
    "remote hiring",
    "brand strategy",
    "business growth support",
    "strategic operations",
    "global talent",
    "recruitment partner",
    "operations consulting",
  ],
} as const;

type BuildMetadataInput = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  image?: string;
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}

export function createMetadata({
  title,
  description,
  path = "/",
  keywords = [],
  image = siteConfig.ogImage,
}: BuildMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  return {
    title,
    description,
    keywords: [...siteConfig.defaultKeywords, ...keywords],
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${title} | ${siteConfig.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export function createOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: absoluteUrl("/"),
    logo: absoluteUrl(siteConfig.logo),
    image: absoluteUrl(siteConfig.ogImage),
    description: siteConfig.description,
    email: siteConfig.email,
    sameAs: [siteConfig.linkedIn],
    address: {
      "@type": "PostalAddress",
      ...siteConfig.address,
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: siteConfig.email,
      contactType: "sales",
      availableLanguage: ["English"],
      areaServed: ["US", "APAC"],
    },
  };
}

export function createWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    url: absoluteUrl("/"),
    name: siteConfig.name,
    description: siteConfig.description,
    publisher: {
      "@id": absoluteUrl("/#organization"),
    },
    inLanguage: "en-US",
  };
}
