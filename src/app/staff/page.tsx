import type { Metadata } from "next";

import { AreaHome } from "@/components/area-home";

export const metadata: Metadata = { title: "Staff dashboard | Shipora" };

export default function StaffPage() {
  return <AreaHome role="STAFF" />;
}
