import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-canvas text-primary">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-10">
        <Link href="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-body font-bold text-on-brand shadow-1">
            E
          </div>
          <span className="text-title-sm font-semibold tracking-tight">ExAi</span>
        </Link>
        <Link
          href="/"
          className="text-body font-medium text-secondary transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          ← Back to home
        </Link>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-md flex-col items-center justify-center px-6 py-10">
        {children}
      </div>
    </main>
  );
}
