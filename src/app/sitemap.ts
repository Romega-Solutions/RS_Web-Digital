import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { fetchOpenPositions } from "@/lib/careers-data";

// Regenerate the sitemap every 5 minutes so newly-opened roles surface
// to crawlers without redeploying.
export const revalidate = 300;

const staticRoutes = [
  { path: "/", priority: 1, changeFrequency: "weekly" as const },
  { path: "/about", priority: 0.85, changeFrequency: "monthly" as const },
  { path: "/services", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/careers", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/talent", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/contact", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/privacy", priority: 0.4, changeFrequency: "yearly" as const },
  { path: "/terms", priority: 0.4, changeFrequency: "yearly" as const },
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const base: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Pull live open positions and surface each /apply/:id as its own
  // crawlable URL. Closed positions auto-drop on the next regeneration
  // because fetchOpenPositions filters by is_open. Failure is non-fatal
  // — we still return the static routes.
  let applyRoutes: MetadataRoute.Sitemap = [];
  try {
    const jobs = await fetchOpenPositions();
    applyRoutes = jobs.map((job) => ({
      url: absoluteUrl(job.applyUrl),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (err) {
    console.error(
      "[sitemap] couldn't load open positions:",
      err instanceof Error ? err.message : err,
    );
  }

  return [...base, ...applyRoutes];
}
