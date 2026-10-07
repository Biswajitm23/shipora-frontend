import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import { Loading } from "@/components/states";

import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in | Shipora" };

export default function LoginPage() {
  return (
    <>
      <PageHeader title="Log in" lead="Welcome back to Shipora." />
      <Suspense fallback={<Loading />}>
        <LoginForm />
      </Suspense>
    </>
  );
}
