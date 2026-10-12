import type { Metadata } from "next";
import Link from "next/link";

import { AreaHome } from "@/components/area-home";

export const metadata: Metadata = { title: "Customer dashboard | Shipora" };

export default function CustomerPage() {
  return (
    <AreaHome
      role="CUSTOMER"
      actions={
        <Link href="/customer/services" className="btn">
          View services
        </Link>
      }
    />
  );
}
