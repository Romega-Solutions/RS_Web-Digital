"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { FormCheckbox, FormInput, FormSelect, FormTextarea } from "@/components/atoms/Form";
import { AppButton } from "@/components/atoms/Button";
import { siteConfig } from "@/lib/seo";
import styles from "./ContactPageClient.module.css";

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

const socialLinks: { href: string; label: string; text: string; title: string }[] = [
  {
    href: siteConfig.linkedIn,
    label: "LinkedIn",
    text: "in/romega-solutions",
    title: "Visit Romega Solutions on LinkedIn (@romega-solutions)",
  },
  {
    href: siteConfig.facebook,
    label: "Facebook",
    text: "fb/romega-solutions",
    title: "Visit Romega Solutions on Facebook (@romega-solutions)",
  },
  {
    href: siteConfig.instagram,
    label: "Instagram",
    text: "ig/romega-solutions",
    title: "Visit Romega Solutions on Instagram (@romega-solutions)",
  },
];

type ContactPageClientProps = {
  contactFormAvailable: boolean;
};

export default function ContactPageClient({ contactFormAvailable }: ContactPageClientProps) {
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

      let payload: { success?: boolean; message?: string; code?: string };
      try {
        payload = (await response.json()) as {
          success?: boolean;
          message?: string;
          code?: string;
        };
      } catch {
        throw new Error("The server returned an invalid response. Please try again.");
      }

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
      <section className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.info}>
            <h1 className={styles.title}>Contact Us</h1>
            <p className={styles.copy}>
              If you&apos;re looking to build your team, strengthen your brand, or explore new
              opportunities for growth, we&apos;d love to hear from you. Share your details and our team
              will be in touch soon.
            </p>

            <div className={styles.divider} />

            <div className={styles.block}>
              <h2>Location</h2>
              <p>222 Pacific Coast Hwy, #10 in El Segundo, California 90245</p>
            </div>

            <div className={styles.block}>
              <h2>Email</h2>
              <a href="mailto:info@romega-solutions.com">info@romega-solutions.com</a>
            </div>

            <div className={styles.block}>
              <h2>Social</h2>
              <div className={styles.socials}>
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={social.title}
                  >
                    {social.text}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.formWrap}>
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <div className={styles.formGrid}>
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

              <div className={styles.formGrid}>
                <FormInput
                  label="Email address*"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  error={errors.email}
                  required
                  autoComplete="email"
                />

                <FormSelect
                  label="Select Subject*"
                  value={form.subject}
                  onChange={(event) => updateField("subject", event.target.value)}
                  error={errors.subject}
                  required
                >
                    <option value="">Select a subject</option>
                    {subjectOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </FormSelect>
              </div>

              <div className={styles.formGrid}>
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
              <div className={styles.honeypot} aria-hidden="true">
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

              <FormTextarea
                label="Message*"
                value={form.message}
                onChange={(event) => updateField("message", event.target.value)}
                error={errors.message}
                required
                rows={4}
              />

              <FormCheckbox
                label="I agree to the Privacy Policy and consent to the processing of my personal data for the purpose of handling this inquiry.*"
                checked={form.privacyConsent}
                onChange={(event) => updateField("privacyConsent", event.target.checked)}
                error={errors.privacyConsent}
                required
              />

              {!contactFormAvailable ? (
                <p
                  role="status"
                  className={`${styles.status} ${styles.statusError}`}
                >
                  The contact form is temporarily unavailable. Please email{" "}
                  <a href="mailto:info@romega-solutions.com">info@romega-solutions.com</a>{" "}
                  or call {siteConfig.phone}.
                </p>
              ) : null}

              {status.type !== "idle" ? (
                <p
                  ref={statusRef}
                  tabIndex={-1}
                  role={status.type === "error" ? "alert" : "status"}
                  className={`${styles.status} ${
                    status.type === "success" ? styles.statusSuccess : styles.statusError
                  }`}
                >
                  {status.message}
                </p>
              ) : null}

              <AppButton 
                type="submit" 
                variant="primary" 
                size="lg" 
                disabled={isSubmitting || !contactFormAvailable}
                className={styles.submitButton}
              >
                {!contactFormAvailable ? "Form Unavailable" : isSubmitting ? "Sending..." : "Submit"}
              </AppButton>
            </form>
          </div>
        </div>
      </section>
  );
}
