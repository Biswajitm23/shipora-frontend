"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { Field, FormError, fieldErrors } from "@/components/field";
import { AREA_PATHS, safeNextPath, useAuth } from "@/lib/auth";

/** The one login page for every account type; each lands in its own area. */
export function LoginForm() {
  const auth = useAuth();
  const router = useRouter();
  const next = safeNextPath(useSearchParams().get("next"));
  const [error, setError] = useState<unknown>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already logged in (or just logged in): go on to ?next= or the user's own area.
  useEffect(() => {
    if (auth.status === "authenticated") {
      router.replace(next ?? AREA_PATHS[auth.user.role]);
    }
  }, [auth, next, router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setError(null);
    try {
      await auth.login(String(form.get("email") ?? "").trim(), String(form.get("password") ?? ""));
    } catch (err) {
      setError(err);
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      <FormError error={error} />
      <Field
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        required
        errors={fieldErrors(error, "email")}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        errors={fieldErrors(error, "password")}
      />
      <button type="submit" className="btn-block" disabled={submitting} aria-busy={submitting}>
        {submitting ? "Logging in…" : "Log in"}
      </button>
      <p className="form-footer">
        New to Shipora? <Link href="/register">Create an account</Link>
      </p>
    </form>
  );
}
