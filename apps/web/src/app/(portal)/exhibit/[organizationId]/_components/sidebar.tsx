"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

const nav = [
  { label: "Dashboard", href: "", icon: "grid" },
  { label: "Relationships", href: "/attendees", icon: "users" },
  { label: "AI Insights", href: "/ai-insights", icon: "sparkle" },
  { label: "Documents", href: "/documents", icon: "file" },
  { label: "Team", href: "/team", icon: "team" },
  { label: "Settings", href: "/settings", icon: "gear" },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const params = useParams();
  const orgId = params.organizationId as string;
  const base = `/exhibit/${orgId}`;
  const match = pathname.match(/\/exhibit\/[^/]+\/dashboard\/([^/]+)/);
  const eeId = match?.[1];

  const items = nav.map((item) => {
    if (item.label === "Dashboard") {
      const href = eeId ? `${base}/dashboard/${eeId}` : pathname;
      return { ...item, href, active: pathname.includes("/dashboard/") };
    }
    const qs = eeId ? `?eeId=${eeId}` : "";
    const href = `${base}${item.href}${qs}`;
    return { ...item, href, active: pathname === href || pathname.startsWith(href + "/") || pathname.startsWith(`${base}${item.href}/`) };
  });

  return (
    <aside className="flex w-60 flex-col border-r border-default bg-surface">
      <div className="flex h-14 items-center gap-2 border-b border-default px-4">
        <div className="flex size-7 items-center justify-center rounded-md bg-brand text-body-sm font-bold text-on-brand">E</div>
        <span className="text-body font-semibold text-primary">ExAi</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-body-sm transition-colors ${
              item.active
                ? "bg-brand-subtle text-brand font-medium"
                : "text-secondary hover:bg-sunken hover:text-primary"
            }`}
          >
            <Icon name={item.icon} />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-default p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-body-sm text-secondary">
          <div className="flex size-7 items-center justify-center rounded-full bg-sunken text-xs font-semibold text-primary">EX</div>
          <span className="truncate">Exhibitor</span>
        </div>
      </div>
    </aside>
  );
}

function Icon({ name }: { name: string }) {
  const cls = "size-4 shrink-0";
  switch (name) {
    case "grid":
      return <svg className={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1.5" y="1.5" width="5" height="5" rx="1" /><rect x="9.5" y="1.5" width="5" height="5" rx="1" /><rect x="1.5" y="9.5" width="5" height="5" rx="1" /><rect x="9.5" y="9.5" width="5" height="5" rx="1" /></svg>;
    case "users":
      return <svg className={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6" cy="5" r="2.5" /><circle cx="6" cy="5" r="2.5" /><path d="M1 14c0-2.5 2-4.5 5-4.5s5 2 5 4.5" /><circle cx="11" cy="5" r="2.5" /><path d="M11 9.5c1.5 0 4 1 4 4.5" /></svg>;
    case "sparkle":
      return <svg className={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1l1.5 3.5L13 6l-3.5 1.5L8 11l-1.5-3.5L3 6l3.5-1.5L8 1z" /><path d="M12 11l.7 1.3L14 13l-1.3.7L12 15l-.7-1.3L10 13l1.3-.7L12 11z" /></svg>;
    case "file":
      return <svg className={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 1.5h5.5L13 5v9.5a1 1 0 01-1 1H4a1 1 0 01-1-1v-12a1 1 0 011-1z" /><path d="M9.5 1.5V5h3.5" /></svg>;
    case "team":
      return <svg className={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="5" cy="4.5" r="2.5" /><path d="M1 13.5c0-2.2 1.8-4 4-4s4 1.8 4 4" /><circle cx="11" cy="4.5" r="2" /><path d="M11 9.5c1.9 0 4 1.3 4 4" /></svg>;
    case "gear":
      return <svg className={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="2.5" /><path d="M8 1.5v2M8 12.5v2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M1.5 8h2M12.5 8h2M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" /></svg>;
    default:
      return <svg className={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="3" /></svg>;
  }
}
