"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/page-header";
import { Alert, Loading } from "@/components/states";
import { api, ApiError } from "@/lib/api";

import { CountryForm, type Country } from "../country-form";

export function EditCountry() {
  const { id } = useParams<{ id: string }>();
  const [country, setCountry] = useState<Country | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<Country>(`/api/countries/${id}/`)
      .then((data) => {
        if (!cancelled) setCountry(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError && err.status === 404
            ? "This country could not be found."
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
        title={country ? `Edit ${country.name}` : "Edit country"}
        lead="Update the country information."
      />
      {error ? (
        <>
          <Alert tone="error">{error}</Alert>
          <Link href="/admin/countries">Back to Manage countries</Link>
        </>
      ) : country === null ? (
        <Loading label="Loading country…" />
      ) : (
        <div className="card">
          <CountryForm country={country} />
        </div>
      )}
    </main>
  );
}
