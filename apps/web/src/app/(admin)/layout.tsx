"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GlobalNav } from "@/components/navigation/global-nav";

const items = [
  { label: "Overview", href: "/demo/admin" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <GlobalNav variant="compact" active="admin" />
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-1">
        <aside className="hidden lg:flex w-60 flex-col border-r border-default bg-surface">
          <div className="flex h-14 items-center gap-2 border-b border-default px-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-sm font-bold text-on-brand shadow-1">
              E
            </div>
            <span className="text-sm font-semibold text-primary">ExAi</span>
          </div>
          <nav className="flex-1 space-y-0.5 p-3">
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-[var(--mq-duration-fast)] ease-[var(--mq-ease-standard)] will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    active
                      ? "bg-brand-subtle text-brand"
                      : "text-secondary hover:bg-sunken/70 hover:text-primary"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand" />
                  )}
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-default p-3">
            <Link
              href="/auth"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-secondary transition-colors hover:bg-sunken hover:text-primary"
            >
              Sign in
            </Link>
          </div>
        </aside>
        <main id="main" className="flex-1 overflow-auto scrollbar-thin">
          <div className="mx-auto max-w-(--mq-content-max) p-(--mq-space-gutter) sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}