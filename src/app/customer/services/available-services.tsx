"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/page-header";
import { Alert, Loading } from "@/components/states";
import { api, ApiError } from "@/lib/api";

type AvailableService = {
  id: number;
  name: string;
  description: string;
  estimated_delivery: string;
  weight_limit_kg: string;
  is_international: boolean;
};

/** SERV-001: the services a customer can use now, each with its limitations. */
export function AvailableServices() {
  const [services, setServices] = useState<AvailableService[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<AvailableService[]>("/api/services/available/")
      .then((data) => {
        if (!cancelled) setServices(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
        );
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main>
      <PageHeader
        title="Our services"
        lead="The delivery services you can use right now, with their delivery time and limits."
      />
      {error ? (
        <Alert tone="error">{error}</Alert>
      ) : services === null ? (
        <Loading label="Loading services…" />
      ) : services.length === 0 ? (
        <div className="empty-state">
          <h2>No services available</h2>
          <p>There are no delivery services available at the moment. Please check again later.</p>
        </div>
      ) : (
        <div className="service-grid">
          {services.map((service) => (
            <article key={service.id} className="card service-card">
              <h2>{service.name}</h2>
              <p>{service.description}</p>
              <dl className="service-facts">
                <div>
                  <dt>Estimated delivery</dt>
                  <dd>{service.estimated_delivery}</dd>
                </div>
                <div>
                  <dt>Weight limit</dt>
                  <dd>Up to {Number(service.weight_limit_kg)} kg</dd>
                </div>
                <div>
                  <dt>International</dt>
                  <dd>{service.is_international ? "Available" : "Not available"}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}
      <p className="form-footer">
        <Link href="/customer">Back to your dashboard</Link>
      </p>
    </main>
  );
}
