import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.AUDIT_BASE_URL ?? "http://localhost:3000";
const routes = (process.env.AUDIT_ROUTES ?? "/,/about,/services,/talent,/careers,/contact")
  .split(",")
  .map((route) => route.trim())
  .filter(Boolean);
const outputDir = path.join(process.cwd(), "playwright-audit");

const viewports = [
  { name: "smallest-portrait", width: 320, height: 568 },
  { name: "smallest-landscape", width: 568, height: 320 },
  { name: "mobile-portrait", width: 375, height: 812 },
  { name: "mobile-landscape", width: 812, height: 375 },
  { name: "large-mobile-portrait", width: 430, height: 932 },
  { name: "large-mobile-landscape", width: 932, height: 430 },
  { name: "tablet-portrait", width: 768, height: 1024 },
  { name: "tablet-landscape", width: 1024, height: 768 },
  { name: "laptop", width: 1366, height: 768 },
  { name: "desktop", width: 1440, height: 900 },
  { name: "wide", width: 1920, height: 1080 },
];

await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();
const results = [];

for (const route of routes) {
  const routeName = route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "-");
  const routeDir = path.join(outputDir, routeName);
  await fs.mkdir(routeDir, { recursive: true });

  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    await page.goto(new URL(route, baseUrl).toString(), {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    await page.waitForLoadState("load", { timeout: 20_000 }).catch(() => {});
    await page.waitForTimeout(500);
    await page.evaluate(async () => {
      const step = Math.max(200, Math.floor(window.innerHeight * 0.8));
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((resolve) => window.setTimeout(resolve, 280));
      }
      window.scrollTo(0, 0);
      await new Promise((resolve) => window.setTimeout(resolve, 500));
    });
    await page.screenshot({
      path: path.join(routeDir, `${viewport.name}.png`),
      fullPage: true,
    });

    const metrics = await page.evaluate(() => {
    const overflowX = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight;
    const offenders = [];

    for (const el of document.querySelectorAll("body *")) {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      const className = el.getAttribute("class") || "";
      const hasTransform = style.transform !== "none";
      const inMarquee = Boolean(el.closest('[class*="ServiceStrip"]'));
      const isDecorative =
        className.includes("glow") ||
        className.includes("dotActive") ||
        className.includes("growingWord");
      if (
        rect.width === 0 ||
        rect.height === 0 ||
        style.display === "none" ||
        style.visibility === "hidden" ||
        style.position === "fixed" ||
        hasTransform ||
        inMarquee ||
        isDecorative ||
        className.includes("statement") ||
        className.includes("ServiceStrip")
      ) {
        continue;
      }

      const overflowsViewport = rect.left < -1 || rect.right > viewportWidth + 1;
      const parent = el.parentElement;
      const parentRect = parent?.getBoundingClientRect();
      const overflowsParent =
        parentRect &&
        parentRect.width > 0 &&
        rect.width > 8 &&
        rect.height > 8 &&
        (rect.left < parentRect.left - 1 || rect.right > parentRect.right + 1) &&
        !["IMG", "SOURCE", "PICTURE"].includes(el.tagName);

      if (overflowsViewport || overflowsParent) {
        offenders.push({
          tag: el.tagName.toLowerCase(),
          className: String(el.className || ""),
          text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 90),
          rect: {
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          },
          parent: parentRect
            ? {
                left: Math.round(parentRect.left),
                right: Math.round(parentRect.right),
                width: Math.round(parentRect.width),
              }
            : null,
        });
      }
    }

      return {
        overflowX,
        viewportWidth,
        viewportHeight,
        offenders: offenders.slice(0, 20),
      };
    });

    results.push({ route, viewport, ...metrics });
    await page.close();
  }
}

await browser.close();

await fs.writeFile(
  path.join(outputDir, "results.json"),
  JSON.stringify(results, null, 2),
);

const failures = results.filter((result) => result.overflowX > 1 || result.offenders.length > 0);
for (const result of results) {
  console.log(
    `${result.route} ${result.viewport.name} ${result.viewport.width}x${result.viewport.height}: overflowX=${result.overflowX}, offenders=${result.offenders.length}`,
  );
}

if (failures.length > 0) {
  console.error(`\nAudit found ${failures.length} viewport(s) with layout issues.`);
  process.exitCode = 1;
}
