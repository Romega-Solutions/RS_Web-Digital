import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const baseUrl =
  process.env.KEYBOARD_AUDIT_BASE_URL ??
  process.env.RESPONSIVE_AUDIT_BASE_URL ??
  process.env.ACCESSIBILITY_AUDIT_BASE_URL ??
  "http://127.0.0.1:3007";

const outputDir = path.join(process.cwd(), "reports", "keyboard-audit");
const summaryPath = path.join(outputDir, "keyboard-audit-summary.json");

type AuditResult = {
  title: string;
  status: "passed" | "failed";
  expectedStatus: "passed";
  durationMs: number;
  errors: string[];
};

const results: AuditResult[] = [];

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
        resultCount: results.length,
        failureCount: failures.length,
        results,
      },
      null,
      2,
    )}\n`,
  );
});

async function gotoReady(page: Page, path: string) {
  await page.goto(`${baseUrl}${path}`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("load", { timeout: 10000 }).catch(() => undefined);
  await page.waitForTimeout(300);
}

async function collectCheck(title: string, check: () => Promise<void>) {
  const startedAt = performance.now();

  try {
    await check();
    results.push({
      title,
      status: "passed",
      expectedStatus: "passed",
      durationMs: Math.round(performance.now() - startedAt),
      errors: [],
    });
  } catch (error) {
    results.push({
      title,
      status: "failed",
      expectedStatus: "passed",
      durationMs: Math.round(performance.now() - startedAt),
      errors: [error instanceof Error ? error.message : String(error)],
    });
  }
}

test.describe("keyboard and focus smoke audit", () => {
  test("keyboard and focus checks pass", async ({ browser }) => {
    test.setTimeout(120000);

    await collectCheck("skip link is keyboard-focusable and moves focus to main", async () => {
      const page = await browser.newPage();
      page.setDefaultTimeout(10000);
      try {
        await gotoReady(page, "/");

        const skipLink = page.locator(".skip-link");
        await skipLink.focus();
        await expect(skipLink).toBeFocused();

        await page.keyboard.press("Enter");
        await expect(page.locator("#main-content")).toBeFocused();
      } finally {
        await page.close().catch(() => undefined);
      }
    });

    await collectCheck("desktop dropdowns open on focus and close on escape", async () => {
      const page = await browser.newPage();
      page.setDefaultTimeout(10000);
      try {
        await page.setViewportSize({ width: 1440, height: 900 });
        await gotoReady(page, "/");

        const servicesTrigger = page.getByRole("button", { name: /services/i });
        await servicesTrigger.focus();
        await expect(servicesTrigger).toHaveAttribute("aria-expanded", "true");
        await expect(page.getByRole("menu")).toBeVisible();

        await page.keyboard.press("Escape");
        await expect(servicesTrigger).toHaveAttribute("aria-expanded", "false");

        const careersTrigger = page.getByRole("button", { name: /careers & talents/i });
        await careersTrigger.focus();
        await expect(careersTrigger).toHaveAttribute("aria-expanded", "true");
        await expect(page.getByRole("menu")).toBeVisible();

        await page.keyboard.press("Escape");
        await expect(careersTrigger).toHaveAttribute("aria-expanded", "false");
      } finally {
        await page.close().catch(() => undefined);
      }
    });

    await collectCheck("mobile menu opens, keeps tab focus inside, and closes with escape", async () => {
      const page = await browser.newPage();
      page.setDefaultTimeout(10000);
      try {
        await page.setViewportSize({ width: 390, height: 844 });
        await gotoReady(page, "/");

        const menuButton = page.getByRole("button", { name: /toggle navigation menu/i });
        await menuButton.click();
        await expect(menuButton).toHaveAttribute("aria-expanded", "true");

        for (let index = 0; index < 8; index += 1) {
          await page.keyboard.press("Tab");
          const focusIsContained = await page.evaluate(() => {
            const active = document.activeElement;
            return Boolean(
              active?.closest("nav[aria-label='Mobile navigation']") ||
                active?.closest("button[aria-label='Toggle navigation menu']"),
            );
          });
          expect(focusIsContained).toBe(true);
        }

        await page.keyboard.press("Escape");
        await expect(menuButton).toHaveAttribute("aria-expanded", "false");
      } finally {
        await page.close().catch(() => undefined);
      }
    });

    const failures = results.filter((result) => result.status !== result.expectedStatus);

    if (failures.length > 0) {
      throw new Error(
        `Keyboard audit failed. See reports/keyboard-audit for full details.\n${JSON.stringify(
          { failureCount: failures.length, failures },
          null,
          2,
        )}`,
      );
    }
  });
});
