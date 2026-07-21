import { Skeleton, SkeletonTable } from "@concourse/ui";

export default function PageLoading() {
  return (
    <div className="space-y-section animate-enter" aria-label="Loading exhibitors">
      <div className="space-y-1">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <SkeletonTable rows={6} />
    </div>
  );
}