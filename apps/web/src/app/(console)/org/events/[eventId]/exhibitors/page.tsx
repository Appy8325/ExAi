import Link from "next/link";
import { StatusBadge } from "@concourse/ui";
import { ActionsDropdown } from "./actions-dropdown";

const exhibitors = [
  {
    id: "019f6000-893c-7f0b-b459-e4db4b971eb0",
    companyName: "Northstar Cloud",
    boothNumber: "A-101",
    primaryContact: "elena@northstarcloud.com",
    status: "ready",
    assignedUsers: 3,
    relationships: 120,
    lastActivity: "2 hours ago",
  },
  {
    id: "019f6000-8f77-7c64-85a9-f9d16e434555",
    companyName: "Vector Labs",
    boothNumber: "A-102",
    primaryContact: "jamal@vectorlabs.com",
    status: "profile_complete",
    assignedUsers: 2,
    relationships: 98,
    lastActivity: "1 day ago",
  },
  {
    id: "019f6000-94e2-71a1-bb7c-a360748884c1",
    companyName: "Signal Forge",
    boothNumber: "A-103",
    primaryContact: "priya@signalforge.com",
    status: "ready",
    assignedUsers: 4,
    relationships: 134,
    lastActivity: "5 hours ago",
  },
  {
    id: "019f6000-9a0e-759f-ade2-bb698ee78d32",
    companyName: "Atlas Systems",
    boothNumber: "A-104",
    primaryContact: "marcus@atlas.com",
    status: "accepted",
    assignedUsers: 1,
    relationships: 76,
    lastActivity: "3 days ago",
  },
  {
    id: "019f6000-9faf-7e59-884e-b89eadcd973a",
    companyName: "Brightline AI",
    boothNumber: "A-105",
    primaryContact: "jordan@brightline.ai",
    status: "ready",
    assignedUsers: 2,
    relationships: 72,
    lastActivity: "1 week ago",
  },
];

export default async function ExhibitorsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-primary">Exhibitors</h1>
          <p className="mt-1 text-sm text-secondary">{exhibitors.length} exhibitors for this event</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="inline-flex h-9 items-center gap-2 rounded-md border border-default bg-surface px-3 text-sm font-medium text-primary hover:bg-sunken transition-colors">
            Import CSV
          </button>
          <button type="button" className="inline-flex h-9 items-center gap-2 rounded-md bg-brand px-3 text-sm font-medium text-on-brand hover:bg-brand-hover transition-colors">
            Add Exhibitor
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            className="h-(--spacing-control-h) w-full rounded-md border border-default bg-surface pl-9 pr-3 text-sm text-primary outline-none placeholder:text-muted focus:border-strong"
            placeholder="Search exhibitors..."
          />
        </div>
        <select className="h-(--spacing-control-h) rounded-md border border-default bg-surface px-3 text-sm text-primary outline-none">
          <option value="">All statuses</option>
          <option value="invited">Invited</option>
          <option value="accepted">Accepted</option>
          <option value="profile_complete">Profile Complete</option>
          <option value="ready">Ready</option>
        </select>
      </div>

      <div className="rounded-xl border border-default bg-surface shadow-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-default">
                <th className="px-4 py-3 font-medium text-secondary">Company</th>
                <th className="px-4 py-3 font-medium text-secondary">Booth</th>
                <th className="px-4 py-3 font-medium text-secondary">Contact</th>
                <th className="px-4 py-3 font-medium text-secondary">Status</th>
                <th className="px-4 py-3 font-medium text-secondary">Team</th>
                <th className="px-4 py-3 font-medium text-secondary">Relationships</th>
                <th className="px-4 py-3 font-medium text-secondary">Last Activity</th>
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {exhibitors.map((ex) => (
                <tr key={ex.id} className="border-b border-default last:border-b-0 hover:bg-sunken/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/org/events/${eventId}/exhibitors/${ex.id}`}
                      className="flex items-center gap-3 font-medium text-primary hover:underline"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sunken text-xs font-semibold text-secondary">
                        {ex.companyName.charAt(0)}
                      </div>
                      {ex.companyName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-secondary">{ex.boothNumber}</td>
                  <td className="px-4 py-3 text-secondary">{ex.primaryContact}</td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={ex.status === "ready" || ex.status === "profile_complete" ? "success" : ex.status === "accepted" ? "info" : "neutral"}>
                      {ex.status.replace("_", " ")}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-secondary">{ex.assignedUsers}</td>
                  <td className="px-4 py-3 text-secondary">{ex.relationships}</td>
                  <td className="px-4 py-3 text-secondary">{ex.lastActivity}</td>
                  <td className="px-4 py-3">
                    <ActionsDropdown eventId={eventId} exhibitorId={ex.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-secondary">
        <p>Showing {exhibitors.length} exhibitors</p>
      </div>
    </div>
  );
}