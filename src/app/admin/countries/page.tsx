import type { Metadata } from "next";
import { Suspense } from "react";

import { Loading } from "@/components/states";
import { RequireAuth } from "@/lib/auth";

import { CountryManagement } from "./country-management";

export const metadata: Metadata = { title: "Manage countries | Shipora" };

export default function ManageCountriesPage() {
  return (
    <RequireAuth role="ADMIN" permission="manage_countries">
      <Suspense fallback={<Loading />}>
        <CountryManagement />
      </Suspense>
    </RequireAuth>
  );
}
