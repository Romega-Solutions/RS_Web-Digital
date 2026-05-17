import { mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const outputDir = path.join(process.cwd(), "reports", "contact-delivery-audit");
const baseUrl = (process.env.CONTACT_AUDIT_BASE_URL || "").replace(/\/+$/, "");
const confirmSend = /^(1|true|yes)$/i.test(process.env.CONTACT_AUDIT_CONFIRM_SEND || "");
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

const startedAt = new Date().toISOString();

if (!baseUrl) {
  const report = {
    baseUrl,
    headSha,
    startedAt,
    finishedAt: new Date().toISOString(),
    passed: false,
    sent: false,
    failures: ["CONTACT_AUDIT_BASE_URL is required."],
  };
  writeReport(report);
  console.error("Contact delivery audit failed: CONTACT_AUDIT_BASE_URL is required.");
  process.exit(1);
}

if (!confirmSend) {
  const report = {
    baseUrl,
    headSha,
    startedAt,
    finishedAt: new Date().toISOString(),
    passed: false,
    sent: false,
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
const failures = [];
let status = null;
let responseBody = null;

try {
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
    failures.push("Production reCAPTCHA is enabled; rerun with CONTACT_AUDIT_RECAPTCHA_TOKEN from a real browser session.");
  }
} catch (error) {
  failures.push(error instanceof Error ? error.message : String(error));
}

const report = {
  baseUrl,
  headSha,
  url,
  startedAt,
  finishedAt: new Date().toISOString(),
  passed: failures.length === 0,
  sent: failures.length === 0,
  status,
  recaptchaTokenProvided: Boolean(recaptchaToken),
  response: responseBody
    ? {
        success: responseBody.success,
        code: responseBody.code,
        message: responseBody.message,
        requestId: responseBody.requestId,
      }
    : null,
  failures,
};

writeReport(report);

if (failures.length > 0) {
  console.error(`Contact delivery audit failed for ${url}`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Contact delivery audit passed for ${url}`);
