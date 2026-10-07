"use client";

import { useState, type FormEvent } from "react";

import { Field, FormError, fieldErrors } from "@/components/field";
import { Alert } from "@/components/states";
import { api, ApiError } from "@/lib/api";

type RegisterInput = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  password_confirm: string;
};

type RegisteredUser = { email: string };

export function RegisterForm() {
  const [error, setError] = useState<unknown>(null);
  const [submitting, setSubmitting] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? "").trim();
    const input: RegisterInput = {
      first_name: text("first_name"),
      last_name: text("last_name"),
      email: text("email"),
      phone: text("phone"),
      password: String(form.get("password") ?? ""),
      password_confirm: String(form.get("password_confirm") ?? ""),
    };
    if (input.password && input.password !== input.password_confirm) {
      setError(
        new ApiError("Passwords do not match.", 400, {
          password_confirm: ["Passwords do not match."],
        }),
      );
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const user = await api.post<RegisteredUser>("/api/auth/register/", input);
      setRegisteredEmail(user.email);
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }

  if (registeredEmail) {
    return (
      <Alert tone="success">
        <strong>Check your email.</strong> Your account has been created. We have sent a
        verification link to <strong>{registeredEmail}</strong>. Open it to verify your account
        before you start using Shipora.
      </Alert>
    );
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      <FormError error={error} />
      <div className="field-row">
        <Field
          label="First name"
          name="first_name"
          autoComplete="given-name"
          required
          errors={fieldErrors(error, "first_name")}
        />
        <Field
          label="Last name"
          name="last_name"
          autoComplete="family-name"
          required
          errors={fieldErrors(error, "last_name")}
        />
      </div>
      <Field
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        required
        errors={fieldErrors(error, "email")}
      />
      <Field
        label="Phone number"
        name="phone"
        type="tel"
        autoComplete="tel"
        required
        errors={fieldErrors(error, "phone")}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        errors={fieldErrors(error, "password")}
      />
      <Field
        label="Confirm password"
        name="password_confirm"
        type="password"
        autoComplete="new-password"
        required
        errors={fieldErrors(error, "password_confirm")}
      />
      <button type="submit" className="btn-block" disabled={submitting} aria-busy={submitting}>
        {submitting ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
