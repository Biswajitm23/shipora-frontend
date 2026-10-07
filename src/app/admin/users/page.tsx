import type { Metadata } from "next";

import { RequireAuth } from "@/lib/auth";

import { UserManagement } from "./user-management";

export const metadata: Metadata = { title: "Manage users | Shipora" };

export default function ManageUsersPage() {
  return (
    <RequireAuth role="ADMIN">
      <UserManagement />
    </RequireAuth>
  );
}
