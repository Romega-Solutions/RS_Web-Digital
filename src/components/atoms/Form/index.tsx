import { ComponentPropsWithoutRef, useId } from "react";
import styles from "./Form.module.css";

interface FormInputProps extends ComponentPropsWithoutRef<"input"> {
  label: string;
  error?: string;
}

export function FormInput({ label, error, className = "", ...props }: FormInputProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        className={[styles.control, error ? styles.controlError : ""].filter(Boolean).join(" ")}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && (
        <span id={errorId} className={styles.error} aria-live="polite">
          {error}
        </span>
      )}
    </div>
  );
}

interface FormSelectProps extends ComponentPropsWithoutRef<"select"> {
  label: string;
  error?: string;
}

export function FormSelect({ label, error, className = "", ...props }: FormSelectProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <select
        id={id}
        className={[styles.control, error ? styles.controlError : ""].filter(Boolean).join(" ")}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error ? (
        <span id={errorId} className={styles.error} aria-live="polite">
          {error}
        </span>
      ) : null}
    </div>
  );
}

interface FormTextareaProps extends ComponentPropsWithoutRef<"textarea"> {
  label: string;
  error?: string;
  /** Short text shown in the bottom-right corner, e.g. "12 / 2000". */
  counter?: string;
  /** A polite status line under the box, e.g. "Emoji and special symbols were removed." */
  notice?: string;
}

export function FormTextarea({
  label,
  error,
  counter,
  notice,
  className = "",
  ...props
}: FormTextareaProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const counterId = `${id}-counter`;
  const noticeId = `${id}-notice`;
  const describedBy =
    [error ? errorId : "", counter ? counterId : "", notice ? noticeId : ""]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.textareaWrap}>
        <textarea
          id={id}
          className={[
            styles.control,
            styles.textarea,
            counter ? styles.textareaWithCounter : "",
            error ? styles.controlError : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          {...props}
        />
        {counter ? (
          <span id={counterId} className={styles.counter}>
            {counter}
          </span>
        ) : null}
      </div>
      {notice ? (
        <span id={noticeId} className={styles.notice} role="status">
          {notice}
        </span>
      ) : null}
      {error ? (
        <span id={errorId} className={styles.error} aria-live="polite">
          {error}
        </span>
      ) : null}
    </div>
  );
}

interface FormCheckboxProps extends ComponentPropsWithoutRef<"input"> {
  label: string;
  error?: string;
}

export function FormCheckbox({ label, error, className = "", ...props }: FormCheckboxProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      <div className={styles.checkboxField}>
      <input
        id={id}
        type="checkbox"
        className={styles.checkbox}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      <label htmlFor={id} className={styles.checkboxLabel}>
        {label}
      </label>
      </div>
      {error ? (
        <span id={errorId} className={styles.error} aria-live="polite">
          {error}
        </span>
      ) : null}
    </div>
  );
}
