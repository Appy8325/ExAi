"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { GlobalNav } from "@/components/navigation/global-nav";
import { BackLink } from "@/components/navigation/back-link";

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
    <div className="mx-auto flex min-h-screen max-w-lg flex-col bg-canvas">
      {isVisitPage ? (
        <div className="sticky top-0 z-40 border-b border-default/50 bg-canvas/95 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-2 px-4 py-2.5">
            <BackLink label="Exhibition" href={`/e/${slug}`} />
            <Link
              href="/"
              aria-label="Home"
              className="inline-flex min-h-10 items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-secondary transition-colors hover:bg-sunken hover:text-primary"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M3 8l10 0M8 3l-5 5 5 5" />
              </svg>
              Home
            </Link>
          </div>
        </div>
      ) : (
        <div className="sticky top-0 z-(--mq-z-sticky, 50)">
          <GlobalNav variant="compact" active="attendee" />
        </div>
      )}
      {isVisitPage ? (
        <main id="main" className="flex-1 py-4">{children}</main>
      ) : (
        <>
          <main id="main" className="flex-1 pb-24 pt-4">{children}</main>
          <nav
            aria-label="Attendee navigation"
            className="fixed inset-x-0 bottom-0 z-40 border-t border-default bg-surface/95 backdrop-blur-lg"
          >
            <div className="mx-auto flex max-w-lg items-center justify-around py-1">
              {tabs.map(({ href, label }) => {
                const isActive =
                  href === `/e/${slug}`
                    ? pathname.startsWith(`/e/${slug}`) &&
                      !pathname.includes("/saved") &&
                      !pathname.includes("/exhibitors/")
                    : pathname.startsWith(href);
                return (
                  <Link
                    key={label}
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
