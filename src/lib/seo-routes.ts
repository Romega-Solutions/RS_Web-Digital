export const aiCrawlerUserAgents = [
  "OAI-SearchBot",
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "PerplexityBot",
  "Google-Extended",
] as const;

export const searchCrawlerUserAgents = ["Googlebot", "Bingbot"] as const;

export const staticSeoRoutes = [
  {
    path: "/",
    title: "Home",
    description: "Romega Solutions talent, brand, and operations support.",
    priority: 1,
    changeFrequency: "weekly",
    image: "/opengraph-image",
  },
  {
    path: "/about",
    title: "About",
    description: "Learn about Romega Solutions' people-first growth approach.",
    priority: 0.85,
    changeFrequency: "monthly",
    image: "/prompt-images/romega-about-hero.png",
  },
  {
    path: "/services",
    title: "Services",
    description: "Talent acquisition, brand growth support, and strategic operations.",
    priority: 0.9,
    changeFrequency: "monthly",
    image: "/2.0%20Website%20Assets/Image%201%20_%20Talent%20Solutions.webp",
  },
  {
    path: "/careers",
    title: "Careers",
    description: "Open roles and hiring opportunities through Romega Solutions.",
    priority: 0.8,
    changeFrequency: "weekly",
    image: "/prompt-images/romega-talent.png",
  },
  {
    path: "/talent",
    title: "Talent",
    description: "Curated talent across operations, sales, design, software, AI, and executive support.",
    priority: 0.8,
    changeFrequency: "weekly",
    image: "/prompt-images/romega-talent.png",
  },
  {
    path: "/contact",
    title: "Contact",
    description: "Contact Romega Solutions for talent, brand, and operations support.",
    priority: 0.8,
    changeFrequency: "monthly",
    image: "/contact_page.png",
  },
  {
    path: "/privacy",
    title: "Privacy Policy",
    description: "Romega Solutions privacy and consent policy.",
    priority: 0.4,
    changeFrequency: "yearly",
  },
  {
    path: "/terms",
    title: "Terms and Conditions",
    description: "Romega Solutions website and service terms.",
    priority: 0.4,
    changeFrequency: "yearly",
  },
  {
    path: "/llms.txt",
    title: "LLMs.txt",
    description: "Machine-readable summary for AI assistants and answer engines.",
    priority: 0.3,
    changeFrequency: "weekly",
  },
] as const;

export const serviceAnchors = [
  {
    path: "/services#talent-solutions",
    title: "Talent Solutions",
    description:
      "Executive and leadership search, remote and global talent sourcing, workforce planning, hiring workflow optimization, and retention strategies.",
  },
  {
    path: "/services#brand-growth-support",
    title: "Brand & Growth Support",
    description:
      "Brand positioning, messaging clarity, foundational strategy, content direction, market alignment, and growth-focused insights.",
  },
  {
    path: "/services#strategic-operations",
    title: "Strategic Operations",
    description:
      "Process optimization, operational alignment, workflow documentation, leadership support, and scalable systems for expanding teams.",
  },
] as const;
