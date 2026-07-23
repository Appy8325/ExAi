"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = ["Dashboard", "Exhibitors", "Attendees", "Sessions", "Analytics", "Users", "Settings"];

export function EventNavigation({ eventId }: { eventId: string }) {
  const pathname = usePathname();
  const basePath = `/organizer/events/${eventId}`;

  if (pathname.startsWith(`${basePath}/exhibitors/`)) return null;

  return <nav aria-label="Event navigation" className="flex gap-1 overflow-x-auto border-b border-default">{items.map((item) => <Link key={item} href={item === "Dashboard" ? basePath : `${basePath}/${item.toLowerCase()}`} className="shrink-0 px-3 py-2 text-body-sm font-medium text-secondary hover:text-primary">{item}</Link>)}</nav>;
}
