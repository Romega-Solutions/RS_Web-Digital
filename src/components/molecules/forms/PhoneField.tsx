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
import { caretAfterDigits, digitsBefore, resolvePhoneEdit } from "@/lib/form/phone-caret";
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
  // Where the caret goes after the next render: after N digits, or at a fixed position.
  const pendingCaret = useRef<{ digits: number } | { position: number } | null>(null);
  const isContact = variant === "contact";

  const selected = useMemo(() => toCountryOption(country), [country]);
  const first = useMemo(() => toCountryOption(defaultCountry), [defaultCountry]);
  // The default country is listed once, at the top.
  const rest = useMemo(
    () => countryOptions().filter((option) => option.code !== defaultCountry),
    [defaultCountry],
  );

  const check = validatePhone(value, country);
  const e164 = check.ok ? check.e164 : "";

  function placeCaret() {
    const input = inputRef.current;
    const pending = pendingCaret.current;
    pendingCaret.current = null;
    if (!input || !pending || document.activeElement !== input) return;
    const position = "digits" in pending ? caretAfterDigits(input.value, pending.digits) : pending.position;
    input.setSelectionRange(position, position);
  }

  // When the text changed, put the caret back right after the formatter ran.
  useLayoutEffect(placeCaret, [value]);

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    const native = event.nativeEvent as InputEvent;
    const edit = resolvePhoneEdit({
      previous: value,
      raw: event.target.value,
      caret: event.target.selectionStart ?? event.target.value.length,
      inputType: native.inputType,
      data: native.data,
    });

    if (edit.rejected) {
      // Nothing changes, so React has no new render to hook into: set the caret next frame.
      pendingCaret.current = { position: edit.caret };
      requestAnimationFrame(placeCaret);
      return;
    }

    const next = formatPhoneInput(edit.raw, country);
    // Text with letters or symbols is kept as typed, so the raw caret is still right.
    pendingCaret.current =
      next.value === edit.raw ? { position: edit.caret } : { digits: digitsBefore(edit.raw, edit.caret) };
    onChange(next);
    // The text may come out the same as before (e.g. a space deleted and put back): still place the caret.
    requestAnimationFrame(placeCaret);
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
            {rest.map((option) => (
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
          role="alert"
        >
          {error}
        </span>
      ) : null}
    </div>
  );
}
