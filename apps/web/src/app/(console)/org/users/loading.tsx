import { Skeleton, SkeletonTable } from "@concourse/ui";

export default function UsersLoading() {
  return (
    <div className="space-y-section animate-enter" aria-label="Loading users">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-(--spacing-control-h) w-32 rounded-lg" />
      </div>
      <SkeletonTable rows={8} />
    </div>
  );
}
