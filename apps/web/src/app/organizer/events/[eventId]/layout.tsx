import type { ReactNode } from "react";
import Link from "next/link";
import { EventNavigation } from "./event-navigation";

export default async function EventLayout({ children, params }: { children: ReactNode; params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;

  return <div className="space-y-5"><Link href="/organizer/events" className="text-body-sm text-secondary hover:text-primary">← Events</Link><EventNavigation eventId={eventId} />{children}</div>;
}
