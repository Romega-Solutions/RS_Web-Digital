import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { randomUUID } from "node:crypto";

type ContactBody = {
  firstName?: string;
  lastName?: string;
  email?: string;
  subject?: string;
  company?: string;
  phone?: string;
  message?: string;
  recaptchaToken?: string;
  botfield?: string;
  privacyConsent?: boolean;
};

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 3;
const RATE_LIMIT_MAX_REQUESTS_AUTOMATED = 2;
const DEDUPE_WINDOW_MS = 30_000;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const dedupeMap = new Map<string, { signature: string; expiresAt: number }>();
const MAX_REQUEST_BODY_SIZE = 16_000;
const FIELD_LIMITS = {
  firstName: 100,
  lastName: 100,
  email: 254,
  phone: 40,
  company: 120,
  subject: 100,
  message: 2000,
};

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() || realIp || "unknown";
}

function createRequestId() {
  return randomUUID();
}

function createFingerprint(request: NextRequest) {
  return {
    ip: getClientIp(request),
    userAgent: (request.headers.get("user-agent") || "").slice(0, 120),
    referer: (request.headers.get("referer") || "").slice(0, 120),
  };
}

function assertRequestSize(payload: string) {
  return payload.length <= MAX_REQUEST_BODY_SIZE;
}

function isString(value: unknown, maxLength?: number) {
  if (typeof value !== "string") {
    return false;
  }
  return maxLength ? value.length <= maxLength : true;
}

function trimAndNormalize(value: string | undefined, maxLength: number) {
  return (value || "").trim().slice(0, maxLength);
}

function isLikelyAutomatedUserAgent(userAgent: string, referer: string) {
  return (
    !userAgent ||
    userAgent.toLowerCase().includes("bot") ||
    userAgent.toLowerCase().includes("crawler") ||
    userAgent.toLowerCase().includes("headless") ||
    !referer
  );
}

function applyRateLimit(ip: string, userAgent: string, referer: string) {
  const maxRequests = isLikelyAutomatedUserAgent(userAgent, referer)
    ? RATE_LIMIT_MAX_REQUESTS_AUTOMATED
    : RATE_LIMIT_MAX_REQUESTS;
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: maxRequests - record.count };
}

function makeSubmissionSignature(body: {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  phone: string;
  company: string;
  message: string;
}) {
  const normalizedMessage = body.message.replace(/\s+/g, " ").trim().toLowerCase();
  return [
    body.email.toLowerCase(),
    body.subject.toLowerCase(),
    body.phone,
    body.firstName.toLowerCase(),
    body.lastName.toLowerCase(),
    normalizedMessage.slice(0, 200),
  ].join("|");
}

function isDuplicateSubmission(ip: string, signature: string) {
  const key = `${ip}:${signature}`;
  const now = Date.now();
  const record = dedupeMap.get(key);

  if (!record || record.expiresAt <= now) {
    dedupeMap.set(key, { signature, expiresAt: now + DEDUPE_WINDOW_MS });
    return false;
  }

  if (record.signature !== signature) {
    dedupeMap.set(key, { signature, expiresAt: now + DEDUPE_WINDOW_MS });
    return false;
  }

  return true;
}

function cleanupDedupe(now = Date.now()) {
  if (Math.random() > 0.05) {
    return;
  }

  for (const [key, record] of dedupeMap.entries()) {
    if (record.expiresAt <= now) {
      dedupeMap.delete(key);
    }
  }
}

