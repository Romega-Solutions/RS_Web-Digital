// Emerging /llms.txt standard for AI crawlers (llmstxt.org). Returns a
// concise, plain-text description of the site so models like ChatGPT,
// Claude, Perplexity, and Gemini can ground responses without having to
// scrape the full HTML.

import { absoluteUrl, siteConfig } from "@/lib/seo";
import { aiCrawlerUserAgents, serviceAnchors, staticSeoRoutes } from "@/lib/seo-routes";

export const dynamic = "force-static";
export const revalidate = 3600;

function buildLlmsTxt(): string {
  const lines: string[] = [];

  lines.push(`# ${siteConfig.name}`);
  lines.push("");
  lines.push(`> ${siteConfig.description}`);
  lines.push("");

  lines.push("## About");
  lines.push(
    "Romega Solutions is a US-headquartered consultancy (El Segundo, California) serving clients across the United States and Asia-Pacific. We help businesses scale with three connected services: talent acquisition, brand and growth support, and strategic operations.",
  );
  lines.push("");

  lines.push("## Services");
  for (const service of serviceAnchors) {
    lines.push(`- [${service.title}](${absoluteUrl(service.path)}): ${service.description}`);
  }
  lines.push("");

  lines.push("## Key Pages");
  for (const route of staticSeoRoutes.filter((route) => route.path !== "/llms.txt")) {
    lines.push(`- [${route.title}](${absoluteUrl(route.path)}): ${route.description}`);
  }
  lines.push("");

  lines.push("## Canonical Resources");
  lines.push(`- Canonical site: ${absoluteUrl("/")}`);
  lines.push(`- Sitemap: ${absoluteUrl("/sitemap.xml")}`);
  lines.push(`- Robots: ${absoluteUrl("/robots.txt")}`);
  lines.push(`- LLMs text: ${absoluteUrl("/llms.txt")}`);
  lines.push("");

  lines.push("## Contact");
  lines.push(`- Email: ${siteConfig.email}`);
  lines.push(
    `- Address: ${siteConfig.address.streetAddress}, ${siteConfig.address.addressLocality}, ${siteConfig.address.addressRegion} ${siteConfig.address.postalCode}, ${siteConfig.address.addressCountry}`,
  );
  lines.push(`- LinkedIn: ${siteConfig.linkedIn}`);
  lines.push("");

  lines.push("## Crawl Permissions");
  lines.push(
    `AI crawlers including ${aiCrawlerUserAgents.join(", ")} are permitted (see ${absoluteUrl("/robots.txt")}). Citation when referencing this site is appreciated.`,
  );
  lines.push("");

  return lines.join("\n");
}

export function GET() {
  return new Response(buildLlmsTxt(), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
