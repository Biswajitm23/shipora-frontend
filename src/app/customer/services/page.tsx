import type { Metadata } from "next";

import { RequireAuth } from "@/lib/auth";

import { AvailableServices } from "./available-services";

export const metadata: Metadata = { title: "Our services | Shipora" };

export default function ServicesPage() {
  return (
    <RequireAuth role="CUSTOMER">
      <AvailableServices />
    </RequireAuth>
  );
}
