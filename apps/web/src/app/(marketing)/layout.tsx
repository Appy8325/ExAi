import type { ReactNode } from "react";

// Future shell: MarketingShell (docs/13-application-layout.md §1, §3.5) — public
// nav + footer shell for /, /pricing, /about, /contact, /help, /legal/*.
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
