import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { RequireAuth } from "@/lib/auth";

import { CountryForm } from "../country-form";

export const metadata: Metadata = { title: "Add country | Shipora" };

export default function AddCountryPage() {
  return (
    <RequireAuth role="ADMIN" permission="manage_countries">
      <main className="narrow">
        <PageHeader title="Add country" lead="Add a country that Shipora ships to." />
        <div className="card">
          <CountryForm />
        </div>
      </main>
    </RequireAuth>
  );
}
