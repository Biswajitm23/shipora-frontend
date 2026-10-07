"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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

  if (!token) return <Alert tone="error">{INVALID_LINK}</Alert>;
  if (!result) return <Loading label="Verifying your email address…" />;
  return <Alert tone={result.ok ? "success" : "error"}>{result.message}</Alert>;
}
