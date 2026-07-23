"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  ["Dashboard", "/organizer"],
  ["Events", "/organizer/events"],
  ["Analytics", "/organizer/analytics"],
  ["Users", "/organizer/users"],
  ["Settings", "/organizer/settings"],
] as const;

export function isOrganizationNavItemActive(pathname: string, href: string) {
  return href === "/organizer" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function OrganizerNavigation() {
  const pathname = usePathname();
  return <nav aria-label="Organization navigation" className="flex gap-1 overflow-x-auto p-3 lg:flex-col">{navigation.map(([label, href]) => { const active = isOrganizationNavItemActive(pathname, href); return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`shrink-0 rounded-lg px-3 py-2 text-body font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "bg-brand-subtle text-brand" : "text-secondary hover:bg-sunken hover:text-primary"}`}>{label}</Link>; })}</nav>;
}
