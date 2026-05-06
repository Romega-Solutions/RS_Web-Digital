import fs from "node:fs/promises";
import path from "node:path";
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";
import { chromium } from "playwright";

const baseUrl = process.env.AUDIT_BASE_URL ?? "http://localhost:3001";
const routes = (process.env.AUDIT_ROUTES ?? "/,/about,/services,/talent,/careers,/contact")
  .split(",")
  .map((route) => route.trim())
  .filter(Boolean);
const categoryThresholds = {
  accessibility: Number(process.env.LH_MIN_ACCESSIBILITY ?? 0.95),
  "best-practices": Number(process.env.LH_MIN_BEST_PRACTICES ?? 0.9),
  seo: Number(process.env.LH_MIN_SEO ?? 0.9),
  performance: Number(process.env.LH_MIN_PERFORMANCE ?? 0.5),
};
const outputDir = path.join(process.cwd(), "lighthouse-audit");

await fs.mkdir(outputDir, { recursive: true });

const chrome = await launch({
  chromePath: chromium.executablePath(),
  chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
});

const failures = [];

try {
  for (const route of routes) {
    const url = new URL(route, baseUrl).toString();
    const result = await lighthouse(url, {
      port: chrome.port,
      onlyCategories: Object.keys(categoryThresholds),
      output: "json",
      logLevel: "error",
    });

    const lhr = result.lhr;
    const categoryScores = Object.fromEntries(
      Object.entries(categoryThresholds).map(([category]) => [
        category,
        lhr.categories[category]?.score ?? 0,
      ]),
    );
    const routeName = route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "-");
    await fs.writeFile(
      path.join(outputDir, `${routeName}.json`),
      JSON.stringify(lhr, null, 2),
    );

    console.log(
      `${route}: ${Object.entries(categoryScores)
        .map(([category, score]) => `${category}=${Math.round(score * 100)}`)
        .join(", ")}`,
    );

    for (const [category, score] of Object.entries(categoryScores)) {
      const minScore = categoryThresholds[category];
      if (score < minScore) {
        failures.push({
          route,
          category,
          score,
          minScore,
          audits: Object.values(lhr.audits)
            .filter((audit) => audit.score !== null && audit.score < 1)
            .filter((audit) => audit.scoreDisplayMode !== "informative")
            .map((audit) => audit.title)
            .slice(0, 10),
        });
      }
    }
  }
} finally {
  try {
    await chrome.kill();
  } catch (error) {
    console.warn(`Chrome cleanup warning: ${error.message}`);
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(
      `\n${failure.route}: ${failure.category}=${Math.round(failure.score * 100)} ` +
        `(minimum ${Math.round(failure.minScore * 100)})`,
    );
    for (const audit of failure.audits) {
      console.error(`- ${audit}`);
    }
  }
  process.exitCode = 1;
}
