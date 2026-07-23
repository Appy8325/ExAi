import Link from "next/link";
import { KPICard, PageHeader } from "@concourse/ui";

const metrics = [
  ["Events", "0", "Across this organization", "brand"],
  ["Attendees", "0", "Across all events", "info"],
  ["Sessions", "0", "Across all events", "success"],
  ["Exhibitors", "0", "Across all events", "ai"],
  ["QR scans", "0", "Across all events", "brand"],
  ["AI usage", "0", "Across all events", "ai"],
  ["Lead capture", "0", "Across all events", "info"],
  ["Engagement", "0", "Across all events", "success"],
] as const;

export default function OrganizerPage() {
  return <div className="space-y-section"><PageHeader title="ExAi Organization" description="Your event portfolio at a glance." /><section aria-label="Organization metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value, detail, accent]) => <KPICard key={label} label={label} value={value} detail={detail} accent={accent} />)}</section><section className="rounded-xl border border-default bg-surface p-6"><h2 className="text-title font-semibold text-primary">Your organization is ready</h2><p className="mt-2 max-w-xl text-body text-secondary">Create and manage events from this workspace when Event Management begins in Phase 2.</p><Link href="/organizer/events" className="mt-4 inline-flex rounded-lg border border-default px-3 py-2 text-body font-medium text-secondary transition-colors hover:bg-sunken hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">View events</Link></section></div>;
}
