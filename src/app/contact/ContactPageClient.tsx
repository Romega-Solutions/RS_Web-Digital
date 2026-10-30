"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FormCheckbox, FormInput, FormSelect, FormTextarea } from "@/components/atoms/Form";
import { AppButton } from "@/components/atoms/Button";
import { PhoneField } from "@/components/molecules/forms/PhoneField";
import {
  MailLinkedMessage,
  TurnstileNotice,
  TurnstileSlot,
} from "@/components/molecules/forms/TurnstileCheck";
import { useTurnstile } from "@/components/molecules/forms/useTurnstile";
import { DEFAULT_COUNTRY, normalizeCountry, type CountryCode } from "@/lib/form/countries";
import {
  EMAIL_INVALID_MESSAGE,
  EMAIL_PLACEHOLDER,
  EMAIL_REQUIRED_MESSAGE,
  isValidEmail,
} from "@/lib/form/email";
import { FIELD_ERRORS_MESSAGE, editClearsStatus, isFieldSummary, shouldShowBanner } from "@/lib/form/field-errors";
import { fieldError } from "@/lib/form/field-state";
import { smartName } from "@/lib/form/name";
import { phoneErrorMessage, validatePhone } from "@/lib/form/phone";
import {
  MESSAGE_FILTER_NOTICE,
  MESSAGE_MAX_LENGTH,
  filterPlainText,
  formatCounter,
} from "@/lib/form/text";
import { siteConfig } from "@/lib/seo";
import { TURNSTILE_ACTIONS, TURNSTILE_TOKEN_HEADER } from "@/lib/turnstile/shared";
import { CONTACT_EMAIL, browserCaptchaMessage } from "@/lib/turnstile/messages";
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

function emailError(value: string): string | undefined {
  const email = value.trim();
  if (!email) return EMAIL_REQUIRED_MESSAGE;
  return isValidEmail(email) ? undefined : EMAIL_INVALID_MESSAGE;
}

type ContactPageClientProps = {
  contactFormAvailable: boolean;
  // Empty unless the Contact security check is switched on.
  turnstileSiteKey: string;
};

