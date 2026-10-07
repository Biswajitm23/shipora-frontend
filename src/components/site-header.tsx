"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { AREA_PATHS, useAuth } from "@/lib/auth";

/** Site-wide header: brand, and the account actions for the current visitor. */
export function SiteHeader() {
  const auth = useAuth();
  const router = useRouter();

  function logOut() {
    auth.logout();
    router.push("/");
  }

  return (
    <header className="site-header">
      <div className="container bar">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            SP
          </span>
          Shipora
        </Link>
        <nav className="nav-account" aria-label="Account">
          {auth.status === "anonymous" && (
            <>
              <Link href="/login" className="btn btn-outline btn-small">
                Log in
              </Link>
              <Link href="/register" className="btn btn-small">
                Create account
              </Link>
            </>
          )}
          {auth.status === "authenticated" && (
            <>
              <span className="nav-user">
                Hi, <strong>{auth.user.first_name || auth.user.email}</strong>
              </span>
              <Link href={AREA_PATHS[auth.user.role]} className="btn btn-outline btn-small">
                My dashboard
              </Link>
              <button type="button" className="btn-small" onClick={logOut}>
                Log out
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
