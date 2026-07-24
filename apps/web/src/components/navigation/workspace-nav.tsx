"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Skeleton } from "@concourse/ui";
import { Sidebar as SaasSidebar } from "@saas-ui/react";
import { useAuthSession } from "@/components/auth/session-provider";

export interface WorkspaceNavItem {
  label: string;
  href: string;
  icon: string;
}

export interface WorkspaceNavSection {
  title?: string;
  items: WorkspaceNavItem[];
}

export interface WorkspaceNavProps {
  sections: WorkspaceNavSection[];
  basePath: string;
  role: "organizer" | "exhibitor" | "admin";
  variant?: "sidebar" | "mobile";
}

export function WorkspaceNav({ sections, basePath, role, variant = "sidebar" }: WorkspaceNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, state } = useAuthSession();

  const displayName = user?.displayName ?? (role === "organizer" ? "Organizer" : role === "admin" ? "Admin" : "Exhibitor");
  const initials = user?.initials ?? (role === "organizer" ? "O" : role === "admin" ? "A" : "EX");
  const isSignedIn = user !== null;

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === basePath || href === "") {
      return pathname === href || pathname.startsWith(`${basePath}/dashboard/`);
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const navigation = (
    <nav aria-label={`${role} workspace navigation`} className="space-y-0.5 p-3">
      {sections.map((section, si) => (
        <div key={si} className={si > 0 ? "mt-4" : ""}>
          {section.title && (
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              {section.title}
            </p>
          )}
          <div className={section.title ? "mt-1 space-y-0.5" : "space-y-0.5"}>
            {section.items.map((item) => {
              const href = item.href || basePath;
              const active = isActive(href);
              return (
                <Link
                  key={item.label}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-body font-medium transition-all duration-[var(--mq-duration-fast)] ease-[var(--mq-ease-standard)] will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    active
                      ? "bg-brand-subtle text-brand"
                      : "text-secondary hover:bg-sunken/70 hover:text-primary"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand" />
                  )}
                  <NavIcon name={item.icon} active={active} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  if (variant === "mobile") {
    return (
      <details className="border-b border-default bg-surface lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-body font-medium text-primary marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
          Workspace navigation
          <svg className="size-4 text-muted" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="m4 6 4 4 4-4" />
          </svg>
        </summary>
        <div className="border-t border-default">{navigation}</div>
      </details>
    );
  }

  return (
    <SaasSidebar className="flex w-60 flex-col border-r border-default bg-sidebar">
      <Link
        href="/"
        className="flex h-14 items-center gap-2.5 border-b border-default px-4 transition-colors hover:bg-sunken/50"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-body font-bold text-on-brand shadow-1">
          E
        </div>
        <span className="text-body font-semibold text-primary">ExAi</span>
      </Link>
      <div className="flex-1">{navigation}</div>
      <div className="border-t border-default p-3">
        {state === "loading" ? (
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <Skeleton className="size-7 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-2 w-12" />
            </div>
          </div>
        ) : isSignedIn ? (
          <div className="space-y-1">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-body text-secondary">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sunken text-caption font-medium text-primary">
                {initials}
              </div>
              <div className="min-w-0 flex-1 truncate">
                <p className="truncate text-body font-medium text-primary">{displayName}</p>
                <p className="truncate text-caption text-muted capitalize">{role}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Sign out"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-caption text-secondary transition-colors hover:bg-sunken hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign out
            </button>
          </div>
        ) : (
          <Link
            href="/auth"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-body font-medium text-secondary transition-colors hover:bg-sunken hover:text-primary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Sign in
          </Link>
        )}
      </div>
    </SaasSidebar>
  );
}

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const cls = `size-4 shrink-0 ${active ? "text-brand" : "text-muted"}`;
  switch (name) {
    case "grid":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "calendar":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case "users":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "chart":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    case "sparkle":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
          <path d="M19 16l.7 1.3 1.3.7-1.3.7L19 20l-.7-1.3-1.3-.7 1.3-.7.7-1.3z" />
        </svg>
      );
    case "file":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="8" y1="13" x2="16" y2="13" />
          <line x1="8" y1="17" x2="16" y2="17" />
        </svg>
      );
    case "gear":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case "box":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      );
    case "qr":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <path d="M15 15h1v1h-1zM19 15h1v4h-1zM15 19h3v1h-3z" />
        </svg>
      );
    case "eye":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "home":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "user":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    default:
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /></svg>;
  }
}
