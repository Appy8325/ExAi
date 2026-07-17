import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-canvas text-primary">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-32 -z-10 mx-auto h-[420px] max-w-5xl rounded-full bg-gradient-to-tr from-brand/30 via-violet-500/20 to-sky-400/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-72 bg-gradient-to-t from-brand-subtle/60 to-transparent"
      />

      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-10">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-on-brand shadow-1">
            E
          </div>
          <span className="text-base font-semibold tracking-tight">ExAi</span>
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-secondary transition-colors hover:text-primary"
        >
           Back to home
        </Link>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-md flex-col items-center justify-center px-6 py-10">
        {children}
      </div>
    </main>
  );
}
