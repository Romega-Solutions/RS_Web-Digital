import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type TestInfo } from "@playwright/test";

const baseUrl =
  process.env.VISUAL_AUDIT_BASE_URL ??
  process.env.PRODUCT_AUDIT_BASE_URL ??
  process.env.KEYBOARD_AUDIT_BASE_URL ??
  process.env.RESPONSIVE_AUDIT_BASE_URL ??
  process.env.ACCESSIBILITY_AUDIT_BASE_URL ??
  "http://127.0.0.1:3007";

const outputDir = path.join(process.cwd(), "reports", "visual-render-audit");
const summaryPath = path.join(outputDir, "visual-render-audit-summary.json");

type AuditResult = {
  title: string;
  status: TestInfo["status"];
  expectedStatus: TestInfo["expectedStatus"];
  durationMs: number;
  errors: string[];
};

type ScreenshotArtifact = {
  route: string;
  viewport: string;
  path: string;
};

const results: AuditResult[] = [];
const screenshots: ScreenshotArtifact[] = [];

function getHeadSha() {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "unknown";
  }
}

test.afterEach(({}, testInfo) => {
  results.push({
    title: testInfo.title,
    status: testInfo.status,
    expectedStatus: testInfo.expectedStatus,
    durationMs: testInfo.duration,
    errors: testInfo.errors.map((error) => error.message ?? String(error)),
  });
});

test.afterAll(() => {
  mkdirSync(outputDir, { recursive: true });
  const failures = results.filter((result) => result.status !== result.expectedStatus);
  writeFileSync(
    summaryPath,
    `${JSON.stringify(
      {
        headSha: getHeadSha(),
        baseUrl,
        passed: failures.length === 0,
        finishedAt: new Date().toISOString(),
        routeCount: routes.length,
        viewportCount: viewports.length,
        screenshotCount: screenshots.length,
        resultCount: results.length,
        failureCount: failures.length,
        screenshots,
        results,
      },
      null,
      2,
    )}\n`,
  );
});

const routes = [
  {
    name: "home",
    path: "/",
    title: /Talent, Brand, and Operations Support/i,
    heading: /Built for growing businesses/i,
    text: /Romega Solutions/i,
  },
  {
    name: "about",
    path: "/about",
    title: /About Us/i,
    heading: /Built on Purpose, Driven by People/i,
    text: /About Romega Solutions/i,
  },
  {
    name: "services",
    path: "/services",
    title: /Our Services/i,
    heading: /Built for Connection, Designed for Impact/i,
    text: /Talent Solutions/i,
  },
  {
    name: "talent",
    path: "/talent",
    title: /Talent Pool/i,
    heading: /Explore Talent Ready To Move Your Business Forward/i,
    text: /Curated Talent/i,
  },
  {
    name: "careers",
    path: "/careers",
    title: /Careers/i,
    heading: /Build Your Career with Purpose/i,
    text: /Current Opportunities/i,
  },
  {
    name: "contact",
    path: "/contact",
    title: /Contact Romega Solutions/i,
    heading: /Contact Us/i,
    text: /Contact Form/i,
  },
  {
    name: "privacy",
    path: "/privacy",
    title: /Privacy Policy/i,
    heading: /Privacy Policy/i,
    text: /Romega Solutions Privacy Office/i,
  },
  {
    name: "terms",
    path: "/terms",
    title: /Terms and Conditions/i,
    heading: /Terms and Conditions/i,
    text: /Romega Solutions Legal/i,
  },
] as const;

const viewports = [
  { name: "mobile-320", width: 320, height: 568 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 900 },
] as const;

test.describe("visual render smoke audit", () => {
  test("core pages render the intended app shell and route content", async ({ page }) => {
    test.setTimeout(180000);
    mkdirSync(outputDir, { recursive: true });

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.emulateMedia({ reducedMotion: "reduce" });

      for (const route of routes) {
        const response = await page.goto(`${baseUrl}${route.path}`, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });
        await page.waitForLoadState("load", { timeout: 10000 }).catch(() => undefined);
        await page.waitForTimeout(300);

        expect(response?.status(), `${route.path} should return 200`).toBe(200);
        await expect(page, `${route.path} should expose the expected document title`).toHaveTitle(
          route.title,
        );
        await expect(
          page.getByRole("heading", { level: 1, name: route.heading }),
          `${route.path} should render its route-specific h1`,
        ).toBeVisible();
        await expect(
          page.locator("main"),
          `${route.path} should render route-specific body copy`,
        ).toContainText(route.text);

        const renderState = await page.evaluate(() => {
          const visible = (element: Element) => {
            const style = window.getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return (
              style.display !== "none" &&
              style.visibility !== "hidden" &&
              Number(style.opacity) > 0 &&
              rect.width > 0 &&
              rect.height > 0
            );
          };

          const bodyText = document.body.innerText.replace(/\s+/g, " ").trim();
          const visibleImages = Array.from(document.images).filter((image) => {
            const rect = image.getBoundingClientRect();
            return visible(image) && image.complete && rect.width >= 24 && rect.height >= 24;
          });
          const visibleLinks = Array.from(document.querySelectorAll("a")).filter(visible);
          const visibleButtons = Array.from(document.querySelectorAll("button")).filter(visible);
          const main = document.querySelector("main");
          const header = document.querySelector("header");
          const footer = document.querySelector("footer");

          return {
            hasAuthWall:
              /Authentication Required|Vercel Authentication|x-vercel-protection-bypass/i.test(
                bodyText,
              ),
            hasMain: Boolean(main && visible(main)),
            hasHeader: Boolean(header && visible(header)),
            hasFooter: Boolean(footer && visible(footer)),
            visibleImageCount: visibleImages.length,
            visibleLinkCount: visibleLinks.length,
            visibleButtonCount: visibleButtons.length,
            textLength: bodyText.length,
          };
        });

        expect(renderState.hasAuthWall, `${route.path} should not show a Vercel auth wall`).toBe(
          false,
        );
        expect(renderState.hasMain, `${route.path} should render the main landmark`).toBe(true);
        expect(renderState.hasHeader, `${route.path} should render the site header`).toBe(true);
        expect(renderState.hasFooter, `${route.path} should render the site footer`).toBe(true);
        expect(renderState.visibleImageCount, `${route.path} should render visual assets`).toBeGreaterThan(
          0,
        );
        expect(renderState.visibleLinkCount, `${route.path} should render navigation links`).toBeGreaterThan(
          5,
        );
        expect(
          renderState.visibleLinkCount + renderState.visibleButtonCount,
          `${route.path} should render interactive controls`,
        ).toBeGreaterThan(
          0,
        );
        expect(renderState.textLength, `${route.path} should not render a sparse or blank page`).toBeGreaterThan(
          500,
        );

        if (viewport.name === "mobile-390" || viewport.name === "desktop-1440") {
          const screenshotPath = path.join(outputDir, `${route.name}-${viewport.name}.png`);
          await page.screenshot({ path: screenshotPath, fullPage: true });
          screenshots.push({
            route: route.path,
            viewport: viewport.name,
            path: path.relative(process.cwd(), screenshotPath),
          });
        }
      }
    }
  });
});
