"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FormInput, FormCheckbox } from "@/components/atoms/Form";
import { AppButton } from "@/components/atoms/Button";
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
                <FormInput
                  label="First Name*"
                  type="text"
                  value={form.firstName}
                  onChange={(event) => updateField("firstName", event.target.value)}
                  error={errors.firstName}
                  required
                  autoComplete="given-name"
                />

                <FormInput
                  label="Last Name*"
                  type="text"
                  value={form.lastName}
                  onChange={(event) => updateField("lastName", event.target.value)}
                  error={errors.lastName}
                  required
                  autoComplete="family-name"
                />
              </div>

              <div className="contact-form-grid">
                <FormInput
                  label="Email address*"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  error={errors.email}
                  required
                  autoComplete="email"
                />

                <div className="form-field">
                  <label className="form-label" htmlFor="contact-subject">
                    Select Subject*
                  </label>
                  <select
                    id="contact-subject"
                    className={`form-input ${errors.subject ? "form-input--error" : ""}`}
                    value={form.subject}
                    onChange={(event) => updateField("subject", event.target.value)}
                    required
                    aria-invalid={!!errors.subject}
                    aria-describedby={errors.subject ? "contact-subject-error" : undefined}
                  >
                    <option value="">Select a subject</option>
                    {subjectOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.subject && (
                    <span id="contact-subject-error" className="form-error">
                      {errors.subject}
                    </span>
                  )}
                </div>
              </div>

              <div className="contact-form-grid">
                <FormInput
                  label="Company Name (Optional)"
                  type="text"
                  value={form.company}
                  onChange={(event) => updateField("company", event.target.value)}
                  autoComplete="organization"
                />

                <FormInput
                  label="Contact Number*"
                  type="tel"
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  error={errors.phone}
                  required
                  autoComplete="tel"
                />
              </div>

              {/* Honeypot */}
              <div className="sr-only">
                <label htmlFor="contact-botfield">Leave this field empty</label>
                <input
                  id="contact-botfield"
                  tabIndex={-1}
                  autoComplete="off"
                  type="text"
                  value={form.botfield}
                  onChange={(event) => updateField("botfield", event.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="contact-message">
                  Message*
                </label>
                <textarea
                  id="contact-message"
                  className={`form-input ${errors.message ? "form-input--error" : ""}`}
                  value={form.message}
                  onChange={(event) => updateField("message", event.target.value)}
                  required
                  rows={4}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? "contact-message-error" : undefined}
                />
                {errors.message && (
                  <span id="contact-message-error" className="form-error">
                    {errors.message}
                  </span>
                )}
              </div>

              <FormCheckbox
                label="I agree to the Privacy Policy and consent to the processing of my personal data for the purpose of handling this inquiry.*"
                checked={form.privacyConsent}
                onChange={(event) => updateField("privacyConsent", event.target.checked)}
                required
              />
              {errors.privacyConsent && (
                <span className="form-error -mt-3">{errors.privacyConsent}</span>
              )}

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

              <AppButton 
                type="submit" 
                variant="primary" 
                size="lg" 
                disabled={isSubmitting}
                className="w-full md:w-fit"
              >
                {isSubmitting ? "Sending..." : "Submit"}
              </AppButton>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
