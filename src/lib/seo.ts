import type { Metadata } from "next";

const FALLBACK_SITE_URL = "https://www.romega-solutions.com";
const PREVIEW_HOST_SUFFIXES = [".vercel.app"];

function normalizeSiteUrl(raw: string | undefined): string {
  const value = raw?.trim();
  if (!value) return FALLBACK_SITE_URL;
  // Vercel env vars (e.g. NEXT_PUBLIC_SITE_URL) are often set without a
  // scheme (e.g. "romega-digital.vercel.app"), which makes `new URL()` throw
  // ERR_INVALID_URL during the build. Prepend https:// when missing.
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withScheme);
    if (PREVIEW_HOST_SUFFIXES.some((suffix) => url.hostname.endsWith(suffix))) {
      return FALLBACK_SITE_URL;
    }
    url.hash = "";
    url.search = "";
    return url.toString();
  } catch {
    return FALLBACK_SITE_URL;
  }
}

const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

export const siteConfig = {
  name: "Romega Solutions",
  legalName: "Romega Solutions",
  url: new URL(siteUrl),
  description:
    "Romega Solutions provides expert talent acquisition, brand growth support, and strategic operations consulting for businesses ready to scale with intention.",
  ogImage: "/opengraph-image",
  logo: "/RS_Logo-Blue.png",
  favicon: "/favicon.png",
  email: "info@romega-solutions.com",
  phone: "+1 (310) 955-1444", // Example phone
  linkedIn: "https://www.linkedin.com/company/romega-solutions/posts/?feedView=all",
  instagram: "https://www.instagram.com/romegasolutions/",
  facebook: "https://www.facebook.com/romegasolutions",
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
  robots?: Metadata["robots"];
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
  robots = {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
}: BuildMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);
  const fullTitle = `${title} | ${siteConfig.name}`;

  return {
    title: path === "/" ? { absolute: fullTitle } : title,
    description,
    keywords: [...siteConfig.defaultKeywords, ...keywords],
    robots,
    icons: {
      icon: siteConfig.favicon,
      shortcut: siteConfig.favicon,
      apple: "/apple-touch-icon.png",
    },
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
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
      title: fullTitle,
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
    telephone: siteConfig.phone,
    sameAs: [siteConfig.linkedIn, siteConfig.instagram, siteConfig.facebook],
    address: {
      "@type": "PostalAddress",
      ...siteConfig.address,
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: siteConfig.email,
      telephone: siteConfig.phone,
      contactType: "sales",
      availableLanguage: ["English"],
      areaServed: ["United States", "Asia-Pacific"],
    },
  };
}

export function createLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": absoluteUrl("/#localbusiness"),
    name: siteConfig.name,
    image: absoluteUrl(siteConfig.ogImage),
    url: absoluteUrl("/"),
    telephone: siteConfig.phone,
    email: siteConfig.email,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      ...siteConfig.address,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 33.9192,
      longitude: -118.4165,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "17:00",
    },
  };
}

export function createBreadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
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
