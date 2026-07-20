"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";

function eventSlugFrom(pathname: string) {
  const seg = pathname.split("/").filter(Boolean);
  return seg[0] === "e" ? (seg[1] ?? "techexpo-2027") : "techexpo-2027";
}

export default function AttendeeLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const slug = eventSlugFrom(pathname);
  const isVisitPage = pathname.startsWith("/visit/");

  const tabs = [
    { href: `/e/${slug}`, label: "Browse" },
    { href: `/e/${slug}/saved`, label: "Saved" },
    { href: "/account/profile", label: "Profile" },
  ] as const;

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-canvas">
      {isVisitPage ? (
        children
      ) : (
        <>
          <main className="pb-24 pt-4">{children}</main>
          <nav aria-label="Attendee navigation" className="fixed inset-x-0 bottom-0 z-50 border-t border-default bg-surface/95 backdrop-blur-lg">
            <div className="mx-auto flex max-w-lg items-center justify-around py-1">
              {tabs.map(({ href, label }) => {
                const isActive = href === `/e/${slug}`
                  ? pathname.startsWith(`/e/${slug}`) && !pathname.includes("/saved") && !pathname.includes("/exhibitors/")
                  : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex min-h-12 min-w-20 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isActive
                        ? "bg-brand text-on-brand"
                        : "text-muted hover:text-primary"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
