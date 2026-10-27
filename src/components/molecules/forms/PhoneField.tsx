"use client";

import {
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  type ChangeEvent,
  type ReactNode,
} from "react";
import {
  countryOptions,
  toCountryOption,
  type CountryCode,
} from "@/lib/form/countries";
import { formatPhoneInput, validatePhone } from "@/lib/form/phone";
import styles from "./PhoneField.module.css";

export type PhoneFieldChange = { country: CountryCode; value: string };

type PhoneFieldProps = {
  label: ReactNode;
  /** Name of the hidden input that carries the E.164 number (empty when not valid yet). */
  name?: string;
  country: CountryCode;
  /** What the visitor sees in the number box (national format). */
  value: string;
  /** Listed first in the country picker, above the A-Z list. */
  defaultCountry: CountryCode;
  onChange: (next: PhoneFieldChange) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  variant?: "apply" | "contact";
};

const DIVIDER = "──────────";

function digitsBefore(text: string, caret: number): number {
  return text.slice(0, caret).replace(/\D/g, "").length;
}

function caretAfterDigits(text: string, digitCount: number): number {
  if (digitCount <= 0) return 0;
  let seen = 0;
  for (let index = 0; index < text.length; index += 1) {
    if (/\d/.test(text[index])) seen += 1;
    if (seen === digitCount) return index + 1;
  }
  return text.length;
}

export function PhoneField({
  label,
  name,
  country,
  value,
  defaultCountry,
  onChange,
  onBlur,
  error,
  required,
  disabled,
  variant = "apply",
}: PhoneFieldProps) {
  const id = useId();
  const inputId = `${id}-phone`;
  const errorId = `${id}-error`;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pendingCaretDigits = useRef<number | null>(null);
  const isContact = variant === "contact";

  const selected = useMemo(() => toCountryOption(country), [country]);
  const first = useMemo(() => toCountryOption(defaultCountry), [defaultCountry]);
  const all = useMemo(() => countryOptions(), []);

  const check = validatePhone(value, country);
  const e164 = check.ok ? check.e164 : "";

  // Put the caret back after the formatter adds spaces, counted in digits.
  useLayoutEffect(() => {
    const input = inputRef.current;
    const digits = pendingCaretDigits.current;
    pendingCaretDigits.current = null;
    if (!input || digits === null || document.activeElement !== input) return;
    const position = caretAfterDigits(input.value, digits);
    input.setSelectionRange(position, position);
  }, [value]);

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value;
    const caret = event.target.selectionStart ?? raw.length;
    const next = formatPhoneInput(raw, country);
    pendingCaretDigits.current = digitsBefore(raw, caret);
    onChange(next);
  }

  function handleCountry(event: ChangeEvent<HTMLSelectElement>) {
    const nextCountry = event.target.value as CountryCode;
    // Re-read the digits already typed under the new country.
    onChange({ country: nextCountry, value: formatPhoneInput(value, nextCountry).value });
  }

  const boxClass = [
    styles.box,
    isContact ? styles.boxContact : styles.boxApply,
    error ? styles.boxInvalid : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`${styles.field} ${isContact ? styles.fieldContact : styles.fieldApply}`}>
      <label htmlFor={inputId} className={isContact ? styles.labelContact : styles.labelApply}>
        {label}
      </label>
      <div className={boxClass}>
        <span className={`${styles.country} ${styles.countryFocus}`}>
          <span className={styles.flag} aria-hidden="true" suppressHydrationWarning>
            {selected.flag}
          </span>
          <span aria-hidden="true">(+{selected.callingCode})</span>
          <svg className={styles.chevron} viewBox="0 0 10 6" aria-hidden="true">
            <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <select
            className={styles.select}
            aria-label="Country calling code"
            value={country}
            onChange={handleCountry}
            disabled={disabled}
          >
            <option value={first.code} suppressHydrationWarning>
              {first.label}
            </option>
            <option disabled value="">
              {DIVIDER}
            </option>
            {all.map((option) => (
              <option key={option.code} value={option.code} suppressHydrationWarning>
                {option.label}
              </option>
            ))}
          </select>
        </span>
        <input
          ref={inputRef}
          id={inputId}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          className={`${styles.input} ${isContact ? styles.inputContact : styles.inputApply}`}
          value={value}
          onChange={handleInput}
          onBlur={onBlur}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          placeholder={country === "PH" ? "917 555 1234" : undefined}
        />
      </div>
      {name ? <input type="hidden" name={name} value={e164} /> : null}
      {error ? (
        <span
          id={errorId}
          className={isContact ? styles.errorContact : styles.error}
          aria-live="polite"
        >
          {error}
        </span>
      ) : null}
    </div>
  );
}
