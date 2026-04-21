"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
  botfield: string;
};

const initialFormState: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  subject: "General Inquiry",
  message: "",
  botfield: "",
};

const concernOptions = [
  "General Inquiry",
  "Business Partnership",
  "Technical Support",
  "Career Opportunities",
] as const;

export default function ContactPageClient() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message: string }>({
    type: "idle",
    message: "",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "idle", message: "" });

    try {
      const firstName = form.firstName.trim();
      const lastName = form.lastName.trim() || firstName;

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          firstName,
          lastName,
          subject: form.subject || "General Inquiry",
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
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateName(value: string) {
    const trimmed = value.trim();

    if (!trimmed) {
      setForm((current) => ({ ...current, firstName: "", lastName: "" }));
      return;
    }

    const parts = trimmed.split(/\s+/);
    const firstName = parts.shift() || "";
    const lastName = parts.join(" ");
    setForm((current) => ({ ...current, firstName, lastName }));
  }

  const fullName = [form.firstName, form.lastName].filter(Boolean).join(" ");

  return (
    <main>
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
                <a href="#" aria-label="LinkedIn">
                  <Image
                    src="/2.0%20Website%20Assets/20.png"
                    alt=""
                    width={56}
                    height={56}
                    className="contact-page-social-icon"
                  />
                </a>
                <a href="#" aria-label="Facebook">
                  <Image
                    src="/2.0%20Website%20Assets/18.png"
                    alt=""
                    width={56}
                    height={56}
                    className="contact-page-social-icon"
                  />
                </a>
                <a href="#" aria-label="Instagram">
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
            <form className="contact-form" onSubmit={handleSubmit}>
              <label className="contact-field">
                <span>Name*</span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(event) => updateName(event.target.value)}
                  required
                  autoComplete="name"
                />
              </label>

              <label className="contact-field">
                <span>Email address*</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  required
                  autoComplete="email"
                />
              </label>

              <label className="contact-field">
                <span>Company Name</span>
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
                />
              </label>

              <fieldset className="contact-concerns">
                <legend>Concerns</legend>
                <div className="contact-concerns-options">
                  {concernOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`contact-concerns-option${form.subject === option ? " is-selected" : ""}`}
                      onClick={() => updateField("subject", option)}
                      aria-pressed={form.subject === option}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </fieldset>

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
                <span>Message</span>
                <textarea
                  value={form.message}
                  onChange={(event) => updateField("message", event.target.value)}
                  required
                  rows={4}
                />
              </label>

              {status.type !== "idle" ? (
                <p className={`contact-form-status contact-form-status-${status.type}`}>{status.message}</p>
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
