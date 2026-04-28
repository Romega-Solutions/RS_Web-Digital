import { ComponentPropsWithoutRef, useId } from "react";

interface FormInputProps extends ComponentPropsWithoutRef<"input"> {
  label: string;
  error?: string;
}

export function FormInput({ label, error, className = "", ...props }: FormInputProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={`form-field ${className}`}>
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <input
        id={id}
        className={`form-input ${error ? "form-input--error" : ""}`}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && (
        <span id={errorId} className="form-error" aria-live="polite">
          {error}
        </span>
      )}
    </div>
  );
}

interface FormCheckboxProps extends ComponentPropsWithoutRef<"input"> {
  label: string;
}

export function FormCheckbox({ label, className = "", ...props }: FormCheckboxProps) {
  const id = useId();

  return (
    <div className={`form-checkbox-field ${className}`}>
      <input
        id={id}
        type="checkbox"
        className="form-checkbox"
        {...props}
      />
      <label htmlFor={id} className="form-checkbox-label">
        {label}
      </label>
    </div>
  );
}
