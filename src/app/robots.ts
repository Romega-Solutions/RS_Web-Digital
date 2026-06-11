import type { MetadataRoute } from "next";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { aiCrawlerUserAgents, searchCrawlerUserAgents } from "@/lib/seo-routes";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/"],
      },
      {
        userAgent: [...searchCrawlerUserAgents],
        allow: "/",
      },
      {
        userAgent: [...aiCrawlerUserAgents],
        allow: "/",
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteConfig.url.origin,
  };
}
