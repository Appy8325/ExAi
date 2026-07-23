interface ActivityItem {
  id: string;
  label: string;
  at: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return <p className="text-caption text-muted">No recent activity.</p>;
  }
  return (
    <ul className="space-y-2">
      {activities.map((item) => (
        <li key={item.id} className="flex items-start gap-3">
          <span className="mt-1 size-1.5 shrink-0 rounded-full bg-muted" />
          <div className="flex-1 min-w-0">
            <p className="text-body-sm text-primary">{item.label}</p>
            <p className="text-caption text-muted">
              {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.at))}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}