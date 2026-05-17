import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { test } from "@playwright/test";

const baseUrl = process.env.ACCESSIBILITY_AUDIT_BASE_URL ?? "http://127.0.0.1:3007";
const outputDir = path.join(process.cwd(), "reports", "accessibility-audit");

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

type RouteResult = {
  route: string;
  status: number | null;
  violationCount: number;
  violations: {
    id: string;
    impact: string | null | undefined;
    help: string;
    nodeCount: number;
    targets: unknown[];
  }[];
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

test.describe("accessibility smoke audit", () => {
  test("public routes have no critical or serious axe violations", async ({ page }) => {
    mkdirSync(outputDir, { recursive: true });

    const routeResults: RouteResult[] = [];

    for (const route of routes) {
      const response = await page.goto(`${baseUrl}${route.path}`, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      await page.waitForLoadState("load", { timeout: 10000 }).catch(() => undefined);
      await page.emulateMedia({ reducedMotion: "reduce" });

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();

      const blockingViolations = results.violations.filter((violation) =>
        ["critical", "serious"].includes(violation.impact ?? ""),
      );

      routeResults.push({
        route: route.path,
        status: response?.status() ?? null,
        violationCount: blockingViolations.length,
        violations: blockingViolations.map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          help: violation.help,
          nodeCount: violation.nodes.length,
          targets: violation.nodes.map((node) => node.target),
        })),
      });
    }

    const failures = routeResults.filter((result) => result.status !== 200 || result.violationCount > 0);

    writeFileSync(
      path.join(outputDir, "accessibility-audit-summary.json"),
      JSON.stringify(
        {
          headSha: getHeadSha(),
          baseUrl,
          passed: failures.length === 0 && routeResults.length === routes.length,
          finishedAt: new Date().toISOString(),
          routeCount: routes.length,
          resultCount: routeResults.length,
          failureCount: failures.length,
          results: routeResults,
        },
        null,
        2,
      ),
    );

    const maxTerminalFailures = 20;
    const failureSummary = {
      failureCount: failures.length,
      omittedFailureCount: Math.max(0, failures.length - maxTerminalFailures),
      failures: failures.slice(0, maxTerminalFailures).map((result) => ({
        route: result.route,
        status: result.status,
        violationCount: result.violationCount,
        violations: result.violations.map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          nodeCount: violation.nodeCount,
        })),
      })),
    };

    if (failures.length > 0) {
      throw new Error(
        `Accessibility audit failed. See reports/accessibility-audit for full details.\n${JSON.stringify(failureSummary, null, 2)}`,
      );
    }
  });
});
