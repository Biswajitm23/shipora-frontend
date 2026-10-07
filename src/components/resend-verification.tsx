"use client";

import { useState, type FormEvent } from "react";

import { Field, FormError, fieldErrors } from "@/components/field";
import { Alert } from "@/components/states";
import { api } from "@/lib/api";

/** AUTH-003: ask for a new verification link (same answer whatever the email). */
export function ResendVerification({ email = "" }: { email?: string }) {
  const [error, setError] = useState<unknown>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    setSending(true);
    setError(null);
    try {
      const { detail } = await api.post<{ detail: string }>("/api/auth/resend-verification/", {
        email: value,
      });
      setSent(detail);
    } catch (err) {
      setError(err);
    } finally {
      setSending(false);
    }
  }

  if (sent) return <Alert tone="success">{sent}</Alert>;

  return (
    <form className="form resend-form" onSubmit={onSubmit} noValidate>
      <p className="form-note">Need a new verification link? We can send one to your email.</p>
      <FormError error={error} />
      <Field
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={email}
        required
        errors={fieldErrors(error, "email")}
      />
      <button type="submit" className="btn-outline" disabled={sending} aria-busy={sending}>
        {sending ? "Sending…" : "Send a new link"}
      </button>
    </form>
  );
}
