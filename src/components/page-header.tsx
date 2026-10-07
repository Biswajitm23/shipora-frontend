import type { ReactNode } from "react";

/** Page title with an optional short introduction. */
export function PageHeader({ title, lead }: { title: ReactNode; lead?: ReactNode }) {
  return (
    <header className="page-header">
      <h1>{title}</h1>
      {lead && <p>{lead}</p>}
    </header>
  );
}
