"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useAuthSession } from "@/components/auth/session-provider";

const navItems = [
  { label: "Dashboard", href: "/org", icon: DashboardIcon },
  { label: "Events", href: "/org/events", icon: EventsIcon },
  { label: "Users", href: "/org/users", icon: UsersIcon },
  { label: "Analytics", href: "/org/analytics", icon: AnalyticsIcon },
  { label: "Settings", href: "/org/settings", icon: SettingsIcon },
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
      <Link href="/" className="flex h-14 items-center gap-2 border-b border-default px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-sm font-bold text-on-brand">
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
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-subtle text-brand"
                  : "text-secondary hover:bg-sunken hover:text-primary"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-default p-3">
        {state === "loading" ? (
          <div className="flex items-center gap-3 rounded-md px-3 py-2">
            <div className="h-7 w-7 animate-pulse rounded-full bg-sunken" />
            <div className="flex-1 space-y-1">
              <div className="h-3 w-16 animate-pulse rounded bg-sunken" />
              <div className="h-2 w-12 animate-pulse rounded bg-sunken" />
            </div>
          </div>
        ) : isSignedIn ? (
          <div className="space-y-1">
            <div className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-secondary">
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
              className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs text-secondary hover:bg-sunken hover:text-primary"
            >
              Sign out
            </button>
          </div>
        ) : (
          <Link
            href="/auth"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-secondary hover:bg-sunken hover:text-primary"
          >
            Sign in
          </Link>
        )}
      </div>
    </aside>
  );
}

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function EventsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" strokeWidth={1.5} />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function AnalyticsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M18 20V10" />
      <path d="M12 20V4" />
      <path d="M6 20v-6" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}