import type { Metadata } from "next";
import { Suspense } from "react";

import { Loading } from "@/components/states";
import { RequireAuth } from "@/lib/auth";

import { ServiceManagement } from "./service-management";

export const metadata: Metadata = { title: "Manage services | Shipora" };

export default function ManageServicesPage() {
  return (
    <RequireAuth role="ADMIN" permission="manage_services">
      <Suspense fallback={<Loading />}>
        <ServiceManagement />
      </Suspense>
    </RequireAuth>
  );
}
