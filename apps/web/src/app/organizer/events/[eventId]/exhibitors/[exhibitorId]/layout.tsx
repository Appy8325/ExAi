import type { ReactNode } from "react";
import Link from "next/link";

const items = ["Dashboard", "Leads", "Relationships", "Products", "Analytics", "Settings"];

export default async function ExhibitorLayout({ children, params }: { children: ReactNode; params: Promise<{ eventId: string; exhibitorId: string }> }) {
  const { eventId, exhibitorId } = await params;
  const basePath = `/organizer/events/${eventId}/exhibitors/${exhibitorId}`;

  return <div className="space-y-5"><nav aria-label="Exhibitor workspace navigation" className="flex gap-1 overflow-x-auto border-b border-default">{items.map((item) => <Link key={item} href={item === "Dashboard" ? basePath : `${basePath}/${item.toLowerCase()}`} className="shrink-0 px-3 py-2 text-body-sm font-medium text-secondary hover:text-primary">{item}</Link>)}</nav>{children}</div>;
}
