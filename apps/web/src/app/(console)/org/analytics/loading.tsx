import { Skeleton, SkeletonCard } from "@concourse/ui";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-section animate-enter" aria-label="Loading analytics">
      <div className="space-y-1">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-4 w-56" />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <SkeletonCard className="min-h-56" />
        <SkeletonCard className="min-h-56" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <SkeletonCard className="min-h-48" />
        <SkeletonCard className="min-h-48" />
      </div>
    </div>
  );
}