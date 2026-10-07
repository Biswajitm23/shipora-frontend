import Link from "next/link";

import { PageHeader } from "@/components/page-header";

export default function Home() {
  return (
    <main>
      <PageHeader title="Shipora" lead="Send, track and manage your shipments in one place." />
      <div className="actions">
        <Link href="/register" className="btn">
          Create account
        </Link>
      </div>
    </main>
  );
}
