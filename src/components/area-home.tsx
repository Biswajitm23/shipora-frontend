"use client";

import { PageHeader } from "@/components/page-header";
import { AREA_NAMES, RequireAuth, useAuth, type Role } from "@/lib/auth";

/**
 * The landing page of an account area after login. The full dashboards come with
 * DASH-001..004; until then each area greets its user.
 */
export function AreaHome({ role }: { role: Role }) {
  return (
    <RequireAuth role={role}>
      <AreaWelcome role={role} />
    </RequireAuth>
  );
}

function AreaWelcome({ role }: { role: Role }) {
  const auth = useAuth();
  const name = auth.status === "authenticated" ? auth.user.first_name : "";
  return (
    <main>
      <PageHeader
        title={`Welcome${name ? `, ${name}` : ""}`}
        lead={`This is your ${AREA_NAMES[role]} dashboard.`}
      />
    </main>
  );
}
