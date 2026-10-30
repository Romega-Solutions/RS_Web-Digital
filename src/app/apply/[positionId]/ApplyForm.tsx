"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AppButton } from "@/components/atoms/Button";
import { PhoneField } from "@/components/molecules/forms/PhoneField";
import {
  MailLinkedMessage,
  TurnstileNotice,
  TurnstileSlot,
} from "@/components/molecules/forms/TurnstileCheck";
import { useTurnstile } from "@/components/molecules/forms/useTurnstile";
import {
  APPLY_GENERIC_ERROR,
  HR_EMAIL,
  MAX_RESUME_MB,
  RESUME_TOO_LARGE_MESSAGE,
  readApplyReply,
} from "@/lib/apply-upload";
import { EMAIL_PLACEHOLDER } from "@/lib/form/email";
import {
  applySubmitErrors,
  emailError,
  hasApplyErrors,
  nameError,
  phoneError,
  resumeMessage,
  resumeProblem,
} from "@/lib/form/apply-submit";
import type { CountryCode } from "@/lib/form/countries";
import { FIELD_ERRORS_MESSAGE, isFieldSummary, shouldShowBanner } from "@/lib/form/field-errors";
import { fieldError } from "@/lib/form/field-state";
import { smartName } from "@/lib/form/name";
import { phoneErrorMessage, validatePhone } from "@/lib/form/phone";
import { applicationSubmitPath } from "@/lib/position-slug";
import { browserCaptchaMessage } from "@/lib/turnstile/messages";
import { TURNSTILE_ACTIONS, TURNSTILE_TOKEN_HEADER } from "@/lib/turnstile/shared";
import styles from "./ApplyForm.module.css";

type Status = "idle" | "submitting" | "success" | "error";
type FieldErrors = Partial<Record<"fullName" | "email" | "phone", string>>;

// Red only while a field's current value is wrong: see lib/form/field-state.

