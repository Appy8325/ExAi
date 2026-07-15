import type { ExhibitorDashboard } from "@concourse/api-client";
import Link from "next/link";

export function ActivityFeed({ activities, organizationId }: { activities: ExhibitorDashboard["recentActivity"]; organizationId: string }) {
  if (activities.length === 0) {
    return (
      <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-default p-6">
        <p className="text-body-sm text-muted">New scans, notes, and profile updates will appear here.</p>
      </div>
    );
  }
  return (
    <ol className="space-y-4">
      {activities.map((a) => (
        <li key={`${a.type}-${a.id}`} className="flex items-start gap-3">
          <span className={`mt-1 flex size-2 shrink-0 rounded-full ${a.type === "profile" ? "bg-status-info" : a.type === "note" ? "bg-status-warning" : "bg-status-success"}`} />
          <div className="min-w-0 flex-1">
            <p className="text-body-sm text-primary">{a.label}</p>
            <p className="text-caption text-muted">{dateTime(a.at)}</p>
          </div>
          {organizationId && (
            <Link
              href={`/exhibit/${organizationId}/relationships/${a.relationshipId}`}
              className="shrink-0 text-caption text-link hover:underline"
            >
              View
            </Link>
          )}
        </li>
      ))}
    </ol>
  );
}

function dateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
