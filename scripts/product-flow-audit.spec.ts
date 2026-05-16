import { expect, test } from "@playwright/test";

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

test.describe("product flow smoke audit", () => {
  test("careers jobs API returns a stable public payload shape", async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/careers/jobs`, { timeout: 45_000 });
    expect(response.status()).toBe(200);

    const body = (await response.json()) as ApiResponseBody;
    expect(Array.isArray(body.jobs)).toBe(true);
    expect(typeof body.updatedAt).toBe("string");
    expect(Number.isNaN(Date.parse(body.updatedAt as string))).toBe(false);
  });

  test("contact API rejects unsupported methods and content types", async ({ request }) => {
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
  });

  test("contact API validates required fields before delivery", async ({ request }) => {
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
  });
});
