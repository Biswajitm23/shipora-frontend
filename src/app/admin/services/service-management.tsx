"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { PageHeader } from "@/components/page-header";
import { Alert, Loading } from "@/components/states";
import { api, ApiError } from "@/lib/api";

import type { Service } from "./service-form";

type Query = { search: string; status: string };
type Notice = { tone: "success" | "error"; text: string };

function errorText(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  return "Something went wrong. Please try again.";
}

/** SERV-001: the Admin views, creates, updates and activates / deactivates services. */
export function ServiceManagement() {
  const [query, setQuery] = useState<Query>({ search: "", status: "" });
  const [services, setServices] = useState<Service[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  // Coming back from the add / edit form: ?added=<name> or ?updated=<name>.
  const params = useSearchParams();
  const added = params.get("added");
  const updated = params.get("updated");
  const shownNotice: Notice | null =
    notice ??
    (added
      ? { tone: "success", text: `${added} has been added.` }
      : updated
        ? { tone: "success", text: `${updated} has been updated.` }
        : null);

  useEffect(() => {
    let cancelled = false;
    const search = new URLSearchParams(Object.entries(query).filter(([, value]) => value));
    api
      .get<Service[]>(`/api/services/?${search}`)
      .then((data) => {
        if (!cancelled) setServices(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(errorText(err));
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  function update(next: Partial<Query>) {
    setServices(null);
    setLoadError(null);
    setQuery((current) => ({ ...current, ...next }));
  }

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    update({ search: String(new FormData(event.currentTarget).get("search") ?? "").trim() });
  }

  async function setActive(service: Service, isActive: boolean) {
    setBusyId(service.id);
    setNotice(null);
    try {
      const saved = await api.patch<Service>(`/api/services/${service.id}/`, {
        is_active: isActive,
      });
      setServices((list) => list?.map((s) => (s.id === saved.id ? saved : s)) ?? null);
      setNotice({
        tone: "success",
        text: `${saved.name} has been ${isActive ? "activated" : "deactivated"}.`,
      });
    } catch (err) {
      setNotice({ tone: "error", text: errorText(err) });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main>
      <PageHeader
        title="Manage services"
        lead="The delivery services Shipora offers. Customers only see the active services."
      />
      <div className="actions page-actions">
        <Link href="/admin/services/new" className="btn">
          Add service
        </Link>
      </div>

      <div className="toolbar">
        <form className="toolbar-search" onSubmit={onSearch} role="search">
          <label className="field">
            <span>Search</span>
            <input name="search" type="search" placeholder="Name or description" />
          </label>
          <button type="submit">Search</button>
        </form>
        <label className="field">
          <span>Status</span>
          <select value={query.status} onChange={(e) => update({ status: e.target.value })}>
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
      </div>

      {shownNotice && <Alert tone={shownNotice.tone}>{shownNotice.text}</Alert>}

      {loadError ? (
        <Alert tone="error">{loadError}</Alert>
      ) : services === null ? (
        <Loading label="Loading services…" />
      ) : services.length === 0 ? (
        <div className="empty-state">
          <h2>No services found</h2>
          <p>
            {query.search || query.status
              ? "Try a different search or clear the filters."
              : "Add the first service Shipora offers."}
          </p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Service</th>
                <th scope="col">Estimated delivery</th>
                <th scope="col">Weight limit</th>
                <th scope="col">International</th>
                <th scope="col">Status</th>
                <th scope="col">
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id}>
                  <td>
                    <strong>{service.name}</strong>
                    <div className="table-note">{service.description}</div>
                  </td>
                  <td>{service.estimated_delivery}</td>
                  <td>Up to {Number(service.weight_limit_kg)} kg</td>
                  <td>{service.is_international ? "Yes" : "No"}</td>
                  <td>
                    <span className={`badge ${service.is_active ? "badge-success" : "badge-muted"}`}>
                      {service.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="table-action">
                    <Link href={`/admin/services/${service.id}`} className="btn btn-outline btn-small">
                      Edit
                    </Link>{" "}
                    <button
                      type="button"
                      className={`btn-small ${service.is_active ? "btn-outline" : ""}`}
                      disabled={busyId !== null}
                      aria-busy={busyId === service.id}
                      onClick={() => setActive(service, !service.is_active)}
                    >
                      {service.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
