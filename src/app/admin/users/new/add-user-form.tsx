"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Field, FormError, fieldErrors } from "@/components/field";
import { api, ApiError } from "@/lib/api";
import { AREA_NAMES, type Role } from "@/lib/auth";

const ROLES = Object.keys(AREA_NAMES) as Role[];

type NewUser = { first_name: string; last_name: string };

/** ROLE-001: the Admin adds an account of any type; it can log in straight away. */
export function AddUserForm() {
  const router = useRouter();
  const [error, setError] = useState<unknown>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? "").trim();
    const input = {
      first_name: text("first_name"),
      last_name: text("last_name"),
      email: text("email"),
      phone: text("phone"),
      role: text("role"),
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
      const user = await api.post<NewUser>("/api/users/", input);
      const name = `${user.first_name} ${user.last_name}`.trim();
      router.push(`/admin/users?added=${encodeURIComponent(name)}`);
    } catch (err) {
      setError(err);
      setSubmitting(false);
    }
  }

  const roleErrors = fieldErrors(error, "role");

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      <FormError error={error} />
      <div className="field-row">
        <Field label="First name" name="first_name" required errors={fieldErrors(error, "first_name")} />
        <Field label="Last name" name="last_name" required errors={fieldErrors(error, "last_name")} />
      </div>
      <Field
        label="Email address"
        name="email"
        type="email"
        autoComplete="off"
        required
        errors={fieldErrors(error, "email")}
      />
      <Field label="Phone number" name="phone" type="tel" required errors={fieldErrors(error, "phone")} />
      <label className="field">
        <span>Account type</span>
        <select
          name="role"
          defaultValue=""
          required
          aria-invalid={roleErrors ? true : undefined}
          aria-describedby={roleErrors ? "role-error" : undefined}
        >
          <option value="" disabled>
            Choose an account type
          </option>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {AREA_NAMES[role]}
            </option>
          ))}
        </select>
        {roleErrors && (
          <span id="role-error" className="field-error">
            {roleErrors.join(" ")}
          </span>
        )}
      </label>
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
        {submitting ? "Adding user…" : "Add user"}
      </button>
      <p className="form-footer">
        <Link href="/admin/users">Back to Manage users</Link>
      </p>
    </form>
  );
}
