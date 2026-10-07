"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { ResendVerification } from "@/components/resend-verification";
import { Alert, Loading } from "@/components/states";
import { api, ApiError } from "@/lib/api";

const INVALID_LINK = "This verification link is invalid or has expired.";

type Result = { ok: boolean; message: string };

/** Verifies the emailed token as soon as the page opens. */
export function VerifyEmail() {
  const token = useSearchParams().get("token");
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    api
      .post<{ detail: string }>("/api/auth/verify-email/", { token })
      .then((data) => ({ ok: true, message: data.detail }))
      .catch((err) => ({
        ok: false,
        message: err instanceof ApiError ? err.message : INVALID_LINK,
      }))
      .then((outcome) => {
        if (!cancelled) setResult(outcome);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (token && !result) return <Loading label="Verifying your email address…" />;

  if (result?.ok) {
    return (
      <>
        <Alert tone="success">{result.message}</Alert>
        <Link href="/login" className="btn btn-block">
          Log in
        </Link>
      </>
    );
  }

  return (
    <>
      <Alert tone="error">{result?.message ?? INVALID_LINK}</Alert>
      <ResendVerification />
    </>
  );
}