export function ApplyForm({
  positionId,
  jobTitle,
  defaultCountry,
  turnstileSiteKey,
}: {
  positionId: number;
  jobTitle: string;
  defaultCountry: CountryCode;
  // Empty while the security check is switched off.
  turnstileSiteKey: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [appCode, setAppCode] = useState<string | null>(null);
  const [submittedName, setSubmittedName] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [fileTooLarge, setFileTooLarge] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [phoneCountry, setPhoneCountry] = useState<CountryCode>(defaultCountry);
  const [phoneValue, setPhoneValue] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  // True when the message is about the security check, so it carries the email-us link.
  const [mailLink, setMailLink] = useState(false);
  const turnstile = useTurnstile({ siteKey: turnstileSiteKey, action: TURNSTILE_ACTIONS.apply });
  const loadedAtRef = useRef(0);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    loadedAtRef.current = Date.now();
  }, []);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // A red resume (missing, wrong type, too large) is re-judged on every change; the
    // summary line follows the red fields (shouldShowBanner), so nothing stale is left over.
    if (!file) {
      setFileName("");
      setFileError("");
      setFileTooLarge(false);
      return;
    }
    const problem = resumeProblem(file);
    setFileTooLarge(problem === "too-large");
    setFileError(resumeMessage(problem));
    setFileName(file.name);
  }

  function setFieldError(field: keyof FieldErrors, message: string | undefined) {
    setFieldErrors((current) => ({ ...current, [field]: message }));
  }

  function handleNameBlur(event: React.FocusEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    input.value = smartName(input.value);
    setFieldError("fullName", fieldError("blur", input.value, nameError, fieldErrors.fullName));
  }

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (fieldErrors.fullName) setFieldError("fullName", fieldError("edit", event.target.value, nameError));
  }

  function handleEmailBlur(event: React.FocusEvent<HTMLInputElement>) {
    setFieldError("email", fieldError("blur", event.currentTarget.value, emailError, fieldErrors.email));
  }

  function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (fieldErrors.email) setFieldError("email", fieldError("edit", event.target.value, emailError));
  }

  function handlePhoneChange(next: { country: CountryCode; value: string }) {
    setPhoneCountry(next.country);
    setPhoneValue(next.value);
    const check = validatePhone(next.value, next.country);
    // Letters or symbols that got in (a paste) are wrong content, so they are red straight away.
    // Anything else clears the red; a short number is judged again on blur or submit.
    setFieldError(
      "phone",
      !check.ok && check.reason === "chars" ? phoneErrorMessage(check.reason, next.country) : undefined,
    );
  }

  function handlePhoneBlur() {
    setFieldError("phone", fieldError("blur", phoneValue, (value) => phoneError(value, phoneCountry), fieldErrors.phone));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // The button looks disabled while a check or send is under way, but Enter in a
    // field still submits the form, so the guard lives here too.
    if (status === "submitting" || isChecking) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const fullName = smartName(String(data.get("fullName") ?? ""));
    const email = String(data.get("email") ?? "").trim();
    const resume = data.get("resume");
    const resumeFile = resume instanceof File ? resume : null;
    // One pass over every field, the resume included, so all that is wrong turns red together.
    const result = applySubmitErrors({
      fullName,
      email,
      phone: phoneValue,
      phoneCountry,
      resume: resumeFile,
    });
    setMailLink(false);
    setFieldErrors({ fullName: result.fullName, email: result.email, phone: result.phone });
    setFileTooLarge(result.resume === "too-large");
    setFileError(resumeMessage(result.resume));
    if (resumeFile && resumeFile.size > 0) setFileName(resumeFile.name);
    if (hasApplyErrors(result)) {
      setErrorMsg(FIELD_ERRORS_MESSAGE);
      setStatus("error");
      requestAnimationFrame(() => {
        (
          form.querySelector<HTMLElement>('input:not([type="file"]):not([type="hidden"])[aria-invalid="true"]') ??
          form.querySelector<HTMLElement>('input[type="file"][aria-invalid="true"]')
        )?.focus();
      });
      return;
    }
    const phone = validatePhone(phoneValue, phoneCountry);
    data.set("fullName", fullName);
    data.set("email", email);
    if (phone.ok) data.set("phone", phone.e164);

    data.set("loadedAt", String(loadedAtRef.current));
    setSubmittedName(fullName);
    setStatus("submitting");
    setErrorMsg("");

    try {
      // The security check runs only now, after every field passed, so a form that
      // is still red never starts one.
      let captchaToken = "";
      if (turnstile.enabled) {
        setIsChecking(true);
        const check = await turnstile.check();
        setIsChecking(false);
        if (!check.ok) {
          setErrorMsg(browserCaptchaMessage("apply", check.reason));
          setMailLink(true);
          setStatus("error");
          return;
        }
        captchaToken = check.token;
      }

      // No Content-Type here: the browser adds the multipart boundary itself.
      const response = await fetch(applicationSubmitPath(positionId), {
        method: "POST",
        headers: captchaToken ? { [TURNSTILE_TOKEN_HEADER]: captchaToken } : undefined,
        body: data,
      });
      const result = await readApplyReply(response);
      if (result.ok) {
        setAppCode(result.applicationCode);
        setStatus("success");
        form.reset();
        setFileName("");
        setPhoneValue("");
      } else {
        setErrorMsg(result.message);
        setMailLink(result.code !== undefined);
        setStatus("error");
      }
    } catch {
      setErrorMsg(APPLY_GENERIC_ERROR);
      setStatus("error");
    } finally {
      setIsChecking(false);
    }
  }

  if (status === "success") {
    const firstName = submittedName.split(" ")[0];
    return (
      <div
        className={styles.success}
        role="status"
        aria-live="polite"
        data-clarity-mask="true"
      >
        <h3 className={styles.successTitle}>Thanks{firstName ? `, ${firstName}` : ""}!</h3>
        <p className={styles.successBody}>
          Your application for <strong>{jobTitle}</strong> has been received.
          {appCode && (
            <>
              {" "}Your application code is{" "}
              <span className={styles.code}>{appCode}</span>.
            </>
          )}
        </p>
        <p className={styles.successMeta}>
          We&apos;ve sent a confirmation email. Our recruitment team will review your application
          and reach out within 5–7 business days.
        </p>
      </div>
    );
  }

  const summary = isFieldSummary(errorMsg);
  // The resume is one of the fields the summary follows.
  const resumeRed = fileTooLarge || Boolean(fileError);
  const showBanner =
    status === "error" &&
    shouldShowBanner(errorMsg, { ...fieldErrors, resume: resumeRed ? "x" : undefined });

  return (
    <form
      ref={formRef}
      data-clarity-mask="true"
      onSubmit={handleSubmit}
      onFocusCapture={turnstile.prepare}
      className={styles.form}
      noValidate
    >
      {/* Honeypot — hidden from humans; bots tend to fill every field. */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="company_website">Company website (leave blank)</label>
        <input
          id="company_website"
          name="company_website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="fullName" className={styles.label}>
          Full name <span className={styles.required}>*</span>
        </label>
        <input
          id="fullName"
          name="fullName"
          required
          autoComplete="name"
          placeholder="Juan dela Cruz"
          onBlur={handleNameBlur}
          onChange={handleNameChange}
          aria-invalid={Boolean(fieldErrors.fullName)}
          aria-describedby={fieldErrors.fullName ? "fullName-error" : undefined}
          className={`${styles.control} ${fieldErrors.fullName ? styles.controlInvalid : ""}`}
        />
        {fieldErrors.fullName && (
          <span id="fullName-error" className={styles.error} role="alert">
            {fieldErrors.fullName}
          </span>
        )}
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>
            Email <span className={styles.required}>*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder={EMAIL_PLACEHOLDER}
            onBlur={handleEmailBlur}
            onChange={handleEmailChange}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            className={`${styles.control} ${fieldErrors.email ? styles.controlInvalid : ""}`}
          />
          {fieldErrors.email && (
            <span id="email-error" className={styles.error} role="alert">
              {fieldErrors.email}
            </span>
          )}
        </div>
        <PhoneField
          label={
            <>
              Phone <span className={styles.required}>*</span>
            </>
          }
          name="phone"
          country={phoneCountry}
          value={phoneValue}
          defaultCountry={defaultCountry}
          onChange={handlePhoneChange}
          onBlur={handlePhoneBlur}
          error={fieldErrors.phone}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="linkedinUrl" className={styles.label}>
          LinkedIn (optional)
        </label>
        <input
          id="linkedinUrl"
          name="linkedinUrl"
          type="url"
          placeholder="https://linkedin.com/in/…"
          className={styles.control}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="resume" className={styles.label}>
          Resume (PDF, max {MAX_RESUME_MB} MB) <span className={styles.required}>*</span>
        </label>
        <label
          htmlFor="resume"
          className={`${styles.dropzone} ${resumeRed ? styles.dropzoneInvalid : ""}`}
        >
          <span aria-hidden="true">📄</span>
          {fileName ? <span className={styles.fileName}>{fileName}</span> : "Click to upload PDF"}
        </label>
        <input
          id="resume"
          name="resume"
          type="file"
          accept="application/pdf,.pdf"
          required
          onChange={handleFileChange}
          aria-invalid={resumeRed}
          aria-describedby={fileTooLarge ? "resume-too-large" : fileError ? "resume-error" : undefined}
          className={styles.fileInput}
        />
        {fileTooLarge && (
          <span id="resume-too-large" className={styles.fileTooLarge} role="alert">
            {RESUME_TOO_LARGE_MESSAGE}
          </span>
        )}
        {fileError && (
          <span id="resume-error" className={styles.error} role="alert">
            {fileError}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="message" className={styles.label}>
          Anything else we should know? (optional)
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Why this role, availability, salary expectations…"
          className={`${styles.control} ${styles.textarea}`}
        />
      </div>

      {showBanner && (
        // The field-summary line is polite: each field error already announces itself.
        <div
          className={styles.alert}
          role={summary ? "status" : "alert"}
          data-clarity-mask="true"
        >
          {mailLink ? (
            <MailLinkedMessage
              message={errorMsg}
              address={HR_EMAIL}
              subject={`Application: ${jobTitle}`}
            />
          ) : (
            errorMsg
          )}
        </div>
      )}

      {turnstile.enabled ? (
        <TurnstileSlot
          containerRef={turnstile.containerRef}
          interactive={turnstile.interactive}
          checking={isChecking}
          sending={status === "submitting" && !isChecking}
        />
      ) : null}

      <AppButton
        type="submit"
        variant="primary"
        size="lg"
        aria-disabled={status === "submitting" || isChecking || undefined}
      >
        {isChecking ? "Checking…" : status === "submitting" ? "Submitting…" : "Submit application"}
      </AppButton>
      {turnstile.enabled ? <TurnstileNotice className={styles.turnstileNotice} /> : null}

      <p className={styles.terms}>
        By submitting, you agree to be contacted by Romega Solutions about this role.
      </p>
    </form>
  );
}
