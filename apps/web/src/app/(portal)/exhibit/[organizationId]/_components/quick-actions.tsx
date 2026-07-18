"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

const actions = [
  ["Manage QR", "/qr"],
  ["Upload knowledge", "/documents"],
  ["Configure lead form", "/forms"],
  ["Company branding", "/settings"],
  ["View attendees", "/attendees"],
] as const;

export function QuickActions() {
  const { organizationId } = useParams<{ organizationId: string }>();
  const pathname = usePathname();
  const eventExhibitorId = pathname.match(/\/dashboard\/([^/]+)/)?.[1];
  const suffix = eventExhibitorId
    ? `?eeId=${encodeURIComponent(eventExhibitorId)}`
    : "";
  return (
    <section className="rounded-xl border border-default bg-surface p-5">
      <h2 className="mb-4 font-semibold text-primary">Quick actions</h2>
      <div className="flex flex-wrap gap-2">
        {actions.map(([label, path]) => (
          <Link
            className="rounded-lg border border-default px-3 py-2 text-sm text-secondary hover:bg-sunken hover:text-primary"
            href={`/exhibit/${organizationId}${path}${suffix}`}
            key={label}
          >
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
}
