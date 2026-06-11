import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { fetchOpenPositions } from "@/lib/careers-data";
import { staticSeoRoutes } from "@/lib/seo-routes";

// Regenerate the sitemap every 5 minutes so newly-opened roles surface
// to crawlers without redeploying.
export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const base: MetadataRoute.Sitemap = staticSeoRoutes.map((route) => {
    const image = "image" in route ? route.image : undefined;

    return {
      url: absoluteUrl(route.path),
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      ...(image ? { images: [absoluteUrl(image)] } : {}),
    };
  });

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
