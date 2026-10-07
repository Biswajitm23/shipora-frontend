import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";

import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Create account | Shipora" };

export default function RegisterPage() {
  return (
    <>
      <PageHeader title="Create your account" lead="Send and track your shipments with Shipora." />
      <RegisterForm />
    </>
  );
}
