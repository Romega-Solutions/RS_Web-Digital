import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1c5fa5" },
    { media: "(prefers-color-scheme: dark)", color: "#1c5fa5" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: siteConfig.url,
  title: {
    default: `${siteConfig.name} | Talent, Brand, and Operations Support`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [...siteConfig.defaultKeywords],
  authors: [{ name: siteConfig.name, url: absoluteUrl("/") }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  icons: {
    icon: siteConfig.favicon,
    shortcut: siteConfig.favicon,
    apple: "/apple-touch-icon.png", // Standard naming
  },
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: absoluteUrl("/"),
    siteName: siteConfig.name,
    images: [
      {
        url: absoluteUrl(siteConfig.ogImage),
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
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
    canonical: "./",
  },
  category: "business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body
        className={`${poppins.variable} ${seasonsStyle.variable} min-h-full flex flex-col font-sans`}
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
