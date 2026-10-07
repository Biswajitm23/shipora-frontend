import type { Metadata } from "next";
import Link from "next/link";

import "./globals.css";

export const metadata: Metadata = {
  title: "Shipora",
  description: "Send, track and manage your shipments.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container bar">
            <Link href="/" className="brand">
              <span className="brand-mark" aria-hidden="true">
                SP
              </span>
              Shipora
            </Link>
            <Link href="/register" className="btn btn-small">
              Create account
            </Link>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
