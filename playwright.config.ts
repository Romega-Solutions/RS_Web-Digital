import { defineConfig } from "@playwright/test";

const configuredBaseUrl = process.env.RESPONSIVE_AUDIT_BASE_URL;
const defaultBaseUrl = "http://127.0.0.1:3007";

export default defineConfig({
  testDir: ".",
  testMatch: ["scripts/responsive-audit.spec.ts"],
  reporter: "list",
  use: {
    baseURL: configuredBaseUrl ?? defaultBaseUrl,
  },
  webServer: configuredBaseUrl
    ? undefined
    : {
        command: "pnpm exec next start -H 127.0.0.1 -p 3007",
        url: defaultBaseUrl,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
