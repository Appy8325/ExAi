import type { ReactNode } from "react";
import Link from "next/link";

import { MarketingNav } from "./_components/marketing-nav";
import { MarketingFooter } from "./_components/marketing-footer";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-primary">
      <MarketingNav
        logo={
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-on-brand shadow-1">
              E
            </span>
            <span className="text-base font-semibold tracking-tight">ExAi</span>
          </Link>
        }
      />
      <div className="flex-1">{children}</div>
      <MarketingFooter />
    </div>
  );
}
