import Link from "next/link";
import { memo } from "react";

export const MarketingFooter = memo(function MarketingFooter() {
  return (
    <footer className="border-t border-default/50 bg-surface py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 text-body text-secondary sm:flex-row sm:justify-between sm:px-10">
        <div className="flex items-center gap-2 font-semibold text-primary">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-brand text-[10px] font-bold text-on-brand">
            E
          </span>
          ExAi
        </div>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link href="/demo" className="hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Demo</Link>
          <Link href="/auth" className="hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Sign in</Link>
        </nav>
        <p>&copy; {new Date().getFullYear()} ExAi</p>
      </div>
    </footer>
  );
});