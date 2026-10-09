"use client";

import type { ReactNode } from "react";

import { PageHeader } from "@/components/page-header";
import { permissionLabels } from "@/lib/access";
import { AREA_NAMES, RequireAuth, useAuth, type Role } from "@/lib/auth";

/**
 * The landing page of an account area after login. The full dashboards come with
 * DASH-001..004; until then each area greets its user.
 */
export function AreaHome({ role, actions }: { role: Role; actions?: ReactNode }) {
  return (
    <RequireAuth role={role}>
      <AreaWelcome role={role} actions={actions} />
    </RequireAuth>
  );
}

function AreaWelcome({ role, actions }: { role: Role; actions?: ReactNode }) {
  const auth = useAuth();
  const user = auth.status === "authenticated" ? auth.user : null;
  const name = user?.first_name ?? "";
  return (
    <main>
      <PageHeader
        title={`Welcome${name ? `, ${name}` : ""}`}
        lead={`This is your ${AREA_NAMES[role]} dashboard.`}
      />
      {actions && <div className="actions">{actions}</div>}
      {user && (
        <section className="card access-card" aria-labelledby="access-title">
          <h2 id="access-title">What you can do</h2>
          <p>Your {AREA_NAMES[role]} account gives you access to:</p>
          <ul className="access-list">
            {permissionLabels(user).map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
