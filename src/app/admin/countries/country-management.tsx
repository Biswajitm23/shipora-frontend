"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { PageHeader } from "@/components/page-header";
import { Alert, Loading } from "@/components/states";
import { api, ApiError } from "@/lib/api";

import type { Country } from "./country-form";

type Query = { search: string; status: string };
type Notice = { tone: "success" | "error"; text: string };

function errorText(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  return "Something went wrong. Please try again.";
}

/** CNTRY-001: the Admin views, adds, edits and activates / deactivates countries. */
export function CountryManagement() {
  const [query, setQuery] = useState<Query>({ search: "", status: "" });
  const [countries, setCountries] = useState<Country[] | null>(null);
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
      .get<Country[]>(`/api/countries/?${search}`)
      .then((data) => {
        if (!cancelled) setCountries(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(errorText(err));
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  function update(next: Partial<Query>) {
    setCountries(null);
    setLoadError(null);
    setQuery((current) => ({ ...current, ...next }));
  }

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    update({ search: String(new FormData(event.currentTarget).get("search") ?? "").trim() });
  }

  async function setActive(country: Country, isActive: boolean) {
    setBusyId(country.id);
    setNotice(null);
    try {
      const saved = await api.patch<Country>(`/api/countries/${country.id}/`, {
        is_active: isActive,
      });
      setCountries((list) => list?.map((c) => (c.id === saved.id ? saved : c)) ?? null);
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
        title="Manage countries"
        lead="The countries Shipora ships to. Only active countries can be used for new shipments."
      />
      <div className="actions page-actions">
        <Link href="/admin/countries/new" className="btn">
          Add country
        </Link>
      </div>

      <div className="toolbar">
        <form className="toolbar-search" onSubmit={onSearch} role="search">
          <label className="field">
            <span>Search</span>
            <input name="search" type="search" placeholder="Name, code, currency or zone" />
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
      ) : countries === null ? (
        <Loading label="Loading countries…" />
      ) : countries.length === 0 ? (
        <div className="empty-state">
          <h2>No countries found</h2>
          <p>
            {query.search || query.status
              ? "Try a different search or clear the filters."
              : "Add the first country Shipora ships to."}
          </p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Country</th>
                <th scope="col">Code</th>
                <th scope="col">Currency</th>
                <th scope="col">Shipping zone</th>
                <th scope="col">Tax</th>
                <th scope="col">Status</th>
                <th scope="col">
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {countries.map((country) => (
                <tr key={country.id}>
                  <td>{country.name}</td>
                  <td>{country.code}</td>
                  <td>
                    {country.currency} ({country.currency_symbol})
                  </td>
                  <td>{country.shipping_zone}</td>
                  <td>{Number(country.tax_percentage)}%</td>
                  <td>
                    <span className={`badge ${country.is_active ? "badge-success" : "badge-muted"}`}>
                      {country.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="table-action">
                    <Link href={`/admin/countries/${country.id}`} className="btn btn-outline btn-small">
                      Edit
                    </Link>{" "}
                    <button
                      type="button"
                      className={`btn-small ${country.is_active ? "btn-outline" : ""}`}
                      disabled={busyId !== null}
                      aria-busy={busyId === country.id}
                      onClick={() => setActive(country, !country.is_active)}
                    >
                      {country.is_active ? "Deactivate" : "Activate"}
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
