// Emerging /llms.txt standard for AI crawlers (llmstxt.org). Returns a
// concise, plain-text description of the site so models like ChatGPT,
// Claude, Perplexity, and Gemini can ground responses without having to
// scrape the full HTML.

import { absoluteUrl, siteConfig } from "@/lib/seo";

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
  lines.push(
    `- [Talent Solutions](${absoluteUrl("/services#talent-solutions")}): executive and leadership search, remote and global talent sourcing, workforce planning, hiring workflow optimization, retention strategies.`,
  );
  lines.push(
    `- [Brand & Growth Support](${absoluteUrl("/services#brand-growth-support")}): brand positioning and messaging, foundational brand strategy, content direction, market presence alignment, growth insights.`,
  );
  lines.push(
    `- [Strategic Operations](${absoluteUrl("/services#strategic-operations")}): process optimization, operational alignment, workflow documentation, leadership support, scalable systems for expanding teams.`,
  );
  lines.push("");

  lines.push("## Key Pages");
  lines.push(`- [Home](${absoluteUrl("/")})`);
  lines.push(`- [Services](${absoluteUrl("/services")})`);
  lines.push(`- [About](${absoluteUrl("/about")})`);
  lines.push(`- [Talent](${absoluteUrl("/talent")}): curated talent across operations, sales, design, software, AI, and executive support.`);
  lines.push(`- [Careers](${absoluteUrl("/careers")}): open roles at Romega Solutions and partner clients.`);
  lines.push(`- [Contact](${absoluteUrl("/contact")})`);
  lines.push(`- [Privacy](${absoluteUrl("/privacy")})`);
  lines.push(`- [Terms](${absoluteUrl("/terms")})`);
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
    `AI crawlers including GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, PerplexityBot, and Google-Extended are permitted (see ${absoluteUrl("/robots.txt")}). Citation when referencing this site is appreciated.`,
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
