import type { ReactNode } from "react";

// No dedicated shell: minimal chrome (logo + content, no nav) per
// docs/13-application-layout.md §1 — /auth/... and /account/... are
// pre-context/cross-tenant, so no surface owns them exclusively.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
