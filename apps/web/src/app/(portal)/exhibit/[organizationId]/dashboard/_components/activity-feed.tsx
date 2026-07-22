import type { ExhibitorDashboard } from "@concourse/api-client";

export function ActivityFeed({ activities }: { activities: ExhibitorDashboard["recentActivity"] }) {
  if (activities.length === 0) {
    return <p className="text-body-sm text-muted">No recent activity.</p>;
  }
  return (
    <ul className="space-y-3">
      {activities.map((item) => (
        <li key={item.id} className="flex items-center justify-between">
          <span className="text-body-sm text-secondary">{item.label}</span>
          <span className="text-caption text-muted">
            {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.at))}
          </span>
        </li>
      ))}
    </ul>
  );
}
