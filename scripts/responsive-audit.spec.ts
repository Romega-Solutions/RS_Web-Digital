import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { test } from "@playwright/test";

const baseUrl = process.env.RESPONSIVE_AUDIT_BASE_URL ?? "http://127.0.0.1:3007";
const outputDir = path.join(process.cwd(), "reports", "responsive-audit");

const routes = [
  { name: "home", path: "/" },
  { name: "about", path: "/about" },
  { name: "services", path: "/services" },
  { name: "talent", path: "/talent" },
  { name: "careers", path: "/careers" },
  { name: "contact", path: "/contact" },
  { name: "privacy", path: "/privacy" },
  { name: "terms", path: "/terms" },
] as const;

const viewports = [
  { name: "mobile-280", width: 280, height: 653 },
  { name: "mobile-320", width: 320, height: 568 },
  { name: "mobile-375", width: 375, height: 667 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "mobile-414", width: 414, height: 896 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "tablet-landscape-1024", width: 1024, height: 768 },
  { name: "desktop-1280", width: 1280, height: 720 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "desktop-1536", width: 1536, height: 864 },
  { name: "desktop-1920", width: 1920, height: 1080 },
] as const;

type OverflowItem = {
  selector: string;
  text: string;
  left: number;
  right: number;
  width: number;
  height: number;
};

type AuditResult = {
  route: string;
  viewport: string;
  width: number;
  height: number;
  status: number | null;
  scrollWidth: number;
  clientWidth: number;
  horizontalOverflow: number;
  overflowingElements: OverflowItem[];
  tapTargetIssues: OverflowItem[];
};

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

test.describe("responsive viewport audit", () => {
  test("key routes fit mobile, tablet, and desktop viewports", async ({ page }) => {
    test.setTimeout(240000);
    mkdirSync(outputDir, { recursive: true });

    const results: AuditResult[] = [];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.emulateMedia({ reducedMotion: "reduce" });

      for (const route of routes) {
        const response = await page.goto(`${baseUrl}${route.path}`, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });

        await page.waitForLoadState("load", { timeout: 10000 }).catch(() => undefined);
        await page.waitForTimeout(800);

        const metrics = await page.evaluate((viewportWidth) => {
          const clientWidth = document.documentElement.clientWidth;
          const scrollWidth = document.documentElement.scrollWidth;
          const minTouchTarget = viewportWidth <= 768 ? 44 : 24;
          const isVisible = (element: Element) => {
            const style = window.getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return (
              style.display !== "none" &&
              style.visibility !== "hidden" &&
              Number(style.opacity) !== 0 &&
              rect.width > 1 &&
              rect.height > 1
            );
          };

          const selectorFor = (element: Element) => {
            const id = element.id ? `#${element.id}` : "";
            const className =
              typeof element.className === "string"
                ? `.${element.className.trim().split(/\s+/).slice(0, 3).join(".")}`
                : "";
            return `${element.tagName.toLowerCase()}${id}${className}`;
          };

          const allElements = Array.from(document.body.querySelectorAll("*")).filter(isVisible);
          const hasIgnoredAncestor = (element: Element) =>
            Boolean(
              element.closest(
                "[aria-hidden='true'], .sr-only, [class*='ServiceStrip_'], .leaflet-tile-pane, .leaflet-control-attribution",
              ),
            );
          const overflowingElements = allElements
            .filter((element) => !hasIgnoredAncestor(element))
            .map((element) => {
              const rect = element.getBoundingClientRect();
              return {
                selector: selectorFor(element),
                text: (element.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 90),
                left: Math.round(rect.left),
                right: Math.round(rect.right),
                width: Math.round(rect.width),
                height: Math.round(rect.height),
              };
            })
            .filter((item) => {
              const center = item.left + item.width / 2;
              return center > 0 && center < clientWidth && (item.left < -2 || item.right > clientWidth + 2);
            })
            .slice(0, 12);

          const tapTargetIssues = allElements
            .filter((element) => !hasIgnoredAncestor(element))
            .filter((element) => {
              if (!element.matches("a[href], button, input, select, textarea, summary, [role='button'], [role='menuitem']")) {
                return false;
              }

              const style = window.getComputedStyle(element);
              const isInlineProseLink =
                element.matches("a[href]") &&
                style.display === "inline" &&
                !element.closest("header, nav, footer, [role='navigation'], [class*='button'], [class*='Button']");

              return !isInlineProseLink;
            })
            .map((element) => {
              const rect = element.getBoundingClientRect();
              return {
                selector: selectorFor(element),
                text: (element.textContent ?? element.getAttribute("aria-label") ?? "")
                  .replace(/\s+/g, " ")
                  .trim()
                  .slice(0, 90),
                left: Math.round(rect.left),
                right: Math.round(rect.right),
                width: Math.round(rect.width),
                height: Math.round(rect.height),
              };
            })
            .filter((item) => {
              const center = item.left + item.width / 2;
              return center > 0 && center < clientWidth && (item.width < minTouchTarget || item.height < minTouchTarget);
            })
            .slice(0, 12);

          return {
            scrollWidth,
            clientWidth,
            horizontalOverflow: Math.max(0, scrollWidth - clientWidth),
            overflowingElements,
            tapTargetIssues,
          };
        }, viewport.width);

        const result: AuditResult = {
          route: route.path,
          viewport: viewport.name,
          width: viewport.width,
          height: viewport.height,
          status: response?.status() ?? null,
          ...metrics,
        };

        results.push(result);

        if (["mobile-280", "mobile-390", "tablet-768", "desktop-1440", "desktop-1920"].includes(viewport.name)) {
          await page.screenshot({
            path: path.join(outputDir, `${route.name}-${viewport.name}.png`),
            fullPage: true,
          });
        }
      }
    }

    writeFileSync(
      path.join(outputDir, "responsive-audit-results.json"),
      JSON.stringify(results, null, 2),
    );

    const failing = results.filter(
      (result) =>
        result.status !== 200 ||
        result.horizontalOverflow > 2 ||
        result.tapTargetIssues.length > 0,
    );

    writeFileSync(
      path.join(outputDir, "responsive-audit-summary.json"),
      JSON.stringify(
        {
          headSha: getHeadSha(),
          baseUrl,
          passed: failing.length === 0,
          finishedAt: new Date().toISOString(),
          routeCount: routes.length,
          viewportCount: viewports.length,
          resultCount: results.length,
          failureCount: failing.length,
          failures: failing,
        },
        null,
        2,
      ),
    );

    const maxTerminalFailures = 20;
    const failureSummary = {
      failureCount: failing.length,
      omittedFailureCount: Math.max(0, failing.length - maxTerminalFailures),
      failures: failing.slice(0, maxTerminalFailures).map((result) => ({
        route: result.route,
        viewport: result.viewport,
        status: result.status,
        horizontalOverflow: result.horizontalOverflow,
        overflowingElementCount: result.overflowingElements.length,
        tapTargetIssueCount: result.tapTargetIssues.length,
      })),
    };

    if (failing.length > 0) {
      throw new Error(`Responsive audit failed. See reports/responsive-audit for full details.\n${JSON.stringify(failureSummary, null, 2)}`);
    }
  });
});
