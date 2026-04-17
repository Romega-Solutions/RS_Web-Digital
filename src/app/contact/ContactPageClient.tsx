"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

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
  subject: "",
  message: "",
  botfield: "",
};

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
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
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

  return (
    <main>
      <section className="contact-hero">
        <div className="contact-hero-inner">
          <div className="contact-hero-copy">
            <p className="contact-hero-kicker">Contact Romega Solutions</p>
            <h1 className="contact-hero-title">
              Start the conversation that moves your team forward.
            </h1>
            <p className="contact-hero-text">
              Share what you&apos;re building, where the pressure sits, and what kind of
              support you need. We&apos;ll route your message to the right team and follow
              up directly.
            </p>

            <div className="contact-hero-points">
              <div>
                <span>Email</span>
                <a href="mailto:info@romega-solutions.com">info@romega-solutions.com</a>
              </div>
              <div>
                <span>Location</span>
                <p>222 Pacific Coast Hwy, #10, El Segundo, CA 90245</p>
              </div>
              <div>
                <span>What to expect</span>
                <p>Business inquiries, partnerships, hiring support, and strategic consultations.</p>
              </div>
            </div>
          </div>

          <div className="contact-form-shell">
            <div className="contact-form-header">
              <h2>Send us a message</h2>
              <p>We typically respond within one business day.</p>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-form-grid">
                <label className="contact-field">
                  <span>First name</span>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(event) => updateField("firstName", event.target.value)}
                    required
                    autoComplete="given-name"
                  />
                </label>

                <label className="contact-field">
                  <span>Last name</span>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(event) => updateField("lastName", event.target.value)}
                    required
                    autoComplete="family-name"
                  />
                </label>

                <label className="contact-field">
                  <span>Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    required
                    autoComplete="email"
                  />
                </label>

                <label className="contact-field">
                  <span>Phone</span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                    required
                    autoComplete="tel"
                  />
                </label>

                <label className="contact-field">
                  <span>Company</span>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(event) => updateField("company", event.target.value)}
                    autoComplete="organization"
                  />
                </label>

                <label className="contact-field">
                  <span>Subject</span>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(event) => updateField("subject", event.target.value)}
                    placeholder="How can we help?"
                  />
                </label>
              </div>

              <label className="contact-field">
                <span>Message</span>
                <textarea
                  value={form.message}
                  onChange={(event) => updateField("message", event.target.value)}
                  required
                  rows={7}
                />
              </label>

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

              {status.type !== "idle" ? (
                <p className={`contact-form-status contact-form-status-${status.type}`}>{status.message}</p>
              ) : null}

              <div className="contact-form-actions">
                <button type="submit" className="contact-submit" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>

                <p className="contact-form-note">
                  By submitting, you agree to be contacted about your inquiry. Review our{" "}
                  <Link href="#">privacy policy</Link>.
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
