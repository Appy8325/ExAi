import type { ReactNode } from "react";

// Future shell: PortalShell (docs/13-application-layout.md §1) — Exhibitor
// Portal for Elena/Jamal, at /exhibit/[orgSlug]/events/[eventSlug]/....
export default function PortalLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
