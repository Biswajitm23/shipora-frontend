import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import { Loading } from "@/components/states";

import { VerifyEmail } from "./verify-email";

export const metadata: Metadata = { title: "Verify email | Shipora" };

export default function VerifyEmailPage() {
  return (
    <>
      <PageHeader title="Verify your email" />
      <Suspense fallback={<Loading />}>
        <VerifyEmail />
      </Suspense>
    </>
  );
}
