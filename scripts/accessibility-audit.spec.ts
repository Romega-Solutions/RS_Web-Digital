import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const baseUrl = process.env.ACCESSIBILITY_AUDIT_BASE_URL ?? "http://127.0.0.1:3007";

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

test.describe("accessibility smoke audit", () => {
  for (const route of routes) {
    test(`${route.name} has no critical or serious axe violations`, async ({ page }) => {
      await page.goto(`${baseUrl}${route.path}`, {
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

      expect(blockingViolations).toEqual([]);
    });
  }
});
