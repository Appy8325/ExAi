import { Skeleton, SkeletonCard } from "@concourse/ui";

export default function PageLoading() {
  return (
    <div className="space-y-section animate-enter" aria-label="Loading exhibitor">
      <div className="space-y-1">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <SkeletonCard className="min-h-48" />
        <SkeletonCard className="min-h-48" />
      </div>
    </div>
  );
}