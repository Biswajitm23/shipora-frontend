import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { RequireAuth } from "@/lib/auth";

import { ServiceForm } from "../service-form";

export const metadata: Metadata = { title: "Add service | Shipora" };

export default function AddServicePage() {
  return (
    <RequireAuth role="ADMIN" permission="manage_services">
      <main className="narrow">
        <PageHeader title="Add service" lead="Add a delivery service that Shipora offers." />
        <div className="card">
          <ServiceForm />
        </div>
      </main>
    </RequireAuth>
  );
}
