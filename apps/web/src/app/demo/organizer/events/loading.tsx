import { Skeleton, SkeletonCard, SkeletonTable } from "@concourse/ui";

export default function PageLoading() {
  return (
    <div className="space-y-section animate-enter" aria-label="Loading">
      <div className="space-y-1">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <SkeletonTable rows={8} />
    </div>
  );
}