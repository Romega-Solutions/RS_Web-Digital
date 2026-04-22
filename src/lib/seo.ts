const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.romega-solutions.com";

export const siteConfig = {
  name: "Romega Solutions",
  url: new URL(siteUrl),
  description:
    "Romega Solutions helps growing businesses build teams, strengthen brands, and scale with clarity.",
  ogImage: "/favicon.ico",
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}
