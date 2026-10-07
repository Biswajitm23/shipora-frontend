import type { Metadata } from "next";

import { AreaHome } from "@/components/area-home";

export const metadata: Metadata = { title: "Admin dashboard | Shipora" };

export default function AdminPage() {
  return <AreaHome role="ADMIN" />;
}
