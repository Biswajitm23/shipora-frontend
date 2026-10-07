import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { RequireAuth } from "@/lib/auth";

import { AddUserForm } from "./add-user-form";

export const metadata: Metadata = { title: "Add user | Shipora" };

export default function AddUserPage() {
  return (
    <RequireAuth role="ADMIN">
      <main className="narrow">
        <PageHeader title="Add user" lead="Create an account and choose its account type." />
        <div className="card">
          <AddUserForm />
        </div>
      </main>
    </RequireAuth>
  );
}
