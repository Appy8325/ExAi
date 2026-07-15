import Link from "next/link";
import { StatusBadge, EmptyState } from "@concourse/ui";
import { ActionsDropdown } from "./actions-dropdown";

export default async function ExhibitorsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  const exhibitors: Array<{
    id: string;
    companyName: string;
    boothNumber: string;
    primaryContact: string | null;
    status: string;
    assignedUsers: number;
    relationships: number;
    lastActivity: string | null;
  }> = [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-primary">Exhibitors</h1>
          <p className="mt-0.5 text-sm text-secondary">
            Manage exhibitors for this event
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="inline-flex h-9 items-center justify-center gap-2 rounded-sm border border-strong bg-surface px-3 text-sm font-medium text-primary hover:bg-sunken">
            Import CSV
          </button>
          <button type="button" className="inline-flex h-9 items-center justify-center gap-2 rounded-sm border border-strong bg-surface px-3 text-sm font-medium text-primary hover:bg-sunken">
            Import Excel
          </button>
          <button type="button" className="inline-flex h-9 items-center justify-center gap-2 rounded-sm border border-strong bg-surface px-3 text-sm font-medium text-primary hover:bg-sunken">
            Export
          </button>
          <button type="button" className="inline-flex h-9 items-center justify-center gap-2 rounded-sm bg-brand px-3 text-sm font-medium text-on-brand hover:bg-brand-hover">
            Add Exhibitor
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            className="h-(--spacing-control-h) w-full rounded-sm border border-strong bg-surface pl-9 pr-3 text-body text-primary outline-none placeholder:text-muted"
            placeholder="Search exhibitors..."
            aria-label="Search exhibitors"
          />
        </div>
        <select className="h-(--spacing-control-h) rounded-sm border border-strong bg-surface px-3 text-body text-primary outline-none">
          <option value="">All statuses</option>
          <option value="invited">Invited</option>
          <option value="accepted">Accepted</option>
          <option value="profile_complete">Profile Complete</option>
          <option value="ready">Ready</option>
          <option value="withdrawn">Withdrawn</option>
          <option value="archived">Archived</option>
        </select>
        <div className="flex items-center gap-1.5">
          <button type="button" className="inline-flex h-(--spacing-control-h) items-center justify-center gap-2 rounded-sm border border-strong bg-surface px-3 text-sm font-medium text-primary hover:bg-sunken">
            Bulk Delete
          </button>
          <button type="button" className="inline-flex h-(--spacing-control-h) items-center justify-center gap-2 rounded-sm border border-strong bg-surface px-3 text-sm font-medium text-primary hover:bg-sunken">
            Bulk Invite
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-strong bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-strong">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-strong"
                    aria-label="Select all exhibitors"
                  />
                </th>
                <th className="px-4 py-3 font-medium text-secondary">
                  Company
                </th>
                <th className="px-4 py-3 font-medium text-secondary">Booth</th>
                <th className="px-4 py-3 font-medium text-secondary">
                  Primary Contact
                </th>
                <th className="px-4 py-3 font-medium text-secondary">Status</th>
                <th className="px-4 py-3 font-medium text-secondary">
                  Assigned
                </th>
                <th className="px-4 py-3 font-medium text-secondary">
                  Relationships
                </th>
                <th className="px-4 py-3 font-medium text-secondary">
                  Last Activity
                </th>
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {exhibitors.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-12 text-center text-secondary"
                    colSpan={9}
                  >
                    <EmptyState
                      title="No exhibitors yet"
                      description="Import exhibitors or add them manually to get started."
                      action={
                        <div className="flex items-center justify-center gap-2">
                          <button type="button" className="inline-flex h-9 items-center justify-center gap-2 rounded-sm bg-brand px-3 text-sm font-medium text-on-brand hover:bg-brand-hover">
                            Import Exhibitors
                          </button>
                          <button type="button" className="inline-flex h-9 items-center justify-center gap-2 rounded-sm border border-strong bg-surface px-3 text-sm font-medium text-primary hover:bg-sunken">
                            Add Exhibitor
                          </button>
                        </div>
                      }
                    />
                  </td>
                </tr>
              ) : (
                exhibitors.map((ex) => (
                  <tr
                    key={ex.id}
                    className="border-b border-strong last:border-b-0 hover:bg-sunken/50"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-strong"
                        aria-label={`Select ${ex.companyName}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-strong bg-sunken text-xs font-medium text-muted">
                          {ex.companyName.charAt(0)}
                        </div>
                        <Link
                          href={`/org/events/${eventId}/exhibitors/${ex.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {ex.companyName}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-secondary">
                      {ex.boothNumber}
                    </td>
                    <td className="px-4 py-3 text-secondary">
                      {ex.primaryContact ?? "\u2014"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        tone={
                          ex.status === "ready" ||
                          ex.status === "profile_complete"
                            ? "success"
                            : ex.status === "invited" || ex.status === "accepted"
                              ? "info"
                              : ex.status === "withdrawn"
                                ? "warning"
                                : "neutral"
                        }
                      >
                        {ex.status}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-secondary">
                      {ex.assignedUsers}
                    </td>
                    <td className="px-4 py-3 text-secondary">
                      {ex.relationships}
                    </td>
                    <td className="px-4 py-3 text-secondary">
                      {ex.lastActivity ?? "\u2014"}
                    </td>
                    <td className="px-4 py-3">
                      <ActionsDropdown
                        eventId={eventId}
                        exhibitorId={ex.id}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-secondary">
        <p>No exhibitors</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-strong bg-surface text-primary hover:bg-sunken disabled:opacity-50"
            aria-label="Previous page"
            disabled
          >
            &lsaquo;
          </button>
          <span className="px-2 text-primary">1</span>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-strong bg-surface text-primary hover:bg-sunken disabled:opacity-50"
            aria-label="Next page"
            disabled
          >
            &rsaquo;
          </button>
        </div>
      </div>
    </div>
  );
}
