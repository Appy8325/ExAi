"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { label: "Overview", href: "/admin" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="flex w-60 flex-col border-r border-default bg-surface">
        <Link href="/" className="flex h-14 items-center gap-2 border-b border-default px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-sm font-bold text-on-brand">E</div>
          <span className="text-sm font-semibold text-primary">ExAi Admin</span>
        </Link>
        <nav className="flex-1 space-y-1 p-3">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-brand-subtle text-brand" : "text-secondary hover:bg-sunken hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-default p-3">
          <Link href="/auth" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-secondary hover:bg-sunken hover:text-primary">
            Sign in
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6 sm:p-8">
        {children}
      </main>
    </div>
  );
}