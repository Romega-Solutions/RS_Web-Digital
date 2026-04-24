import type { Metadata } from "next";
import { RouteAnnouncer } from "@/components/accessibility/RouteAnnouncer";
import localFont from "next/font/local";
import { Poppins } from "next/font/google";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

const seasonsStyle = localFont({
  src: [
    {
      path: "../../public/season-webfont/Season-BF651e732546f7d.woff",
      weight: "400",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-seasons-style",
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  metadataBase: siteConfig.url,
  title: {
    default: "Romega Solutions | Talent, Brand, and Operations Support",
    template: "%s | Romega Solutions",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [...siteConfig.defaultKeywords],
  authors: [{ name: siteConfig.name, url: absoluteUrl("/") }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: absoluteUrl("/"),
    siteName: siteConfig.name,
    title: "Romega Solutions | Talent, Brand, and Operations Support",
    description: siteConfig.description,
    images: [
      {
        url: absoluteUrl(siteConfig.ogImage),
        alt: "Romega Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Romega Solutions | Talent, Brand, and Operations Support",
    description: siteConfig.description,
    images: [absoluteUrl(siteConfig.ogImage)],
  },
  robots: {
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
  alternates: {
    canonical: "/",
  },
  category: "business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        className={`${poppins.variable} ${seasonsStyle.variable} min-h-full flex flex-col`}
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <RouteAnnouncer />
        {children}
      </body>
    </html>
  );
}
