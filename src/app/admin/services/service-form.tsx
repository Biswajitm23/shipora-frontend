"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Field, FormError, fieldErrors } from "@/components/field";
import { api } from "@/lib/api";

export type Service = {
  id: number;
  name: string;
  description: string;
  estimated_delivery: string;
  weight_limit_kg: string;
  is_international: boolean;
  is_active: boolean;
};

/** SERV-001: create a service, or update one when `service` is given. */
export function ServiceForm({ service }: { service?: Service }) {
  const router = useRouter();
  const [error, setError] = useState<unknown>(null);
  const [submitting, setSubmitting] = useState(false);
  const editing = service !== undefined;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? "").trim();
    const input = {
      name: text("name"),
      description: text("description"),
      estimated_delivery: text("estimated_delivery"),
      weight_limit_kg: text("weight_limit_kg"),
      is_international: form.get("is_international") === "on",
      is_active: form.get("is_active") === "on",
    };
    setSubmitting(true);
    setError(null);
    try {
      const saved = editing
        ? await api.patch<Service>(`/api/services/${service.id}/`, input)
        : await api.post<Service>("/api/services/", input);
      const done = editing ? "updated" : "added";
      router.push(`/admin/services?${done}=${encodeURIComponent(saved.name)}`);
    } catch (err) {
      setError(err);
      setSubmitting(false);
    }
  }

  const descriptionErrors = fieldErrors(error, "description");

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      <FormError error={error} />
      <Field
        label="Service name"
        name="name"
        required
        defaultValue={service?.name}
        errors={fieldErrors(error, "name")}
      />
      <label className="field">
        <span>Description</span>
        <textarea
          name="description"
          rows={3}
          required
          defaultValue={service?.description}
          aria-invalid={descriptionErrors ? true : undefined}
          aria-describedby={descriptionErrors ? "description-error" : undefined}
        />
        {descriptionErrors && (
          <span id="description-error" className="field-error">
            {descriptionErrors.join(" ")}
          </span>
        )}
      </label>
      <div className="field-row">
        <Field
          label="Estimated delivery time"
          name="estimated_delivery"
          required
          placeholder="e.g. 3-5 business days"
          defaultValue={service?.estimated_delivery}
          errors={fieldErrors(error, "estimated_delivery")}
        />
        <Field
          label="Weight limit (kg)"
          name="weight_limit_kg"
          type="number"
          inputMode="decimal"
          min={0.01}
          step="0.01"
          required
          defaultValue={service?.weight_limit_kg}
          errors={fieldErrors(error, "weight_limit_kg")}
        />
      </div>
      <label className="check">
        <input
          type="checkbox"
          name="is_international"
          defaultChecked={service?.is_international ?? false}
        />
        <span>Available for international shipments</span>
      </label>
      <label className="check">
        <input type="checkbox" name="is_active" defaultChecked={service?.is_active ?? true} />
        <span>Available to customers</span>
      </label>
      <button type="submit" className="btn-block" disabled={submitting} aria-busy={submitting}>
        {submitting ? "Saving…" : editing ? "Save changes" : "Add service"}
      </button>
      <p className="form-footer">
        <Link href="/admin/services">Back to Manage services</Link>
      </p>
    </form>
  );
}
