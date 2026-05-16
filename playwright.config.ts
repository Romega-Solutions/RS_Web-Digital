import { defineConfig } from "@playwright/test";

const configuredBaseUrl =
  process.env.PRODUCT_AUDIT_BASE_URL ??
  process.env.KEYBOARD_AUDIT_BASE_URL ??
  process.env.RESPONSIVE_AUDIT_BASE_URL ??
  process.env.ACCESSIBILITY_AUDIT_BASE_URL;
const defaultBaseUrl = "http://127.0.0.1:3007";

export default defineConfig({
  testDir: ".",
  testMatch: [
    "scripts/responsive-audit.spec.ts",
    "scripts/accessibility-audit.spec.ts",
    "scripts/keyboard-audit.spec.ts",
    "scripts/product-flow-audit.spec.ts",
  ],
  reporter: "list",
  use: {
    baseURL: configuredBaseUrl ?? defaultBaseUrl,
  },
  webServer: configuredBaseUrl
    ? undefined
    : {
        command: "pnpm exec next start -H 127.0.0.1 -p 3007",
        url: defaultBaseUrl,
        reuseExistingServer: false,
        timeout: 120_000,
      },
});
