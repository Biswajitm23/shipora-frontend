import type { InputHTMLAttributes } from "react";

import { ApiError } from "@/lib/api";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  errors?: string[];
};

export function Field({ label, name, errors, ...input }: FieldProps) {
  const errorId = `${name}-error`;
  return (
    <label className="field">
      <span>{label}</span>
      <input
        name={name}
        aria-invalid={errors ? true : undefined}
        aria-describedby={errors ? errorId : undefined}
        {...input}
      />
      {errors && (
        <span id={errorId} className="field-error">
          {errors.join(" ")}
        </span>
      )}
    </label>
  );
}

/** Top-of-form message: the server's own message, or a pointer to the field errors. */
export function FormError({ error }: { error: unknown }) {
  if (!error) return null;
  let message = "Something went wrong. Please try again.";
  if (error instanceof ApiError) {
    message = Object.keys(error.fieldErrors).length
      ? "Please correct the highlighted details."
      : error.message;
  }
  return (
    <div role="alert" className="alert alert-error">
      {message}
    </div>
  );
}

export function fieldErrors(error: unknown, field: string): string[] | undefined {
  return error instanceof ApiError ? error.fieldErrors[field] : undefined;
}
