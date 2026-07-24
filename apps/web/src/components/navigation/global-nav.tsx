"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu, X } from "lucide-react";
import { Navbar as SaasNavbar } from "@saas-ui/react";

export interface GlobalPerspective {
  id: "experience" | "organizer" | "exhibitor" | "attendee" | "admin" | "auth";
  label: string;
  href: string;
  short?: string;
  external?: boolean;
}

export interface GlobalNavProps {
  variant?: "marketing" | "console" | "compact";
  active?: GlobalPerspective["id"];
}

const PERSPECTIVES: GlobalPerspective[] = [
  {
    id: "experience",
    label: "Experience ExAi",
    short: "Experience",
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

const SECONDARY: GlobalPerspective[] = [
  { id: "auth", label: "Sign in", href: "/auth", short: "Sign in" },
];

function activePerspectiveFor(
  pathname: string,
): GlobalPerspective["id"] | undefined {
  if (pathname.startsWith("/demo/admin")) return "admin";
  if (pathname.startsWith("/demo/organizer")) return "organizer";
  if (pathname.startsWith("/demo/exhibitor")) return "exhibitor";
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

export function GlobalNav({ variant = "marketing", active }: GlobalNavProps) {
  const pathname = usePathname();
  const detected = React.useMemo(() => activePerspectiveFor(pathname), [pathname]);
  const resolvedActive = active ?? detected;
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [mobileOpen]);

  return (
    <SaasNavbar
      as="header"
      className="sticky top-0 z-(--mq-z-sticky, 50) border-b border-default bg-surface"
      data-global-nav
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-8 sm:py-3">
        <Link
          href="/"
          aria-label="ExAi home"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-body font-bold text-on-brand shadow-1">
            E
          </span>
          <span className="text-title-sm font-semibold tracking-tight text-primary">
            ExAi
          </span>
        </Link>

        {variant !== "console" && (
          <PerspectiveRow
            variant={variant}
            perspectives={PERSPECTIVES}
            activeId={resolvedActive}
            className="hidden md:flex"
          />
        )}

        {variant !== "console" && (
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/auth"
              className="inline-flex h-8 items-center rounded-lg bg-brand px-3 text-caption font-semibold text-on-brand shadow-1 transition-all hover:bg-brand-hover"
            >
              Sign in
            </Link>
          </div>
        )}

        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="global-nav-mobile"
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-default bg-surface text-secondary transition-colors hover:bg-sunken md:hidden"
        >
          {mobileOpen ? <X className="size-4" aria-hidden /> : <Menu className="size-4" aria-hidden />}
        </button>
      </div>

      {variant !== "console" && <div
        id="global-nav-mobile"
        role="region"
        aria-label="Global navigation"
        className={`overflow-hidden transition-all duration-200 ease-out md:hidden ${
          mobileOpen ? "max-h-[28rem] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-1 border-t border-default bg-canvas px-4 pb-4 pt-3">
          <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
            Perspectives
          </p>
          {PERSPECTIVES.map((p) => {
            const isActive = resolvedActive === p.id;
            return (
              <Link
                key={p.id}
                href={p.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-body font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isActive
                    ? "bg-brand-subtle text-brand"
                    : "text-primary hover:bg-sunken"
                }`}
              >
                {p.label}
                <ChevronIcon />
              </Link>
            );
          })}
          <p className="mt-2 px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
            More
          </p>
          {SECONDARY.map((p) => {
            const isActive = resolvedActive === p.id;
            return (
              <Link
                key={p.id}
                href={p.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-body font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isActive
                    ? "bg-brand-subtle text-brand"
                    : "text-secondary hover:bg-sunken"
                }`}
              >
                {p.label}
                <ChevronIcon />
              </Link>
            );
          })}
          <Link
            href="/"
            className="mt-2 rounded-lg border border-default px-3 py-2 text-center text-body font-medium text-primary transition-colors hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Back to homepage
          </Link>
        </nav>
      </div>}
    </SaasNavbar>
  );
}

function PerspectiveRow({
  perspectives,
  activeId,
  variant,
  className = "",
}: {
  perspectives: GlobalPerspective[];
  activeId?: GlobalPerspective["id"];
  variant: "marketing" | "console" | "compact";
  className?: string;
}) {
  const isCompact = variant === "compact";
  return (
    <nav
      aria-label="Switch perspective"
      className={`items-center gap-1 ${className}`}
    >
      {perspectives.map((p) => {
        const isActive = activeId === p.id;
        return (
          <Link
            key={p.id}
            href={p.href}
            aria-current={isActive ? "page" : undefined}
            className={`relative rounded-md border px-3 py-1.5 text-caption font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              isActive
                ? "border-brand bg-brand-subtle text-brand"
                : "border-transparent bg-surface text-secondary hover:text-primary"
            } ${isCompact ? "px-2" : ""}`}
          >
            {p.short ?? p.label}
          </Link>
        );
      })}
    </nav>
  );
}

function ChevronIcon() {
  return <ChevronRight className="size-4 text-muted" aria-hidden />;
}

export { PERSPECTIVES as GLOBAL_PERSPECTIVES };