export default function ContactPageClient({ contactFormAvailable, turnstileSiteKey }: ContactPageClientProps) {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState<{
    type: "idle" | "success" | "error";
    message: string;
    // The message offers an email address to use instead (a failed security check).
    mailLink?: boolean;
  }>({
    type: "idle",
    message: "",
  });
  const turnstile = useTurnstile({ siteKey: turnstileSiteKey, action: TURNSTILE_ACTIONS.contact });
  const [phoneCountry, setPhoneCountry] = useState<CountryCode>(DEFAULT_COUNTRY);
  const [geoCountry, setGeoCountry] = useState<CountryCode>(DEFAULT_COUNTRY);
  const [messageFiltered, setMessageFiltered] = useState(false);
  const statusRef = useRef<HTMLParagraphElement | null>(null);
  const didPrefillRef = useRef(false);
  const phoneTouchedRef = useRef(false);

  // The page stays static, so the visitor's country comes from a tiny route that
  // reads the edge header. Until it answers (or if it fails) the form opens on PH.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/geo", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { country?: string } | null) => {
        if (cancelled || !payload) return;
        const country = normalizeCountry(payload.country);
        setGeoCountry(country);
        if (!phoneTouchedRef.current) setPhoneCountry(country);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Prefill from /talent → "Inquire" deep-link. URL shape:
  //   /contact?inquiry=talent&talentId=TL-128&role=Brand+Strategist
  // Sets the subject to "Business Partnership" and seeds the message
  // body with a starter line referencing the candidate code.
  useEffect(() => {
    if (didPrefillRef.current) return;
    const inquiry = searchParams.get("inquiry");
    const talentId = searchParams.get("talentId");
    const role = searchParams.get("role");
    if (inquiry !== "talent" || !talentId) return;

    didPrefillRef.current = true;
    // One-shot URL→form prefill on mount; guarded by didPrefillRef so it
    // runs once even under StrictMode. The rule disallows setState in
    // effects, but this is the documented Next.js pattern for reading
    // useSearchParams() into local state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm((current) => ({
      ...current,
      subject: current.subject || "business",
      message:
        current.message ||
        `I'd like to learn more about candidate ${talentId}${role ? ` (${role})` : ""}.`,
    }));
  }, [searchParams]);

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

    const emailMessage = emailError(form.email);
    if (emailMessage) {
      nextErrors.email = emailMessage;
    }

    if (!form.subject) {
      nextErrors.subject = "Select a subject.";
    }

    const phoneCheck = validatePhone(form.phone, phoneCountry);
    if (!phoneCheck.ok) {
      nextErrors.phone = phoneErrorMessage(phoneCheck.reason, phoneCountry);
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
    // The button looks disabled while a check or send is under way, but Enter in a
    // field still submits the form, so the guard lives here too.
    if (isSubmitting || isChecking) return;
    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatus({ type: "error", message: FIELD_ERRORS_MESSAGE });
      return;
    }
    const phoneCheck = validatePhone(form.phone, phoneCountry);

    setIsSubmitting(true);
    setErrors({});
    setStatus({ type: "idle", message: "" });

    try {
      let captchaToken = "";
      if (turnstile.enabled) {
        setIsChecking(true);
        const check = await turnstile.check();
        setIsChecking(false);
        if (!check.ok) {
          setStatus({
            type: "error",
            message: browserCaptchaMessage("contact", check.reason),
            mailLink: true,
          });
          return;
        }
        captchaToken = check.token;
      }

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(captchaToken ? { [TURNSTILE_TOKEN_HEADER]: captchaToken } : {}),
        },
        body: JSON.stringify({
          ...form,
          firstName: smartName(form.firstName),
          lastName: smartName(form.lastName),
          email: form.email.trim(),
          phone: phoneCheck.ok ? phoneCheck.e164 : form.phone,
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
        if (typeof payload.code === "string" && payload.code.startsWith("captcha_")) {
          setStatus({
            type: "error",
            message: payload.message || "We couldn't run the security check. Please try again.",
            mailLink: true,
          });
          return;
        }
        throw new Error(payload.message || "Unable to send your message right now.");
      }

      setStatus({
        type: "success",
        message: payload.message || "Thank you. Your message has been sent.",
      });
      setForm(initialFormState);
      setMessageFiltered(false);
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to send your message right now.",
      });
    } finally {
      setIsChecking(false);
      setIsSubmitting(false);
    }
  }

  // Red only while a field's current value is wrong: see lib/form/field-state.
  // An empty name is not red on blur; it turns red only on a submit attempt.
  function handleNameBlur(field: "firstName" | "lastName", label: string) {
    const value = smartName(form[field]);
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: fieldError("blur", value, (text) => (text.trim() ? undefined : label), current[field]) }));
  }

  function handleEmailBlur() {
    const trimmed = form.email.trim();
    if (trimmed !== form.email) setForm((current) => ({ ...current, email: trimmed }));
    setErrors((current) => ({ ...current, email: fieldError("blur", trimmed, emailError, current.email) }));
  }

  function handlePhoneChange(next: { country: CountryCode; value: string }) {
    phoneTouchedRef.current = true;
    setPhoneCountry(next.country);
    updateField("phone", next.value);
    const check = validatePhone(next.value, next.country);
    // Letters or symbols that got in (a paste) are wrong content, so they are red straight away.
    // Anything else clears the red; a short number is judged again on blur or submit.
    setErrors((current) => ({
      ...current,
      phone: !check.ok && check.reason === "chars" ? phoneErrorMessage(check.reason, next.country) : undefined,
    }));
  }

  function handlePhoneBlur() {
    const rule = (value: string) => {
      const check = validatePhone(value, phoneCountry);
      return check.ok ? undefined : phoneErrorMessage(check.reason, phoneCountry);
    };
    setErrors((current) => ({ ...current, phone: fieldError("blur", form.phone, rule, current.phone) }));
  }

  function handleMessageChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const textarea = event.target;
    const raw = textarea.value;
    const { text, removed } = filterPlainText(raw);
    if (removed) setMessageFiltered(true);
    updateField("message", text);
    if (text !== raw) {
      // Keep the caret where the visitor was typing instead of jumping to the end.
      const caret = filterPlainText(raw.slice(0, textarea.selectionStart ?? raw.length)).text.length;
      requestAnimationFrame(() => textarea.setSelectionRange(caret, caret));
    }
  }

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    // A success or server message goes on the first edit; the field summary stays and
    // follows the red fields (see showStatus below).
    if (editClearsStatus(status.type, status.message)) {
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
    if (field === "message") {
      setErrors((current) => ({ ...current, message: undefined }));
    }
    if (field === "privacyConsent") {
      setErrors((current) => ({ ...current, privacyConsent: undefined }));
    }
    setForm((current) => ({ ...current, [field]: value }));
  }

  // The field-summary line goes away once every field is valid.
  const showStatus =
    status.type !== "idle" && (status.type !== "error" || shouldShowBanner(status.message, errors));

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
            <form
              className={styles.form}
              data-clarity-mask="true"
              onSubmit={handleSubmit}
              onFocusCapture={turnstile.prepare}
              noValidate
            >
              <div className={styles.formGrid}>
                <FormInput
                  label="First Name*"
                  type="text"
                  value={form.firstName}
                  onChange={(event) => updateField("firstName", event.target.value)}
                  onBlur={() => handleNameBlur("firstName", "Enter your first name.")}
                  error={errors.firstName}
                  required
                  autoComplete="given-name"
                />

                <FormInput
                  label="Last Name*"
                  type="text"
                  value={form.lastName}
                  onChange={(event) => updateField("lastName", event.target.value)}
                  onBlur={() => handleNameBlur("lastName", "Enter your last name.")}
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
                  onBlur={handleEmailBlur}
                  placeholder={EMAIL_PLACEHOLDER}
                  inputMode="email"
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

                <PhoneField
                  variant="contact"
                  label="Contact Number*"
                  country={phoneCountry}
                  value={form.phone}
                  defaultCountry={geoCountry}
                  onChange={handlePhoneChange}
                  onBlur={handlePhoneBlur}
                  error={errors.phone}
                  required
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
                onChange={handleMessageChange}
                onBlur={() => setMessageFiltered(false)}
                error={errors.message}
                counter={formatCounter(form.message.length)}
                notice={messageFiltered ? MESSAGE_FILTER_NOTICE : undefined}
                maxLength={MESSAGE_MAX_LENGTH}
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

              {showStatus ? (
                <p
                  ref={statusRef}
                  tabIndex={-1}
                  // The field-summary line is polite: each field error already announces itself.
                  role={status.type === "error" && !isFieldSummary(status.message) ? "alert" : "status"}
                  className={`${styles.status} ${
                    status.type === "success" ? styles.statusSuccess : styles.statusError
                  }`}
                >
                  {status.mailLink ? (
                    <MailLinkedMessage
                      message={status.message}
                      address={CONTACT_EMAIL}
                      subject="Website contact form"
                    />
                  ) : (
                    status.message
                  )}
                </p>
              ) : null}

              {turnstile.enabled ? (
                <TurnstileSlot
                  containerRef={turnstile.containerRef}
                  interactive={turnstile.interactive}
                  checking={isChecking}
                  sending={isSubmitting}
                />
              ) : null}

              <AppButton 
                type="submit" 
                variant="primary" 
                size="lg" 
                disabled={!contactFormAvailable}
                aria-disabled={isSubmitting || isChecking || undefined}
                className={styles.submitButton}
              >
                {!contactFormAvailable
                  ? "Form Unavailable"
                  : isChecking
                    ? "Checking..."
                    : isSubmitting
                      ? "Sending..."
                      : "Submit"}
              </AppButton>
              {turnstile.enabled ? <TurnstileNotice /> : null}
            </form>
          </div>
        </div>
      </section>
  );
}
