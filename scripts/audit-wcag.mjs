import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";

const baseUrl = process.env.AUDIT_BASE_URL ?? "http://localhost:3001";
const routes = (process.env.AUDIT_ROUTES ?? "/,/about,/services,/talent,/careers,/contact")
  .split(",")
  .map((route) => route.trim())
  .filter(Boolean);

const viewports = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

const browser = await chromium.launch();
const failures = [];

for (const route of routes) {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await page.goto(new URL(route, baseUrl).toString(), {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    await page.waitForLoadState("load", { timeout: 20_000 }).catch(() => {});
    await page.waitForTimeout(500);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    const violations = results.violations.filter((violation) => violation.impact !== "minor");
    console.log(`${route} ${viewport.name}: violations=${violations.length}`);

    if (violations.length > 0) {
      failures.push({ route, viewport: viewport.name, violations });
    }

    await context.close();
  }
}

await browser.close();

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`\n${failure.route} ${failure.viewport}`);
    for (const violation of failure.violations) {
      console.error(`- ${violation.id} (${violation.impact}): ${violation.help}`);
      for (const node of violation.nodes.slice(0, 5)) {
        console.error(`  ${node.target.join(", ")}`);
      }
    }
  }
  process.exitCode = 1;
}
