import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const baseUrl = (process.env.LIVE_AUDIT_BASE_URL || "https://romega-digitals.vercel.app").replace(
  /\/+$/,
  "",
);

const routes = [
  {
    path: "/",
    title: /Talent, Brand, and Operations Support/i,
    body: /Built for[\s\S]*growing[\s\S]*businesses/i,
  },
  { path: "/about", title: /About Us/i, body: /Built on[\s\S]*Purpose/i },
  { path: "/services", title: /Our Services/i, body: /Built for[\s\S]*Connection/i },
  { path: "/talent", title: /Talent Pool/i, body: /Explore Talent Ready/i },
  { path: "/careers", title: /Careers/i, body: /Build Your Career with Purpose/i },
  { path: "/contact", title: /Contact Romega Solutions/i, body: /Contact Us/i },
  { path: "/privacy", title: /Privacy Policy/i, body: /Romega Solutions Privacy Office/i },
  { path: "/terms", title: /Terms and Conditions/i, body: /Romega Solutions Legal/i },
];

const authWallPattern =
  /Authentication Required|Vercel Authentication|x-vercel-protection-bypass|\/sso-api\?/i;
const staleFooterCssPattern =
  /color-mix\(in oklab,\s*var\(--color-secondary-accessible\)\s*(?:62|70|88)%,\s*transparent\)/i;

const outputDir = path.join(process.cwd(), "reports", "live-deployment-audit");

function absoluteUrl(value) {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  return `${baseUrl}${value.startsWith("/") ? value : `/${value}`}`;
}

async function fetchText(url, init = {}) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent": "RS-Web-Digital-Live-Audit/1.0",
      Accept: "text/html,application/json,text/css,*/*",
      ...init.headers,
    },
    ...init,
  });
  const text = await response.text();
  return { response, text };
}

function extractTitle(html) {
  return html.match(/<title[^>]*>(.*?)<\/title>/is)?.[1]?.replace(/\s+/g, " ").trim() || "";
}

function extractCssUrls(html) {
  return Array.from(html.matchAll(/href=["']([^"']+\.css(?:\?[^"']*)?)["']/gi), (match) =>
    absoluteUrl(match[1]),
  );
}

function createRouteResult(route, status, title, html) {
  const failures = [];

  if (status !== 200) {
    failures.push(`Expected status 200, got ${status}`);
  }
  if (!route.title.test(title)) {
    failures.push(`Expected title to match ${route.title}, got "${title || "(empty)"}"`);
  }
  if (!route.body.test(html)) {
    failures.push(`Expected body to include ${route.body}`);
  }
  if (authWallPattern.test(html)) {
    failures.push("Vercel authentication wall detected");
  }

  return {
    path: route.path,
    url: `${baseUrl}${route.path}`,
    status,
    title,
    passed: failures.length === 0,
    failures,
  };
}

async function auditRoutes() {
  const results = [];
  let homeHtml = "";

  for (const route of routes) {
    try {
      const { response, text } = await fetchText(`${baseUrl}${route.path}`);
      if (route.path === "/") {
        homeHtml = text;
      }
      results.push(createRouteResult(route, response.status, extractTitle(text), text));
    } catch (error) {
      results.push({
        path: route.path,
        url: `${baseUrl}${route.path}`,
        status: null,
        title: "",
        passed: false,
        failures: [error instanceof Error ? error.message : String(error)],
      });
    }
  }

  return { routeResults: results, homeHtml };
}

async function auditCareersApi() {
  try {
    const { response, text } = await fetchText(`${baseUrl}/api/careers/jobs`, {
      headers: { Accept: "application/json" },
    });
    const failures = [];
    let body = null;

    try {
      body = JSON.parse(text);
    } catch {
      failures.push("Response is not valid JSON");
    }

    if (response.status !== 200) {
      failures.push(`Expected status 200, got ${response.status}`);
    }
    if (!body || !Array.isArray(body.jobs)) {
      failures.push("Expected jobs array");
    }
    if (!body || typeof body.updatedAt !== "string" || Number.isNaN(Date.parse(body.updatedAt))) {
      failures.push("Expected valid updatedAt timestamp");
    }

    return {
      path: "/api/careers/jobs",
      url: `${baseUrl}/api/careers/jobs`,
      status: response.status,
      passed: failures.length === 0,
      failures,
    };
  } catch (error) {
    return {
      path: "/api/careers/jobs",
      url: `${baseUrl}/api/careers/jobs`,
      status: null,
      passed: false,
      failures: [error instanceof Error ? error.message : String(error)],
    };
  }
}

async function auditCssFreshness(homeHtml) {
  const cssUrls = extractCssUrls(homeHtml);
  const results = [];

  for (const url of cssUrls) {
    try {
      const { response, text } = await fetchText(url, { headers: { Accept: "text/css,*/*" } });
      const isFooterCss = text.includes("SiteFooter-module");
      const failures = [];

      if (response.status !== 200) {
        failures.push(`Expected CSS status 200, got ${response.status}`);
      }
      if (isFooterCss && staleFooterCssPattern.test(text)) {
        failures.push("Stale low-contrast footer color-mix CSS detected");
      }
      if (isFooterCss && !text.includes("color:var(--color-brand-secondary)")) {
        failures.push("Footer link CSS does not include current brand-secondary token");
      }

      results.push({
        url,
        status: response.status,
        isFooterCss,
        passed: failures.length === 0,
        failures,
      });
    } catch (error) {
      results.push({
        url,
        status: null,
        isFooterCss: false,
        passed: false,
        failures: [error instanceof Error ? error.message : String(error)],
      });
    }
  }

  if (!results.some((result) => result.isFooterCss)) {
    results.push({
      url: "(detected CSS bundle list)",
      status: null,
      isFooterCss: false,
      passed: false,
      failures: ["No CSS bundle containing SiteFooter styles was found"],
    });
  }

  return results;
}

const startedAt = new Date().toISOString();
const { routeResults, homeHtml } = await auditRoutes();
const careersApiResult = await auditCareersApi();
const cssResults = await auditCssFreshness(homeHtml);
const allResults = [...routeResults, careersApiResult, ...cssResults];
const failures = allResults.flatMap((result) =>
  result.passed
    ? []
    : result.failures.map((failure) => ({
        url: result.url,
        failure,
      })),
);

const report = {
  baseUrl,
  startedAt,
  finishedAt: new Date().toISOString(),
  passed: failures.length === 0,
  failures,
  routeResults,
  careersApiResult,
  cssResults,
};

mkdirSync(outputDir, { recursive: true });
writeFileSync(path.join(outputDir, "live-deployment-audit.json"), JSON.stringify(report, null, 2));

if (failures.length > 0) {
  console.error(`Live deployment audit failed for ${baseUrl}`);
  for (const { url, failure } of failures) {
    console.error(`- ${url}: ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Live deployment audit passed for ${baseUrl}`);
}
