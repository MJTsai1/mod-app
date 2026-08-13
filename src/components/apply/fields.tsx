"use client";

import { useId } from "react";

interface FieldWrapperProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}

export function FieldWrapper({ label, required, hint, error, htmlFor, children }: FieldWrapperProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="field-label">
        {label}
        {required && (
          <span className="ml-1 text-[var(--color-danger)]" aria-hidden>
            *
          </span>
        )}
        {!required && (
          <span className="ml-1.5 text-xs font-normal text-[var(--color-text-subtle)]">
            (optional)
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="field-hint">{hint}</p>
      ) : null}
    </div>
  );
}

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  hint?: string;
  error?: string;
  type?: "text" | "number";
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "text" | "numeric";
  maxLength?: number;
}

export function TextInput({
  label,
  value,
  onChange,
  required,
  hint,
  error,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
  maxLength,
}: TextInputProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <FieldWrapper label={label} required={required} hint={hint} error={error} htmlFor={id}>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        className="field-input"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
      />
    </FieldWrapper>
  );
}

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  hint?: string;
  error?: string;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}

export function TextArea({
  label,
  value,
  onChange,
  required,
  hint,
  error,
  placeholder,
  rows = 4,
  maxLength,
}: TextAreaProps) {
  const id = useId();

  return (
    <FieldWrapper label={label} required={required} hint={hint} error={error} htmlFor={id}>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className="field-input resize-y"
        aria-invalid={Boolean(error)}
      />
      {maxLength && (
        <p className="mt-1 text-right text-xs text-[var(--color-text-subtle)]">
          {value.length}/{maxLength}
        </p>
      )}
    </FieldWrapper>
  );
}

interface YesNoToggleProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  hint?: string;
  error?: string;
}

export function YesNoToggle({ label, value, onChange, hint, error }: YesNoToggleProps) {
  const id = useId();
  const name = `${id}-yesno`;

  return (
    <FieldWrapper label={label} required hint={hint} error={error} htmlFor={id}>
      <div className="flex gap-3" role="radiogroup" aria-labelledby={id}>
        {[
          { label: "Yes", val: true },
          { label: "No", val: false },
        ].map((option) => (
          <label
            key={option.label}
            className="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition"
            style={{
              borderColor:
                value === option.val ? "var(--color-accent)" : "var(--color-border-strong)",
              background: value === option.val ? "rgba(139,92,246,0.12)" : "var(--color-bg-elevated)",
            }}
          >
            <input
              type="radio"
              name={name}
              className="sr-only"
              checked={value === option.val}
              onChange={() => onChange(option.val)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </FieldWrapper>
  );
}

interface SelectInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
  hint?: string;
  error?: string;
  placeholder?: string;
}

export function SelectInput({
  label,
  value,
  onChange,
  options,
  required,
  hint,
  error,
  placeholder = "Select an option",
}: SelectInputProps) {
  const id = useId();

  return (
    <FieldWrapper label={label} required={required} hint={hint} error={error} htmlFor={id}>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="field-input"
        aria-invalid={Boolean(error)}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}
