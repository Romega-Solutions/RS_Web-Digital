import { expect, test } from "@playwright/test";

const baseUrl =
  process.env.KEYBOARD_AUDIT_BASE_URL ??
  process.env.RESPONSIVE_AUDIT_BASE_URL ??
  process.env.ACCESSIBILITY_AUDIT_BASE_URL ??
  "http://127.0.0.1:3007";

async function gotoReady(page: import("@playwright/test").Page, path: string) {
  await page.goto(`${baseUrl}${path}`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("load", { timeout: 10000 }).catch(() => undefined);
  await page.waitForTimeout(300);
}

test.describe("keyboard and focus smoke audit", () => {
  test("skip link is keyboard-focusable and moves focus to main", async ({ page }) => {
    await gotoReady(page, "/");

    const skipLink = page.locator(".skip-link");
    await skipLink.focus();
    await expect(skipLink).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();
  });

  test("desktop dropdowns open on focus and close on escape", async ({ page }) => {
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
  });

  test("mobile menu opens, keeps tab focus inside, and closes with escape", async ({ page }) => {
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
  });
});
