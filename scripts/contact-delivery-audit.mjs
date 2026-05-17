import { mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { chromium } from "@playwright/test";

const outputDir = path.join(process.cwd(), "reports", "contact-delivery-audit");
const baseUrl = (process.env.CONTACT_AUDIT_BASE_URL || "").replace(/\/+$/, "");
const confirmSend = /^(1|true|yes)$/i.test(process.env.CONTACT_AUDIT_CONFIRM_SEND || "");
const auditMode = (process.env.CONTACT_AUDIT_MODE || "browser").toLowerCase();
const recaptchaToken = process.env.CONTACT_AUDIT_RECAPTCHA_TOKEN || "";
const headSha = getHeadSha();

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

function createPayload() {
  const timestamp = new Date().toISOString();

  return {
    firstName: "Romega",
    lastName: "Production Audit",
    email: "info@romega-solutions.com",
    subject: "general",
    company: "Romega Solutions",
    phone: "+13105550123",
    message: `Production contact delivery audit from RS_Web-Digital at ${timestamp}. This verifies the live contact form delivery path.`,
    privacyConsent: true,
    botfield: "",
    ...(recaptchaToken ? { recaptchaToken } : {}),
  };
}

function writeReport(report) {
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(path.join(outputDir, "contact-delivery-audit.json"), JSON.stringify(report, null, 2));
}

async function runApiAudit(url, payload) {
  const failures = [];
  let status = null;
  let responseBody = null;
  let submissionAttempted = false;
  let responseReceived = false;

  try {
    submissionAttempted = true;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: `${baseUrl}/contact`,
        "User-Agent": "RS-Web-Digital-Contact-Delivery-Audit/1.0",
      },
      body: JSON.stringify(payload),
    });
    status = response.status;
    responseReceived = true;

    try {
      responseBody = await response.json();
    } catch {
      failures.push("Response is not valid JSON.");
    }

    if (status !== 200) {
      failures.push(`Expected status 200, got ${status}.`);
    }

    if (responseBody?.success !== true) {
      failures.push(`Expected success=true, got ${String(responseBody?.success)}.`);
    }

    if (responseBody?.code === "recaptcha_required") {
      failures.push(
        "Production reCAPTCHA is enabled; browser-mode delivery requires a working client token flow.",
      );
    }
  } catch (error) {
    failures.push(error instanceof Error ? error.message : String(error));
  }

  return {
    mode: "api",
    status,
    responseBody,
    browserStatusMessage: null,
    submissionAttempted,
    responseReceived,
    failures,
  };
}

async function runBrowserAudit(url, payload) {
  const failures = [];
  let status = null;
  let responseBody = null;
  let browserStatusMessage = null;
  let submissionAttempted = false;
  let responseReceived = false;
  let browser;

  try {
    browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`${baseUrl}/contact`, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.waitForLoadState("load", { timeout: 10_000 }).catch(() => undefined);

    const submitButton = page.getByRole("button", { name: /^submit$/i });
    if (!(await submitButton.isEnabled())) {
      failures.push("Contact form submit button is disabled or unavailable in the browser.");
      return { mode: "browser", status, responseBody, browserStatusMessage, failures };
    }

    await page.getByLabel(/first name/i).fill(payload.firstName);
    await page.getByLabel(/last name/i).fill(payload.lastName);
    await page.getByLabel(/email address/i).fill(payload.email);
    await page.getByLabel(/select subject/i).selectOption(payload.subject);
    await page.getByLabel(/company name/i).fill(payload.company);
    await page.getByLabel(/contact number/i).fill(payload.phone);
    await page.getByLabel(/message/i).fill(payload.message);
    await page.getByLabel(/privacy policy/i).check();

    const responsePromise = page.waitForResponse(
      (response) => response.url() === url && response.request().method() === "POST",
      { timeout: 30_000 },
    );
    submissionAttempted = true;
    await submitButton.click();

    const response = await responsePromise;
    status = response.status();
    responseReceived = true;

    try {
      responseBody = await response.json();
    } catch {
      failures.push("Browser submission response is not valid JSON.");
    }

    const statusMessage = page.getByRole(responseBody?.success === true ? "status" : "alert");
    browserStatusMessage = await statusMessage.textContent({ timeout: 10_000 }).catch(() => null);

    if (status !== 200) {
      failures.push(`Expected browser submission status 200, got ${status}.`);
    }

    if (responseBody?.success !== true) {
      failures.push(`Expected browser submission success=true, got ${String(responseBody?.success)}.`);
    }

    if (!browserStatusMessage?.trim()) {
      failures.push("Browser submission did not render a visible status message.");
    }

    if (responseBody?.code === "recaptcha_required") {
      failures.push("Browser submission hit recaptcha_required; the contact page needs a client token flow.");
    }
  } catch (error) {
    failures.push(error instanceof Error ? error.message : String(error));
  } finally {
    await browser?.close();
  }

  return {
    mode: "browser",
    status,
    responseBody,
    browserStatusMessage,
    submissionAttempted,
    responseReceived,
    failures,
  };
}

const startedAt = new Date().toISOString();

if (!baseUrl) {
  const report = {
    baseUrl,
    mode: auditMode,
    headSha,
    startedAt,
    finishedAt: new Date().toISOString(),
    passed: false,
    sent: false,
    submissionAttempted: false,
    responseReceived: false,
    deliveryConfirmed: false,
    failures: ["CONTACT_AUDIT_BASE_URL is required."],
  };
  writeReport(report);
  console.error("Contact delivery audit failed: CONTACT_AUDIT_BASE_URL is required.");
  process.exit(1);
}

if (!confirmSend) {
  const report = {
    baseUrl,
    mode: auditMode,
    headSha,
    startedAt,
    finishedAt: new Date().toISOString(),
    passed: false,
    sent: false,
    submissionAttempted: false,
    responseReceived: false,
    deliveryConfirmed: false,
    failures: ["CONTACT_AUDIT_CONFIRM_SEND=true is required because this audit sends a real contact submission."],
  };
  writeReport(report);
  console.error(
    "Contact delivery audit blocked: set CONTACT_AUDIT_CONFIRM_SEND=true only when you intend to send a real production contact submission.",
  );
  process.exit(1);
}

const url = `${baseUrl}/api/contact`;
const payload = createPayload();
let result;

if (auditMode === "api") {
  result = await runApiAudit(url, payload);
} else if (auditMode === "browser") {
  result = await runBrowserAudit(url, payload);
} else {
  result = {
    mode: auditMode,
    status: null,
    responseBody: null,
    browserStatusMessage: null,
    submissionAttempted: false,
    responseReceived: false,
    failures: ['CONTACT_AUDIT_MODE must be "browser" or "api".'],
  };
}

const report = {
  baseUrl,
  headSha,
  mode: result.mode,
  url,
  startedAt,
  finishedAt: new Date().toISOString(),
  passed: result.failures.length === 0,
  sent: result.failures.length === 0,
  submissionAttempted: result.submissionAttempted === true,
  responseReceived: result.responseReceived === true,
  deliveryConfirmed: result.failures.length === 0,
  status: result.status,
  recaptchaTokenProvided: Boolean(recaptchaToken),
  browserStatusMessage: result.browserStatusMessage,
  response: result.responseBody
    ? {
        success: result.responseBody.success,
        code: result.responseBody.code,
        message: result.responseBody.message,
        requestId: result.responseBody.requestId,
      }
    : null,
  failures: result.failures,
};

writeReport(report);

if (result.failures.length > 0) {
  console.error(`Contact delivery audit failed for ${url}`);
  for (const failure of result.failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Contact delivery audit passed for ${url}`);
