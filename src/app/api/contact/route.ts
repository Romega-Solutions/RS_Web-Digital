import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

type ContactBody = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  subject?: string;
  message?: string;
  botfield?: string;
};

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 3;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() || realIp || "unknown";
}

function applyRateLimit(ip: string) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - record.count };
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

async function sendEmail(body: Required<Omit<ContactBody, "botfield">>) {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL || "info@romega-solutions.com";

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const resend = new Resend(apiKey);
  const submittedAt = new Date().toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });

  await resend.emails.send({
    from: "Romega Contact Form <onboarding@resend.dev>",
    to: adminEmail,
    replyTo: body.email,
    subject: `New Contact: ${body.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; background: #f4f7fb; padding: 32px;">
        <div style="max-width: 720px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #d7e3f4;">
          <div style="background: linear-gradient(135deg, #378dee, #7998f0); color: #ffffff; padding: 28px 32px;">
            <h1 style="margin: 0; font-size: 28px;">Romega Solutions</h1>
            <p style="margin: 8px 0 0; font-size: 15px;">New contact form submission</p>
          </div>
          <div style="padding: 32px;">
            <p style="margin-top: 0; color: #1a1c1e; font-size: 16px;">A new inquiry was submitted through the RS Web Digital contact page.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
              <tr><td style="padding: 10px 0; font-weight: 700; color: #378dee;">Name</td><td style="padding: 10px 0; color: #1a1c1e;">${body.firstName} ${body.lastName}</td></tr>
              <tr><td style="padding: 10px 0; font-weight: 700; color: #378dee;">Email</td><td style="padding: 10px 0; color: #1a1c1e;">${body.email}</td></tr>
              <tr><td style="padding: 10px 0; font-weight: 700; color: #378dee;">Phone</td><td style="padding: 10px 0; color: #1a1c1e;">${body.phone}</td></tr>
              <tr><td style="padding: 10px 0; font-weight: 700; color: #378dee;">Company</td><td style="padding: 10px 0; color: #1a1c1e;">${body.company || "Not provided"}</td></tr>
              <tr><td style="padding: 10px 0; font-weight: 700; color: #378dee;">Subject</td><td style="padding: 10px 0; color: #1a1c1e;">${body.subject}</td></tr>
              <tr><td style="padding: 10px 0; font-weight: 700; color: #378dee;">Submitted</td><td style="padding: 10px 0; color: #1a1c1e;">${submittedAt}</td></tr>
            </table>
            <div style="padding: 20px; border-radius: 12px; background: #f7f9fc; border: 1px solid #d7e3f4;">
              <p style="margin: 0 0 12px; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #378dee; font-weight: 700;">Message</p>
              <p style="margin: 0; white-space: pre-wrap; color: #1a1c1e; line-height: 1.7;">${body.message}</p>
            </div>
          </div>
        </div>
      </div>
    `,
  });
}

export async function POST(request: NextRequest) {
  try {
    const rateLimit = applyRateLimit(getClientIp(request));

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    const body = (await request.json()) as ContactBody;

    if (body.botfield && body.botfield.trim() !== "") {
      return NextResponse.json({ success: true, message: "Thank you. Your message has been sent." });
    }

    const requiredFields: Array<keyof ContactBody> = ["firstName", "lastName", "email", "phone", "message"];
    for (const field of requiredFields) {
      if (!body[field] || !String(body[field]).trim()) {
        return NextResponse.json(
          { success: false, message: `${field} is required.` },
          { status: 400 },
        );
      }
    }

    if (!isValidEmail(body.email!)) {
      return NextResponse.json({ success: false, message: "Invalid email address." }, { status: 400 });
    }

    if (!isValidPhone(body.phone!)) {
      return NextResponse.json({ success: false, message: "Invalid phone number." }, { status: 400 });
    }

    const inspectionFields = [body.firstName, body.lastName, body.company, body.subject, body.message].filter(
      Boolean,
    ) as string[];

    if (inspectionFields.some((value) => hasMaliciousPattern(value))) {
      return NextResponse.json({ success: false, message: "Invalid input detected." }, { status: 400 });
    }

    const sanitizedBody = {
      firstName: sanitizeText(body.firstName!, 100),
      lastName: sanitizeText(body.lastName!, 100),
      email: body.email!.trim().toLowerCase(),
      phone: sanitizeText(body.phone!, 40),
      company: sanitizeText(body.company || "", 120),
      subject: sanitizeText(body.subject || "General inquiry", 160) || "General inquiry",
      message: sanitizeText(body.message!, 2000),
    };

    await sendEmail(sanitizedBody);

    return NextResponse.json({
      success: true,
      message: "Thank you. Your message has been sent successfully.",
    });
  } catch (error) {
    console.error("[RS_Web-Digital contact] submission failed", error);
    return NextResponse.json(
      { success: false, message: "Failed to send message. Please try again." },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ success: false, message: "Method not allowed" }, { status: 405 });
}
