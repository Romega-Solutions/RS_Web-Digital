import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

const routes = [
  { path: "/", priority: 1 },
  { path: "/about", priority: 0.85 },
  { path: "/services", priority: 0.9 },
  { path: "/careers", priority: 0.75 },
  { path: "/talent", priority: 0.75 },
  { path: "/contact", priority: 0.8 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: "monthly",
    priority: route.priority,
  }));
}
