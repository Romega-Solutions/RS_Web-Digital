import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const expectedOrigin = "https://www.romega-solutions.com";
const appDir = ".next/server/app";
const staticPages = [
  { path: "/", html: `${appDir}/index.html`, title: "Talent, Brand, and Operations Support | Romega Solutions" },
  { path: "/about", html: `${appDir}/about.html`, title: "About Us | Romega Solutions" },
  { path: "/services", html: `${appDir}/services.html`, title: "Our Services | Romega Solutions" },
  { path: "/careers", html: `${appDir}/careers.html`, title: "Careers | Romega Solutions" },
  { path: "/talent", html: `${appDir}/talent.html`, title: "Talent Pool | Romega Solutions" },
  { path: "/contact", html: `${appDir}/contact.html`, title: "Contact Romega Solutions | Romega Solutions" },
  { path: "/privacy", html: `${appDir}/privacy.html`, title: "Privacy Policy | Romega Solutions" },
  { path: "/terms", html: `${appDir}/terms.html`, title: "Terms and Conditions | Romega Solutions" },
];

function assertBuilt() {
  assert.ok(
    existsSync(appDir),
    "Missing .next build output. Run `pnpm run build` before `pnpm run audit:seo`.",
  );
}

function readBuiltHtml(filePath) {
  assert.ok(existsSync(filePath), `Missing built HTML file: ${filePath}`);
  return readFileSync(filePath, "utf8");
}

function extractTitle(html) {
  return html.match(/<title>(.*?)<\/title>/)?.[1];
}

function extractCanonical(html) {
  return html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
}

async function getBuiltRouteText(routePath) {
  const moduleUrl = pathToFileURL(`${process.cwd()}/${appDir}/${routePath}/route.js`).href;
  const routeModule = await import(moduleUrl);
  const getHandler = routeModule.default?.routeModule?.userland?.GET ?? routeModule.GET;
  assert.equal(typeof getHandler, "function", `Missing GET handler for ${routePath}`);
  const response = await getHandler();
  assert.equal(response.status, 200, `${routePath} returned ${response.status}`);
  return response.text();
}

assertBuilt();

for (const page of staticPages) {
  const html = readBuiltHtml(page.html);
  assert.equal(extractTitle(html), page.title, `${page.path} has the wrong title`);
  assert.ok(
    !html.includes("| Romega Solutions | Romega Solutions"),
    `${page.path} repeats the site name in the title`,
  );
  assert.equal(
    extractCanonical(html),
    page.path === "/" ? expectedOrigin : `${expectedOrigin}${page.path}`,
    `${page.path} has the wrong canonical URL`,
  );
  assert.ok(html.includes("application/ld+json"), `${page.path} is missing JSON-LD`);
}

const contactHtml = readBuiltHtml(`${appDir}/contact.html`);
assert.ok(
  contactHtml.includes("talent acquisition") &&
    contactHtml.includes("brand and growth support") &&
    contactHtml.includes("strategic operations"),
  "/contact FAQ schema is not aligned with current services",
);
assert.ok(
  !contactHtml.includes("HR, IT, administrative support") &&
    !contactHtml.includes("social media management services"),
  "/contact FAQ schema still contains outdated service positioning",
);

const robotsText = await getBuiltRouteText("robots.txt");
assert.match(robotsText, /User-Agent: \*/);
assert.match(robotsText, new RegExp(`Sitemap: ${expectedOrigin}/sitemap\\.xml`));
assert.match(robotsText, new RegExp(`Host: ${expectedOrigin}`));
for (const agent of [
  "Googlebot",
  "Bingbot",
  "OAI-SearchBot",
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "PerplexityBot",
  "Google-Extended",
]) {
  assert.ok(robotsText.includes(`User-Agent: ${agent}`), `robots.txt is missing ${agent}`);
}

const sitemapXml = await getBuiltRouteText("sitemap.xml");
for (const page of staticPages) {
  const sitemapUrl = page.path === "/" ? `${expectedOrigin}/` : `${expectedOrigin}${page.path}`;
  assert.ok(
    sitemapXml.includes(`<loc>${sitemapUrl}</loc>`),
    `sitemap.xml is missing ${page.path}`,
  );
}
assert.ok(sitemapXml.includes(`<loc>${expectedOrigin}/llms.txt</loc>`), "sitemap.xml is missing /llms.txt");
assert.ok(sitemapXml.includes("<image:loc>"), "sitemap.xml is missing image hints");
assert.ok(!sitemapXml.includes("romega-digital.vercel.app"), "sitemap.xml contains the preview host");

const llmsText = await getBuiltRouteText("llms.txt");
for (const phrase of [
  "# Romega Solutions",
  `${expectedOrigin}/robots.txt`,
  `${expectedOrigin}/sitemap.xml`,
  "Talent Solutions",
  "Brand & Growth Support",
  "Strategic Operations",
  "GPTBot",
  "Google-Extended",
]) {
  assert.ok(llmsText.includes(phrase), `llms.txt is missing: ${phrase}`);
}
assert.ok(!llmsText.includes("romega-digital.vercel.app"), "llms.txt contains the preview host");

for (const asset of [
  "public/favicon.png",
  "public/apple-touch-icon.png",
  "public/RS_Logo-Blue.png",
]) {
  assert.ok(existsSync(asset), `Missing SEO asset: ${asset}`);
}

console.log("SEO audit passed.");
