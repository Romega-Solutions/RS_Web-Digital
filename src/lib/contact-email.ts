// The HTML of the email that tells the team about a new contact form message.
// Every value comes from a visitor, so every value is escaped here: a name like
// <img src=x onerror=...> shows up as text in the inbox, it never becomes markup.

import { escapeHtml } from "./html-escape.ts";

export type ContactEmailFields = {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  company: string;
  phone: string;
  message: string;
};

export function buildContactEmailHtml(body: ContactEmailFields, submittedAt: string): string {
  return `<div style="font-family: Arial, sans-serif; background: #f4f6fb; padding: 32px;">
      <div style="max-width: 720px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #d7e3f4;">
        <div style="background: linear-gradient(135deg, #358df0, #a89ff8); color: #ffffff; padding: 28px 32px;">
          <h1 style="margin: 0; font-size: 28px;">Romega Solutions</h1>
          <p style="margin: 8px 0 0; font-size: 15px;">New contact form submission</p>
        </div>
        <div style="padding: 32px;">
          <p style="margin-top: 0; color: #424861; font-size: 16px;">A new inquiry was submitted through the RS Web Digital contact page.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
            <tr><td style="padding: 10px 0; font-weight: 700; color: #358df0;">Name</td><td style="padding: 10px 0; color: #424861;">${escapeHtml(body.firstName)} ${escapeHtml(body.lastName)}</td></tr>
            <tr><td style="padding: 10px 0; font-weight: 700; color: #358df0;">Email</td><td style="padding: 10px 0; color: #424861;">${escapeHtml(body.email)}</td></tr>
            <tr><td style="padding: 10px 0; font-weight: 700; color: #358df0;">Phone</td><td style="padding: 10px 0; color: #424861;">${escapeHtml(body.phone)}</td></tr>
            <tr><td style="padding: 10px 0; font-weight: 700; color: #358df0;">Company</td><td style="padding: 10px 0; color: #424861;">${escapeHtml(body.company || "Not provided")}</td></tr>
            <tr><td style="padding: 10px 0; font-weight: 700; color: #358df0;">Subject</td><td style="padding: 10px 0; color: #424861;">${escapeHtml(body.subject)}</td></tr>
            <tr><td style="padding: 10px 0; font-weight: 700; color: #358df0;">Submitted</td><td style="padding: 10px 0; color: #424861;">${escapeHtml(submittedAt)}</td></tr>
          </table>
          <div style="padding: 20px; border-radius: 12px; background: #f7f9fc; border: 1px solid #d7e3f4;">
            <p style="margin: 0 0 12px; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #358df0; font-weight: 700;">Message</p>
            <p style="margin: 0; white-space: pre-wrap; color: #424861; line-height: 1.7;">${escapeHtml(body.message)}</p>
          </div>
        </div>
      </div>
    </div>`;
}
