"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AppButton } from "@/components/atoms/Button";
import {
  APPLY_GENERIC_ERROR,
  MAX_RESUME_MB,
  RESUME_TOO_LARGE_MESSAGE,
  isResumeTooLarge,
  readApplyReply,
} from "@/lib/apply-upload";
import { applicationSubmitPath } from "@/lib/position-slug";
import styles from "./ApplyForm.module.css";

type Status = "idle" | "submitting" | "success" | "error";

export function ApplyForm({ positionId, jobTitle }: { positionId: number; jobTitle: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [appCode, setAppCode] = useState<string | null>(null);
  const [submittedName, setSubmittedName] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [fileTooLarge, setFileTooLarge] = useState(false);
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const fullName = String(data.get("fullName") ?? "").trim();
    if (!fullName) {
      setErrorMsg("Please enter your full name.");
      setStatus("error");
      return;
    }
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
          placeholder="Juan Dela Cruz"
          className={styles.control}
        />
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
            placeholder="you@example.com"
            className={styles.control}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="phone" className={styles.label}>
            Phone <span className={styles.required}>*</span>
          </label>
          <input
            id="phone"
            name="phone"
            required
            autoComplete="tel"
            placeholder="0917 555 1234"
            className={styles.control}
          />
        </div>
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

      {status === "error" && errorMsg && (
        <div className={styles.alert} role="alert">
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
