import { Skeleton, SkeletonTable } from "@concourse/ui";

export default function EventsLoading() {
  return (
    <div className="space-y-section animate-enter" aria-label="Loading events">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-(--spacing-control-h) w-28 rounded-lg" />
      </div>
      <SkeletonTable rows={6} />
    </div>
  );
}
