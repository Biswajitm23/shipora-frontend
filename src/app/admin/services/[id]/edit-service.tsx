"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/page-header";
import { Alert, Loading } from "@/components/states";
import { api, ApiError } from "@/lib/api";

import { ServiceForm, type Service } from "../service-form";

export function EditService() {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<Service>(`/api/services/${id}/`)
      .then((data) => {
        if (!cancelled) setService(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError && err.status === 404
            ? "This service could not be found."
            : "Something went wrong. Please try again.",
        );
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <main className="narrow">
      <PageHeader
        title={service ? `Edit ${service.name}` : "Edit service"}
        lead="Update the service information."
      />
      {error ? (
        <>
          <Alert tone="error">{error}</Alert>
          <Link href="/admin/services">Back to Manage services</Link>
        </>
      ) : service === null ? (
        <Loading label="Loading service…" />
      ) : (
        <div className="card">
          <ServiceForm service={service} />
        </div>
      )}
    </main>
  );
}