function sanitizeText(value: string, maxLength = 500) {
  return value.replace(/[<>"']/g, "").trim().slice(0, maxLength);
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;
}

function isValidPhone(phone: string) {
  const normalized = phone.replace(/[\s().-]/g, "");
  return /^\+?[0-9]{7,15}$/.test(normalized);
}

function hasMaliciousPattern(value: string) {
  const patterns = [
    /(\bUNION\b.*\bSELECT\b)/i,
    /(\bDROP\b.*\bTABLE\b)/i,
    /(\bINSERT\b.*\bINTO\b)/i,
    /(\bDELETE\b.*\bFROM\b)/i,
    /(\bUPDATE\b.*\bSET\b)/i,
    /(--|#|\/\*|\*\/)/,
    /<script/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
  ];

  return patterns.some((pattern) => pattern.test(value));
}

const subjectLabelMap: Record<string, string> = {
  general: "General Inquiry",
  business: "Business Partnership",
  support: "Technical Support",
  careers: "Career Opportunities",
};
type SubjectCode = keyof typeof subjectLabelMap;
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const EMAIL_CAPTURE_FALLBACK =
  process.env.EMAIL_CONTACT_FALLBACK_ENABLED?.toLowerCase() === "true" && !IS_PRODUCTION;

function normalizeSubject(value: string): { code: SubjectCode; label: string } | null {
  const normalized = value.trim().toLowerCase();
  if (subjectLabelMap[normalized]) {
    return { code: normalized as SubjectCode, label: subjectLabelMap[normalized] };
  }

  const matchedKey = Object.keys(subjectLabelMap).find(
    (key) => subjectLabelMap[key].toLowerCase() === normalized,
  );
  if (matchedKey) {
    return { code: matchedKey as SubjectCode, label: subjectLabelMap[matchedKey] };
  }

  return null;
}

async function verifyRecaptcha(token: string) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    return true;
  }

  const controller = new AbortController();
  const timeoutMs = Number(process.env.RECAPTCHA_TIMEOUT_MS || "5000");
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
      signal: controller.signal,
    });

    const data = (await response.json()) as { success?: boolean };
    return response.ok && data.success === true;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

type ContactEmailPayload = {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  company: string;
  phone: string;
  message: string;
};

type ContactEmailResult =
  | { sent: true; skipped: false; reason?: undefined }
  | {
      sent: false;
      skipped: true;
      reason: "fallback";
    }
  | {
      sent: false;
      skipped: false;
      reason:
        | "missing_api_key"
        | "send_failed"
        | "validation_failed"
        | "unexpected";
      statusCode?: number;
      detail?: string;
    };

function getEmailErrorMessage(reason: ContactEmailResult["reason"], detail?: string) {
  if (reason === "missing_api_key") {
    return "Email provider is not configured. Please contact support if this continues.";
  }

  if (reason === "send_failed") {
    if (detail) {
      if (IS_PRODUCTION) {
        return "Email delivery failed. Please try again shortly.";
      }
      return `Email delivery failed: ${detail}`;
    }
    return "Email delivery failed. Please try again shortly.";
  }

  if (reason === "validation_failed") {
    return "Invalid payload submitted to email provider. Please check your input and try again.";
  }

  return "Unable to send message due to a temporary service issue. Please try again.";
}

async function sendEmail(body: ContactEmailPayload): Promise<ContactEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL || "info@romega-solutions.com";

  if (!apiKey) {
    if (EMAIL_CAPTURE_FALLBACK) {
      console.warn(
        "[RS_Web-Digital contact] RESEND_API_KEY is not configured. Skipping outbound email in non-production mode.",
      );
      return { sent: false, skipped: true, reason: "fallback" };
    }

    return { sent: false, skipped: false, reason: "missing_api_key" };
  }

  try {
    const resend = new Resend(apiKey);
    const submittedAt = new Date().toLocaleString("en-US", {
      dateStyle: "full",
      timeStyle: "short",
    });

    const result = await resend.emails.send({
      from: "Romega Contact Form <noreply@romega-solutions.com>",
      to: adminEmail,
      replyTo: body.email,
      subject: `New Contact: ${body.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; background: #f4f6fb; padding: 32px;">
          <div style="max-width: 720px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #d7e3f4;">
            <div style="background: linear-gradient(135deg, #358df0, #a89ff8); color: #ffffff; padding: 28px 32px;">
              <h1 style="margin: 0; font-size: 28px;">Romega Solutions</h1>
              <p style="margin: 8px 0 0; font-size: 15px;">New contact form submission</p>
            </div>
            <div style="padding: 32px;">
              <p style="margin-top: 0; color: #424861; font-size: 16px;">A new inquiry was submitted through the RS Web Digital contact page.</p>
              <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
                <tr><td style="padding: 10px 0; font-weight: 700; color: #358df0;">Name</td><td style="padding: 10px 0; color: #424861;">${body.firstName} ${body.lastName}</td></tr>
                <tr><td style="padding: 10px 0; font-weight: 700; color: #358df0;">Email</td><td style="padding: 10px 0; color: #424861;">${body.email}</td></tr>
                <tr><td style="padding: 10px 0; font-weight: 700; color: #358df0;">Phone</td><td style="padding: 10px 0; color: #424861;">${body.phone}</td></tr>
                <tr><td style="padding: 10px 0; font-weight: 700; color: #358df0;">Company</td><td style="padding: 10px 0; color: #424861;">${body.company || "Not provided"}</td></tr>
                <tr><td style="padding: 10px 0; font-weight: 700; color: #358df0;">Subject</td><td style="padding: 10px 0; color: #424861;">${body.subject}</td></tr>
                <tr><td style="padding: 10px 0; font-weight: 700; color: #358df0;">Submitted</td><td style="padding: 10px 0; color: #424861;">${submittedAt}</td></tr>
              </table>
              <div style="padding: 20px; border-radius: 12px; background: #f7f9fc; border: 1px solid #d7e3f4;">
                <p style="margin: 0 0 12px; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #358df0; font-weight: 700;">Message</p>
                <p style="margin: 0; white-space: pre-wrap; color: #424861; line-height: 1.7;">${body.message}</p>
              </div>
            </div>
          </div>
        </div>
      `,
    });

    if (result.error) {
      return {
        sent: false,
        skipped: false,
        reason: "send_failed",
        statusCode: 503,
        detail: result.error.message || "Unable to send with email provider.",
      };
    }
  } catch (error) {
    return {
      sent: false,
      skipped: false,
      reason: "validation_failed",
      statusCode: 502,
      detail: error instanceof Error ? error.message : "Unknown email provider error.",
    };
  }

  return { sent: true, skipped: false };
}

