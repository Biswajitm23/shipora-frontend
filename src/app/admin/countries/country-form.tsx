"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Field, FormError, fieldErrors } from "@/components/field";
import { api } from "@/lib/api";

export type Country = {
  id: number;
  name: string;
  code: string;
  currency: string;
  currency_symbol: string;
  shipping_zone: string;
  tax_percentage: string;
  is_active: boolean;
};

/** CNTRY-001: add a country, or edit one when `country` is given. */
export function CountryForm({ country }: { country?: Country }) {
  const router = useRouter();
  const [error, setError] = useState<unknown>(null);
  const [submitting, setSubmitting] = useState(false);
  const editing = country !== undefined;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? "").trim();
    const input = {
      name: text("name"),
      code: text("code"),
      currency: text("currency"),
      currency_symbol: text("currency_symbol"),
      shipping_zone: text("shipping_zone"),
      tax_percentage: text("tax_percentage"),
      is_active: form.get("is_active") === "on",
    };
    setSubmitting(true);
    setError(null);
    try {
      const saved = editing
        ? await api.patch<Country>(`/api/countries/${country.id}/`, input)
        : await api.post<Country>("/api/countries/", input);
      const done = editing ? "updated" : "added";
      router.push(`/admin/countries?${done}=${encodeURIComponent(saved.name)}`);
    } catch (err) {
      setError(err);
      setSubmitting(false);
    }
  }

  const label = editing ? "Save changes" : "Add country";

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      <FormError error={error} />
      <Field
        label="Country name"
        name="name"
        required
        defaultValue={country?.name}
        errors={fieldErrors(error, "name")}
      />
      <div className="field-row">
        <Field
          label="Country code"
          name="code"
          required
          maxLength={3}
          placeholder="e.g. IN"
          defaultValue={country?.code}
          errors={fieldErrors(error, "code")}
        />
        <Field
          label="Shipping zone"
          name="shipping_zone"
          required
          placeholder="e.g. Asia"
          defaultValue={country?.shipping_zone}
          errors={fieldErrors(error, "shipping_zone")}
        />
      </div>
      <div className="field-row">
        <Field
          label="Currency"
          name="currency"
          required
          maxLength={3}
          placeholder="e.g. INR"
          defaultValue={country?.currency}
          errors={fieldErrors(error, "currency")}
        />
        <Field
          label="Currency symbol"
          name="currency_symbol"
          required
          maxLength={8}
          placeholder="e.g. ₹"
          defaultValue={country?.currency_symbol}
          errors={fieldErrors(error, "currency_symbol")}
        />
      </div>
      <Field
        label="Tax percentage"
        name="tax_percentage"
        type="number"
        inputMode="decimal"
        min={0}
        max={100}
        step="0.01"
        required
        defaultValue={country?.tax_percentage}
        errors={fieldErrors(error, "tax_percentage")}
      />
      <label className="check">
        <input type="checkbox" name="is_active" defaultChecked={country?.is_active ?? true} />
        <span>Active (can be chosen for new shipments)</span>
      </label>
      <button type="submit" className="btn-block" disabled={submitting} aria-busy={submitting}>
        {submitting ? "Saving…" : label}
      </button>
      <p className="form-footer">
        <Link href="/admin/countries">Back to Manage countries</Link>
      </p>
    </form>
  );
}
