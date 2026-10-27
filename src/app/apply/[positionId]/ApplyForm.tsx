"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AppButton } from "@/components/atoms/Button";
import { PhoneField } from "@/components/molecules/forms/PhoneField";
import {
  APPLY_GENERIC_ERROR,
  MAX_RESUME_MB,
  RESUME_TOO_LARGE_MESSAGE,
  isResumeTooLarge,
  readApplyReply,
} from "@/lib/apply-upload";
import {
  EMAIL_INVALID_MESSAGE,
  EMAIL_PLACEHOLDER,
  EMAIL_REQUIRED_MESSAGE,
  isValidEmail,
} from "@/lib/form/email";
import type { CountryCode } from "@/lib/form/countries";
import { FIELD_ERRORS_MESSAGE, isFieldSummary, shouldShowBanner } from "@/lib/form/field-errors";
import { smartName } from "@/lib/form/name";
import { phoneErrorMessage, validatePhone } from "@/lib/form/phone";
import { applicationSubmitPath } from "@/lib/position-slug";
import styles from "./ApplyForm.module.css";

type Status = "idle" | "submitting" | "success" | "error";
type FieldErrors = Partial<Record<"fullName" | "email" | "phone", string>>;


function nameError(value: string): string | undefined {
  return value.trim() ? undefined : "Enter your full name.";
}

function emailError(value: string): string | undefined {
  const email = value.trim();
  if (!email) return EMAIL_REQUIRED_MESSAGE;
  return isValidEmail(email) ? undefined : EMAIL_INVALID_MESSAGE;
}

function phoneError(value: string, country: CountryCode): string | undefined {
  const check = validatePhone(value, country);
  return check.ok ? undefined : phoneErrorMessage(check.reason, country);
}

export function ApplyForm({
  positionId,
  jobTitle,
  defaultCountry,
}: {
  positionId: number;
  jobTitle: string;
  defaultCountry: CountryCode;
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
  const loadedAtRef = useRef(0);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    loadedAtRef.current = Date.now();
  }, []);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setFileName("");
      setFileError("");
      setFileTooLarge(false);
      return;
    }
    setFileTooLarge(false);
    if (file.type !== "application/pdf") {
      setFileError("Resume must be a PDF file.");
      setFileName(file.name);
      return;
    }
    if (isResumeTooLarge(file.size)) {
      setFileError("");
      setFileTooLarge(true);
      setFileName(file.name);
      return;
    }
    setFileError("");
    setFileName(file.name);
  }

  function setFieldError(field: keyof FieldErrors, message: string | undefined) {
    setFieldErrors((current) => ({ ...current, [field]: message }));
  }

  function handleNameBlur(event: React.FocusEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    input.value = smartName(input.value);
    setFieldError("fullName", nameError(input.value));
  }

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (fieldErrors.fullName && !nameError(event.target.value)) setFieldError("fullName", undefined);
  }

  function handleEmailBlur(event: React.FocusEvent<HTMLInputElement>) {
    setFieldError("email", emailError(event.currentTarget.value));
  }

  function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (fieldErrors.email && !emailError(event.target.value)) setFieldError("email", undefined);
  }

  function handlePhoneChange(next: { country: CountryCode; value: string }) {
    setPhoneCountry(next.country);
    setPhoneValue(next.value);
    const check = validatePhone(next.value, next.country);
    if (check.ok) {
      setFieldError("phone", undefined);
    } else if (check.reason === "chars" || fieldErrors.phone) {
      // Letters or symbols turn red straight away; a short number waits for blur or submit.
      setFieldError("phone", phoneErrorMessage(check.reason, next.country));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const fullName = smartName(String(data.get("fullName") ?? ""));
    const email = String(data.get("email") ?? "").trim();
    const nextErrors: FieldErrors = {
      fullName: nameError(fullName),
      email: emailError(email),
      phone: phoneError(phoneValue, phoneCountry),
    };
    if (nextErrors.fullName || nextErrors.email || nextErrors.phone) {
      setFieldErrors(nextErrors);
      setErrorMsg(FIELD_ERRORS_MESSAGE);
      setStatus("error");
      requestAnimationFrame(() => {
        form
          .querySelector<HTMLElement>('input:not([type="file"]):not([type="hidden"])[aria-invalid="true"]')
          ?.focus();
      });
      return;
    }
    setFieldErrors({});
    const phone = validatePhone(phoneValue, phoneCountry);
    data.set("fullName", fullName);
    data.set("email", email);
    if (phone.ok) data.set("phone", phone.e164);

    const resume = data.get("resume");
    if (!(resume instanceof File) || resume.size === 0) {
      setFileError("Please attach your resume.");
      setErrorMsg("Please attach your resume.");
      setStatus("error");
      return;
    }
    if (fileTooLarge || isResumeTooLarge(resume.size)) {
      // The red drop box and the note below it already explain this; nothing is sent.
      setFileTooLarge(true);
      setFileName(resume.name);
      return;
    }
    if (fileError) {
      setErrorMsg(fileError);
      setStatus("error");
      return;
    }

    data.set("loadedAt", String(loadedAtRef.current));
    setSubmittedName(fullName);
    setStatus("submitting");
    setErrorMsg("");

    try {
      const response = await fetch(applicationSubmitPath(positionId), {
        method: "POST",
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
        setStatus("error");
      }
    } catch {
      setErrorMsg(APPLY_GENERIC_ERROR);
      setStatus("error");
    }
  }

  if (status === "success") {
    const firstName = submittedName.split(" ")[0];
    return (
      <div className={styles.success} role="status" aria-live="polite">
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
  const showBanner = status === "error" && shouldShowBanner(errorMsg, fieldErrors);

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={styles.form} noValidate>
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
          onBlur={() => setFieldError("phone", phoneError(phoneValue, phoneCountry))}
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
          className={`${styles.dropzone} ${fileTooLarge ? styles.dropzoneInvalid : ""}`}
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
          aria-invalid={fileTooLarge || Boolean(fileError)}
          aria-describedby={fileTooLarge ? "resume-too-large" : undefined}
          className={styles.fileInput}
        />
        {fileTooLarge && (
          <span id="resume-too-large" className={styles.fileTooLarge} role="alert">
            {RESUME_TOO_LARGE_MESSAGE}
          </span>
        )}
        {fileError && <span className={styles.error}>{fileError}</span>}
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
        <div className={styles.alert} role={summary ? "status" : "alert"}>
          {errorMsg}
        </div>
      )}

      <AppButton type="submit" variant="primary" size="lg" disabled={status === "submitting"}>
        {status === "submitting" ? "Submitting…" : "Submit application"}
      </AppButton>

      <p className={styles.terms}>
        By submitting, you agree to be contacted by Romega Solutions about this role.
      </p>
    </form>
  );
}