export async function POST(request: NextRequest) {
  const requestId = createRequestId();

  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return NextResponse.json(
        { success: false, message: "Unsupported content type. JSON expected.", code: "invalid_content_type" },
        { status: 415 },
      );
    }

    const fingerprint = createFingerprint(request);
    const rawBody = await request.text();
    if (!assertRequestSize(rawBody)) {
      return NextResponse.json(
        { success: false, message: "Payload is too large.", code: "payload_too_large" },
        { status: 413 },
      );
    }

    let body: ContactBody;
    try {
      body = JSON.parse(rawBody) as ContactBody;
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body.", code: "invalid_payload" },
        { status: 400 },
      );
    }

    const rateLimit = applyRateLimit(fingerprint.ip, fingerprint.userAgent, fingerprint.referer);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: "Too many requests. Please try again later.", code: "rate_limited" },
        { status: 429 },
      );
    }

    if (body.botfield !== undefined && body.botfield !== null && !isString(body.botfield)) {
      return NextResponse.json(
        { success: false, message: "Invalid form payload.", code: "invalid_payload" },
        { status: 400 },
      );
    }

    if (body.botfield && body.botfield.trim() !== "") {
      console.info("[RS_Web-Digital contact] Honeypot triggered", {
        requestId,
        ip: fingerprint.ip,
      });
      return NextResponse.json({ success: true, message: "Thank you. Your message has been sent." });
    }

    const requiredFields: Array<keyof ContactBody> = [
      "firstName",
      "lastName",
      "email",
      "subject",
      "phone",
      "message",
    ];
    for (const field of requiredFields) {
      if (!body[field] || typeof body[field] !== "string" || !String(body[field]).trim()) {
        return NextResponse.json(
          { success: false, message: `${field} is required.`, code: "missing_field" },
          { status: 400 },
        );
      }
    }

    if (!isString(body.firstName, FIELD_LIMITS.firstName)) {
      return NextResponse.json({ success: false, message: "Invalid first name length.", code: "invalid_length" }, { status: 400 });
    }
    if (!isString(body.lastName, FIELD_LIMITS.lastName)) {
      return NextResponse.json({ success: false, message: "Invalid last name length.", code: "invalid_length" }, { status: 400 });
    }
    if (!isString(body.phone, FIELD_LIMITS.phone)) {
      return NextResponse.json({ success: false, message: "Invalid phone length.", code: "invalid_length" }, { status: 400 });
    }
    if (!isString(body.email, FIELD_LIMITS.email)) {
      return NextResponse.json({ success: false, message: "Invalid email length.", code: "invalid_length" }, { status: 400 });
    }
    if (!isString(body.subject, FIELD_LIMITS.subject)) {
      return NextResponse.json({ success: false, message: "Invalid subject length.", code: "invalid_length" }, { status: 400 });
    }
    if (!isString(body.message, FIELD_LIMITS.message)) {
      return NextResponse.json({ success: false, message: "Invalid message length.", code: "invalid_length" }, { status: 400 });
    }
    if (!isString(body.company || "", FIELD_LIMITS.company)) {
      return NextResponse.json({ success: false, message: "Invalid company length.", code: "invalid_length" }, { status: 400 });
    }

    if (!isValidEmail(body.email!)) {
      return NextResponse.json({ success: false, message: "Invalid email address.", code: "invalid_email" }, { status: 400 });
    }

    if (!isValidPhone(body.phone!)) {
      return NextResponse.json({ success: false, message: "Invalid phone number.", code: "invalid_phone" }, { status: 400 });
    }

    if (body.privacyConsent !== true) {
      return NextResponse.json(
        { success: false, message: "Privacy consent is required.", code: "privacy_consent_required" },
        { status: 400 },
      );
    }

    if (process.env.RECAPTCHA_SECRET_KEY) {
      if (!body.recaptchaToken) {
        return NextResponse.json(
          { success: false, message: "reCAPTCHA verification required.", code: "recaptcha_required" },
          { status: 400 },
        );
      }

      const recaptchaValid = await verifyRecaptcha(body.recaptchaToken);
      if (!recaptchaValid) {
        return NextResponse.json(
          { success: false, message: "reCAPTCHA verification failed.", code: "recaptcha_failed" },
          { status: 400 },
        );
      }
    }

    const normalizedSubject = normalizeSubject(body.subject!);
    if (!normalizedSubject) {
      return NextResponse.json(
        { success: false, message: "Invalid subject selection.", code: "invalid_subject" },
        { status: 400 },
      );
    }

    const trimmedBody = {
      firstName: trimAndNormalize(body.firstName, FIELD_LIMITS.firstName),
      lastName: trimAndNormalize(body.lastName, FIELD_LIMITS.lastName),
      email: trimAndNormalize(body.email, FIELD_LIMITS.email),
      phone: trimAndNormalize(body.phone, FIELD_LIMITS.phone),
      company: trimAndNormalize(body.company, FIELD_LIMITS.company),
      subject: trimAndNormalize(body.subject, FIELD_LIMITS.subject),
      message: trimAndNormalize(body.message, FIELD_LIMITS.message),
    };

    cleanupDedupe();

    if (isDuplicateSubmission(fingerprint.ip, makeSubmissionSignature(trimmedBody))) {
      return NextResponse.json(
        {
          success: false,
          message: "Duplicate submission detected. Please wait before resubmitting.",
          code: "duplicate_submission",
        },
        { status: 409 },
      );
    }

    const inspectionFields = [
      trimmedBody.firstName,
      trimmedBody.lastName,
      trimmedBody.company,
      trimmedBody.subject,
      trimmedBody.message,
    ];

    if (inspectionFields.some((value) => hasMaliciousPattern(value))) {
      return NextResponse.json(
        { success: false, message: "Invalid input detected.", code: "suspicious_input" },
        { status: 400 },
      );
    }

    const sanitizedBody = {
      firstName: sanitizeText(trimmedBody.firstName, 100),
      lastName: sanitizeText(trimmedBody.lastName, 100),
      email: trimmedBody.email.toLowerCase(),
      phone: sanitizeText(trimmedBody.phone, 40),
      company: sanitizeText(trimmedBody.company, 120),
      subject: normalizedSubject.label,
      message: sanitizeText(trimmedBody.message, 2000),
    };

    const emailResult = await sendEmail(sanitizedBody);

    if (!emailResult.sent) {
      if (emailResult.skipped) {
        return NextResponse.json({
          success: true,
          message:
            "Thank you. Your message has been captured and will be sent once email is configured.",
        });
      }

      const statusCode = emailResult.reason === "missing_api_key" ? 503 : emailResult.statusCode || 500;

      return NextResponse.json(
        {
          success: false,
          message: getEmailErrorMessage(emailResult.reason, emailResult.detail),
          code: emailResult.reason,
          requestId,
        },
        { status: statusCode },
      );
    }

    console.info("[RS_Web-Digital contact] submission received", {
      requestId,
      subject: sanitizedBody.subject,
      ip: fingerprint.ip,
    });

    return NextResponse.json({ success: true, message: "Thank you. Your message has been sent successfully." });
  } catch (error) {
    console.error("[RS_Web-Digital contact] submission failed", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { success: false, message: "Failed to send message. Please try again.", requestId },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ success: false, message: "Method not allowed" }, { status: 405 });
}
