import type { Metadata } from "next";
import { Suspense } from "react";

import { Loading } from "@/components/states";
import { RequireAuth } from "@/lib/auth";

import { UserManagement } from "./user-management";

export const metadata: Metadata = { title: "Manage users | Shipora" };

export default function ManageUsersPage() {
  return (
    <RequireAuth role="ADMIN" permission="manage_users">
      <Suspense fallback={<Loading />}>
        <UserManagement />
      </Suspense>
    </RequireAuth>
  );
}
