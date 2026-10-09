import type { Metadata } from "next";

import { RequireAuth } from "@/lib/auth";

import { EditService } from "./edit-service";

export const metadata: Metadata = { title: "Edit service | Shipora" };

export default function EditServicePage() {
  return (
    <RequireAuth role="ADMIN" permission="manage_services">
      <EditService />
    </RequireAuth>
  );
}
