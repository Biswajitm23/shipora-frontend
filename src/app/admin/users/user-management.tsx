"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { PageHeader } from "@/components/page-header";
import { Alert, Loading } from "@/components/states";
import { api, ApiError } from "@/lib/api";
import { AREA_NAMES, useAuth, type Role } from "@/lib/auth";

type AdminUser = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: Role;
  is_active: boolean;
  email_verified: boolean;
  date_joined: string;
  last_login: string | null;
};

type Query = { search: string; role: string; status: string };
type Notice = { tone: "success" | "error"; text: string };

const ROLES = Object.keys(AREA_NAMES) as Role[];

function fullName(user: AdminUser): string {
  return `${user.first_name} ${user.last_name}`.trim() || user.email;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function errorText(err: unknown): string {
  if (err instanceof ApiError) return err.fieldErrors.is_active?.[0] ?? err.message;
  return "Something went wrong. Please try again.";
}

/** USER-002: the Admin views and searches accounts and activates / deactivates them. */
export function UserManagement() {
  const auth = useAuth();
  const myId = auth.status === "authenticated" ? auth.user.id : null;
  const [query, setQuery] = useState<Query>({ search: "", role: "", status: "" });
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  // Coming back from "Add user": ?added=<name>.
  const added = useSearchParams().get("added");
  const shownNotice: Notice | null =
    notice ?? (added ? { tone: "success", text: `${added} has been added.` } : null);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(Object.entries(query).filter(([, value]) => value));
    api
      .get<AdminUser[]>(`/api/users/?${params}`)
      .then((data) => {
        if (!cancelled) setUsers(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(errorText(err));
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  function update(next: Partial<Query>) {
    setUsers(null);
    setLoadError(null);
    setQuery((current) => ({ ...current, ...next }));
  }

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    update({ search: String(new FormData(event.currentTarget).get("search") ?? "").trim() });
  }

  async function setActive(user: AdminUser, isActive: boolean) {
    setBusyId(user.id);
    setNotice(null);
    try {
      const updated = await api.patch<AdminUser>(`/api/users/${user.id}/`, {
        is_active: isActive,
      });
      setUsers((list) => list?.map((u) => (u.id === updated.id ? updated : u)) ?? null);
      setNotice({
        tone: "success",
        text: `${fullName(updated)} has been ${isActive ? "activated" : "deactivated"}.`,
      });
    } catch (err) {
      setNotice({ tone: "error", text: errorText(err) });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main>
      <PageHeader title="Manage users" lead="View accounts and control who can use Shipora." />
      <div className="actions page-actions">
        <Link href="/admin/users/new" className="btn">
          Add user
        </Link>
      </div>

      <div className="toolbar">
        <form className="toolbar-search" onSubmit={onSearch} role="search">
          <label className="field">
            <span>Search</span>
            <input name="search" type="search" placeholder="Name, email or phone" />
          </label>
          <button type="submit">Search</button>
        </form>
        <label className="field">
          <span>Account type</span>
          <select value={query.role} onChange={(e) => update({ role: e.target.value })}>
            <option value="">All types</option>
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {AREA_NAMES[role]}
              </option>
            ))}
          </select>
        </label>
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
      ) : users === null ? (
        <Loading label="Loading users…" />
      ) : users.length === 0 ? (
        <div className="empty-state">
          <h2>No users found</h2>
          <p>Try a different search or clear the filters.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Phone</th>
                <th scope="col">Account type</th>
                <th scope="col">Status</th>
                <th scope="col">Email verified</th>
                <th scope="col">Joined</th>
                <th scope="col">
                  <span className="visually-hidden">Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{fullName(user)}</td>
                  <td>{user.email}</td>
                  <td>{user.phone || "—"}</td>
                  <td>{AREA_NAMES[user.role]}</td>
                  <td>
                    <span className={`badge ${user.is_active ? "badge-success" : "badge-muted"}`}>
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{user.email_verified ? "Yes" : "No"}</td>
                  <td>{formatDate(user.date_joined)}</td>
                  <td className="table-action">
                    {user.id !== myId && (
                      <button
                        type="button"
                        className={`btn-small ${user.is_active ? "btn-outline" : ""}`}
                        disabled={busyId !== null}
                        aria-busy={busyId === user.id}
                        onClick={() => setActive(user, !user.is_active)}
                      >
                        {user.is_active ? "Deactivate" : "Activate"}
                      </button>
                    )}
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
