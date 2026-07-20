"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useAuthSession } from "@/components/auth/session-provider";

const navItems = [
  { label: "Dashboard", href: "/org", icon: "grid" },
  { label: "Events", href: "/org/events", icon: "calendar" },
  { label: "Users", href: "/org/users", icon: "users" },
  { label: "Analytics", href: "/org/analytics", icon: "chart" },
  { label: "Settings", href: "/org/settings", icon: "gear" },
];

export function ConsoleNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, state } = useAuthSession();

  const displayName = user?.displayName ?? "Organizer";
  const initials = user?.initials ?? "O";
  const isSignedIn = user !== null;

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <aside className="flex w-60 flex-col border-r border-default bg-surface">
      <Link href="/" className="flex h-14 items-center gap-2.5 border-b border-default px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-sm font-bold text-on-brand shadow-1">
          E
        </div>
        <span className="text-sm font-semibold text-primary">ExAi</span>
      </Link>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/org" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-[var(--mq-duration-fast)] ${
                active
                  ? "bg-brand-subtle text-brand"
                  : "text-secondary hover:bg-sunken hover:text-primary"
              }`}
            >
              <NavIcon name={item.icon} active={active} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-default p-3">
        {state === "loading" ? (
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="h-7 w-7 animate-pulse rounded-full bg-sunken" />
            <div className="flex-1 space-y-1">
              <div className="h-3 w-16 animate-pulse rounded bg-sunken" />
              <div className="h-2 w-12 animate-pulse rounded bg-sunken" />
            </div>
          </div>
        ) : isSignedIn ? (
          <div className="space-y-1">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-secondary">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sunken text-xs font-medium text-primary">
                {initials}
              </div>
              <div className="min-w-0 flex-1 truncate">
                <p className="truncate text-sm font-medium text-primary">{displayName}</p>
                <p className="truncate text-xs text-muted">Organizer</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-secondary hover:bg-sunken hover:text-primary transition-colors"
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
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-secondary hover:bg-sunken hover:text-primary transition-colors"
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
    </aside>
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
    case "gear":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    default:
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /></svg>;
  }
}
