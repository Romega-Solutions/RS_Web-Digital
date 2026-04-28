"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/seo";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  company: string;
  phone: string;
  message: string;
  botfield: string;
  privacyConsent: boolean;
};

type FormErrors = Partial<
  Record<
    "firstName" | "lastName" | "email" | "subject" | "phone" | "message" | "privacyConsent",
    string
  >
>;

const initialFormState: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  subject: "",
  company: "",
  phone: "",
  message: "",
  botfield: "",
  privacyConsent: false,
};

const subjectOptions = [
  { value: "general", label: "General Inquiry" },
  { value: "business", label: "Business Partnership" },
  { value: "support", label: "Technical Support" },
  { value: "careers", label: "Career Opportunities" },
] as const;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phonePattern = /^\+?[0-9()\s.-]{7,}$/;

export default function ContactPageClient() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message: string }>({
    type: "idle",
    message: "",
  });
  const statusRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    if (status.type !== "idle") {
      statusRef.current?.focus();
    }
  }, [status]);

  function validateForm() {
    const nextErrors: FormErrors = {};

    if (!form.firstName.trim()) {
      nextErrors.firstName = "Enter your first name.";
    }

    if (!form.lastName.trim()) {
      nextErrors.lastName = "Enter your last name.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Enter your email address.";
    } else if (!emailPattern.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.subject) {
      nextErrors.subject = "Select a subject.";
    }

    if (!form.phone.trim()) {
      nextErrors.phone = "Enter your contact number.";
    } else if (!phonePattern.test(form.phone.trim())) {
      nextErrors.phone = "Enter a valid contact number.";
    }

    if (!form.message.trim()) {
      nextErrors.message = "Enter a message.";
    }

    if (!form.privacyConsent) {
      nextErrors.privacyConsent = "You must agree to the privacy policy.";
    }

    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatus({ type: "error", message: "Please correct the highlighted fields and try again." });
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setStatus({ type: "idle", message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
        }),
      });

      const payload = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to send your message right now.");
      }

      setStatus({
        type: "success",
        message: payload.message || "Thank you. Your message has been sent.",
      });
      setForm(initialFormState);
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to send your message right now.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    if (status.type !== "idle") {
      setStatus({ type: "idle", message: "" });
    }

    if (field === "email") {
      setErrors((current) => ({ ...current, email: undefined }));
    }
    if (field === "firstName") {
      setErrors((current) => ({ ...current, firstName: undefined }));
    }
    if (field === "lastName") {
      setErrors((current) => ({ ...current, lastName: undefined }));
    }
    if (field === "subject") {
      setErrors((current) => ({ ...current, subject: undefined }));
    }
    if (field === "phone") {
      setErrors((current) => ({ ...current, phone: undefined }));
    }
    if (field === "message") {
      setErrors((current) => ({ ...current, message: undefined }));
    }
    if (field === "privacyConsent") {
      setErrors((current) => ({ ...current, privacyConsent: undefined }));
    }
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <main id="main-content" tabIndex={-1}>
      <section className="contact-page">
        <div className="contact-page-inner">
          <div className="contact-page-info">
            <h1 className="contact-page-title">Contact Us</h1>
            <p className="contact-page-copy">
              If you&apos;re looking to build your team, strengthen your brand, or explore new
              opportunities for growth, we&apos;d love to hear from you. Share your details and our team
              will be in touch soon.
            </p>

            <div className="contact-page-divider" />

            <div className="contact-page-block">
              <h2>Location</h2>
              <p>222 Pacific Coast Hwy, #10 in El Segundo, California 90245</p>
            </div>

            <div className="contact-page-block">
              <h2>Email</h2>
              <a href="mailto:info@romega-solutions.com">info@romega-solutions.com</a>
            </div>

            <div className="contact-page-block">
              <h2>Connect with Us</h2>
              <div className="contact-page-socials">
                <a
                  href={siteConfig.linkedIn}
                  aria-label="LinkedIn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src="/2.0%20Website%20Assets/20.png"
                    alt=""
                    width={56}
                    height={56}
                    className="contact-page-social-icon"
                  />
                </a>
                <a
                  href={siteConfig.facebook}
                  aria-label="Facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src="/2.0%20Website%20Assets/18.png"
                    alt=""
                    width={56}
                    height={56}
                    className="contact-page-social-icon"
                  />
                </a>
                <a
                  href={siteConfig.instagram}
                  aria-label="Instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src="/2.0%20Website%20Assets/19.png"
                    alt=""
                    width={56}
                    height={56}
                    className="contact-page-social-icon"
                  />
                </a>
              </div>
            </div>
          </div>

          <div className="contact-page-form-wrap">
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="contact-form-grid">
                <label className="contact-field">
                  <span>First Name*</span>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(event) => updateField("firstName", event.target.value)}
                    required
                    autoComplete="given-name"
                    aria-invalid={errors.firstName ? "true" : "false"}
                    aria-describedby={errors.firstName ? "contact-first-name-error" : undefined}
                  />
                  {errors.firstName ? (
                    <span id="contact-first-name-error" className="contact-field-error">
                      {errors.firstName}
                    </span>
                  ) : null}
                </label>

                <label className="contact-field">
                  <span>Last Name*</span>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(event) => updateField("lastName", event.target.value)}
                    required
                    autoComplete="family-name"
                    aria-invalid={errors.lastName ? "true" : "false"}
                    aria-describedby={errors.lastName ? "contact-last-name-error" : undefined}
                  />
                  {errors.lastName ? (
                    <span id="contact-last-name-error" className="contact-field-error">
                      {errors.lastName}
                    </span>
                  ) : null}
                </label>
              </div>

              <div className="contact-form-grid">
                <label className="contact-field">
                  <span>Email address*</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    required
                    autoComplete="email"
                    aria-invalid={errors.email ? "true" : "false"}
                    aria-describedby={errors.email ? "contact-email-error" : undefined}
                  />
                  {errors.email ? (
                    <span id="contact-email-error" className="contact-field-error">
                      {errors.email}
                    </span>
                  ) : null}
                </label>

                <label className="contact-field">
                  <span>Select Subject*</span>
                  <select
                    value={form.subject}
                    onChange={(event) => updateField("subject", event.target.value)}
                    required
                    aria-invalid={errors.subject ? "true" : "false"}
                    aria-describedby={errors.subject ? "contact-subject-error" : undefined}
                  >
                    <option value="">Select a subject</option>
                    {subjectOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.subject ? (
                    <span id="contact-subject-error" className="contact-field-error">
                      {errors.subject}
                    </span>
                  ) : null}
                </label>
              </div>

              <div className="contact-form-grid">
                <label className="contact-field">
                  <span>Company Name (Optional)</span>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(event) => updateField("company", event.target.value)}
                    autoComplete="organization"
                  />
                </label>

                <label className="contact-field">
                  <span>Contact Number*</span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                    required
                    autoComplete="tel"
                    aria-invalid={errors.phone ? "true" : "false"}
                    aria-describedby={errors.phone ? "contact-phone-error" : undefined}
                  />
                  {errors.phone ? (
                    <span id="contact-phone-error" className="contact-field-error">
                      {errors.phone}
                    </span>
                  ) : null}
                </label>
              </div>

              <label className="contact-field contact-honeypot" aria-hidden="true">
                <span>Leave this field empty</span>
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  type="text"
                  value={form.botfield}
                  onChange={(event) => updateField("botfield", event.target.value)}
                />
              </label>

              <label className="contact-field">
                <span>Message*</span>
                <textarea
                  value={form.message}
                  onChange={(event) => updateField("message", event.target.value)}
                  required
                  rows={4}
                  aria-invalid={errors.message ? "true" : "false"}
                  aria-describedby={errors.message ? "contact-message-error" : undefined}
                />
                {errors.message ? (
                  <span id="contact-message-error" className="contact-field-error">
                    {errors.message}
                  </span>
                ) : null}
              </label>

              <div className="contact-consent-wrap">
                <label className="contact-consent-label">
                  <input
                    type="checkbox"
                    checked={form.privacyConsent}
                    onChange={(event) => updateField("privacyConsent", event.target.checked)}
                    required
                    aria-invalid={errors.privacyConsent ? "true" : "false"}
                    aria-describedby={errors.privacyConsent ? "contact-privacy-error" : undefined}
                  />
                  <span className="contact-consent-text">
                    I agree to the{" "}
                    <Link href="/privacy" target="_blank" className="contact-link">
                      Privacy Policy
                    </Link>{" "}
                    and consent to the processing of my personal data for the purpose of handling this
                    inquiry.*
                  </span>
                </label>
                {errors.privacyConsent ? (
                  <span id="contact-privacy-error" className="contact-field-error">
                    {errors.privacyConsent}
                  </span>
                ) : null}
              </div>

              {status.type !== "idle" ? (
                <p
                  ref={statusRef}
                  tabIndex={-1}
                  role={status.type === "error" ? "alert" : "status"}
                  className={`contact-form-status contact-form-status-${status.type}`}
                >
                  {status.message}
                </p>
              ) : null}

              <button type="submit" className="contact-submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
