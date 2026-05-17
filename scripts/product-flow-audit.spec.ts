import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type APIRequestContext } from "@playwright/test";

type ApiResponseBody = {
  success?: boolean;
  message?: string;
  code?: string;
  jobs?: unknown;
  updatedAt?: unknown;
};

const baseUrl =
  process.env.PRODUCT_AUDIT_BASE_URL ??
  process.env.KEYBOARD_AUDIT_BASE_URL ??
  process.env.RESPONSIVE_AUDIT_BASE_URL ??
  process.env.ACCESSIBILITY_AUDIT_BASE_URL ??
  "http://127.0.0.1:3007";

const outputDir = path.join(process.cwd(), "reports", "product-flow-audit");
const summaryPath = path.join(outputDir, "product-flow-audit-summary.json");

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

async function auditCareersJobsApi(request: APIRequestContext) {
  const response = await request.get(`${baseUrl}/api/careers/jobs`, { timeout: 45_000 });
  expect(response.status()).toBe(200);

  const body = (await response.json()) as ApiResponseBody;
  expect(Array.isArray(body.jobs)).toBe(true);
  expect(typeof body.updatedAt).toBe("string");
  expect(Number.isNaN(Date.parse(body.updatedAt as string))).toBe(false);
}

async function auditContactMethodAndContentTypeRejection(request: APIRequestContext) {
  const getResponse = await request.get(`${baseUrl}/api/contact`);
  expect(getResponse.status()).toBe(405);

  const unsupportedResponse = await request.post(`${baseUrl}/api/contact`, {
    data: "firstName=Romega",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  expect(unsupportedResponse.status()).toBe(415);

  const body = (await unsupportedResponse.json()) as ApiResponseBody;
  expect(body.success).toBe(false);
  expect(body.code).toBe("invalid_content_type");
}

async function auditContactRequiredFieldValidation(request: APIRequestContext) {
  const response = await request.post(`${baseUrl}/api/contact`, {
    data: {},
    headers: {
      "Content-Type": "application/json",
      Referer: `${baseUrl}/contact`,
      "User-Agent": "Romega-Digital-Product-Audit/1.0",
    },
  });

  expect(response.status()).toBe(400);

  const body = (await response.json()) as ApiResponseBody;
  expect(body.success).toBe(false);
  expect(body.code).toBe("missing_field");
  expect(body.message).toContain("firstName");
}

test.describe("product flow smoke audit", () => {
  test("public API checks pass without sending contact delivery", async ({ request }) => {
    test.setTimeout(120000);

    await collectCheck("careers jobs API returns a stable public payload shape", () =>
      auditCareersJobsApi(request),
    );
    await collectCheck("contact API rejects unsupported methods and content types", () =>
      auditContactMethodAndContentTypeRejection(request),
    );
    await collectCheck("contact API validates required fields before delivery", () =>
      auditContactRequiredFieldValidation(request),
    );

    const failures = results.filter((result) => result.status !== result.expectedStatus);

    if (failures.length > 0) {
      throw new Error(
        `Product-flow audit failed. See reports/product-flow-audit for full details.\n${JSON.stringify(
          { failureCount: failures.length, failures },
          null,
          2,
        )}`,
      );
    }
  });
});
