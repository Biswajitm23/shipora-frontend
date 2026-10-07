import type { Metadata } from "next";

import { AreaHome } from "@/components/area-home";

export const metadata: Metadata = { title: "Customer dashboard | Shipora" };

export default function CustomerPage() {
  return <AreaHome role="CUSTOMER" />;
}
