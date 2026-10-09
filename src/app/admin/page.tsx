import type { Metadata } from "next";
import Link from "next/link";

import { AreaHome } from "@/components/area-home";

export const metadata: Metadata = { title: "Admin dashboard | Shipora" };

export default function AdminPage() {
  return (
    <AreaHome
      role="ADMIN"
      actions={
        <>
          <Link href="/admin/users" className="btn">
            Manage users
          </Link>
          <Link href="/admin/countries" className="btn">
            Manage countries
          </Link>
        </>
      }
    />
  );
}
