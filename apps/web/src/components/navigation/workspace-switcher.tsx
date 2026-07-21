"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface WorkspaceSwitcherOption {
  id: string;
  label: string;
  href: string;
  external?: boolean;
}

const DEFAULT_OPTIONS: WorkspaceSwitcherOption[] = [
  {
    id: "experience",
    label: "Experience ExAi",
    href: "/demo",
  },
  {
    id: "organizer",
    label: "Organizer",
    href: "/demo/organizer",
  },
  {
    id: "exhibitor",
    label: "Exhibitor",
    href: "/demo/exhibitor",
  },
  {
    id: "attendee",
    label: "Attendee",
    href: "/hackathon",
  },
];

function detectActive(pathname: string): string | undefined {
  if (pathname.startsWith("/demo/organizer")) return "organizer";
  if (pathname.startsWith("/demo/exhibitor")) return "exhibitor";
  if (pathname.startsWith("/demo/admin")) return "admin";
  if (
    pathname.startsWith("/hackathon") ||
    pathname.startsWith("/visit") ||
    pathname.startsWith("/e/") ||
    pathname.startsWith("/account")
  ) {
    return "attendee";
  }
  if (pathname.startsWith("/auth")) return "auth";
  if (pathname.startsWith("/demo")) return "experience";
  return undefined;
}

export function WorkspaceSwitcher({
  options = DEFAULT_OPTIONS,
  label = "Switch perspective",
}: {
  options?: WorkspaceSwitcherOption[];
  label?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const activeId = React.useMemo(() => detectActive(pathname), [pathname]);
  const active = options.find((o) => o.id === activeId);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-full border border-default bg-surface px-2.5 py-1 text-xs font-medium text-secondary transition-colors hover:border-strong hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M2 6l6-4 6 4M2 10l6 4 6-4M2 8h12" />
        </svg>
        {active ? `${label}: ${active.label}` : label}
        <svg
          width="10"
          height="10"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M3 6l5 5 5-5" />
        </svg>
      </button>

      {open ? (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-full z-50 mt-2 min-w-[12rem] overflow-hidden rounded-xl border border-default bg-surface shadow-2"
        >
          <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
            Perspectives
          </p>
          {options.map((opt) => {
            const isActive = opt.id === activeId;
            return (
              <Link
                key={opt.id}
                role="menuitem"
                href={opt.href}
                onClick={() => setOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-brand-subtle text-brand"
                    : "text-primary hover:bg-sunken"
                }`}
              >
                {opt.label}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                  className="text-muted"
                >
                  <path d="M6 4l4 4-4 4" />
                </svg>
              </Link>
            );
          })}
          <div className="border-t border-default bg-sunken/50 px-2 py-1.5">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="block rounded-md px-2 py-1 text-xs font-medium text-secondary transition-colors hover:bg-sunken hover:text-primary"
            >
              ← Back to homepage
            </Link>
            <Link
              href="/demo/admin"
              onClick={() => setOpen(false)}
              className="block rounded-md px-2 py-1 text-xs font-medium text-secondary transition-colors hover:bg-sunken hover:text-primary"
            >
              Demo admin
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
