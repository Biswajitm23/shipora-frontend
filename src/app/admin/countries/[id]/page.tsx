import type { Metadata } from "next";

import { RequireAuth } from "@/lib/auth";

import { EditCountry } from "./edit-country";

export const metadata: Metadata = { title: "Edit country | Shipora" };

export default function EditCountryPage() {
  return (
    <RequireAuth role="ADMIN" permission="manage_countries">
      <EditCountry />
    </RequireAuth>
  );
}
