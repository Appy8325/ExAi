import { Skeleton, SkeletonCard } from "@concourse/ui";

export default function PageLoading() {
  return (
    <div className="space-y-section animate-enter" aria-label="Loading documents">
      <div className="space-y-1">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <SkeletonCard className="min-h-64" />
    </div>
  );
}