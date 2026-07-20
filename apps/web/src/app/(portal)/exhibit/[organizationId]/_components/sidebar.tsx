"use client";

import Link from "next/link";
import {
  usePathname,
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";

import { useAuthSession } from "@/components/auth/session-provider";

const nav = [
  { label: "Dashboard", href: "", icon: "grid" },
  { label: "Attendees", href: "/attendees", icon: "users" },
  { label: "AI Insights", href: "/ai-insights", icon: "sparkle" },
  { label: "Knowledge", href: "/documents", icon: "file" },
  { label: "Lead form", href: "/forms", icon: "clipboard" },
  { label: "Booth QR", href: "/qr", icon: "qr" },
  { label: "Booth settings", href: "/settings", icon: "gear" },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, signOut, state } = useAuthSession();

  const orgId = params.organizationId as string;
  const base = `/exhibit/${orgId}`;
  const match = pathname.match(/\/exhibit\/[^/]+\/dashboard\/([^/]+)/);
  const eeId = match?.[1] ?? searchParams.get("eeId") ?? undefined;

  const items = nav.map((item) => {
    if (item.label === "Dashboard") {
      const href = eeId ? `${base}/dashboard/${eeId}` : pathname;
      return { ...item, href, active: pathname.includes("/dashboard/") };
    }
    const qs = eeId ? `?eeId=${eeId}` : "";
    const href = `${base}${item.href}${qs}`;
    return {
      ...item,
      href,
      active:
        pathname === href ||
        pathname.startsWith(`${href}/`) ||
        pathname.startsWith(`${base}${item.href}/`),
    };
  });

  const displayName = user?.displayName ?? "Exhibitor";
  const initials = user?.initials ?? "EX";

  return (
    <aside className="flex w-60 flex-col border-r border-default bg-surface">
      <Link
        href="/"
        className="flex h-14 items-center gap-2.5 border-b border-default px-4"
      >
        <div className="flex size-7 items-center justify-center rounded-lg bg-brand text-sm font-bold text-on-brand shadow-1">
          E
        </div>
        <span className="text-sm font-semibold text-primary">ExAi</span>
      </Link>
      <nav aria-label="Exhibitor workspace navigation" className="flex-1 space-y-1 p-3">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-[var(--mq-duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              item.active
                ? "bg-brand-subtle text-brand"
                : "text-secondary hover:bg-sunken hover:text-primary"
            }`}
          >
            <NavIcon name={item.icon} active={item.active} />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-default p-3">
        {state === "loading" ? (
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="size-7 animate-pulse rounded-full bg-sunken" />
            <div className="flex-1 space-y-1">
              <div className="h-3 w-16 animate-pulse rounded bg-sunken" />
              <div className="h-2 w-12 animate-pulse rounded bg-sunken" />
            </div>
          </div>
        ) : user ? (
          <div className="space-y-1">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-secondary">
              <div className="flex size-7 items-center justify-center rounded-full bg-sunken text-xs font-semibold text-primary">
                {initials}
              </div>
              <span className="truncate text-sm font-medium text-primary">{displayName}</span>
            </div>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                router.push("/");
                router.refresh();
              }}
              aria-label="Sign out"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-secondary hover:bg-sunken hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
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
    case "users":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
        </svg>
      );
    case "clipboard":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="8" y1="16" x2="16" y2="16" />
        </svg>
      );
    case "gear":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
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
    default:
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /></svg>;
  }
}
