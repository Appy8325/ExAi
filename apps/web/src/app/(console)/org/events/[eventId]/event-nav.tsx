"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Overview", href: (id: string) => `/org/events/${id}` },
  { label: "Exhibitors", href: (id: string) => `/org/events/${id}/exhibitors` },
  { label: "Documents", href: (id: string) => `/org/events/${id}/documents` },
  { label: "Reports", href: (id: string) => `/org/events/${id}/reports` },
  { label: "Settings", href: (id: string) => `/org/events/${id}/settings` },
];

export function EventNav({ eventId }: { eventId: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-b border-default">
      {navItems.map((item) => {
        const href = item.href(eventId);
        const isActive =
          href === `/org/events/${eventId}`
            ? pathname === href
            : pathname.startsWith(href);

        return (
          <Link
            key={item.label}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              isActive
                ? "border-brand text-brand"
                : "border-transparent text-secondary hover:text-primary hover:border-default"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
