import { Skeleton, SkeletonCard } from "@concourse/ui";

export default function SavedLoading() {
  return (
    <div className="space-y-4 px-4 animate-enter" aria-label="Loading saved exhibitors">
      <Skeleton className="h-5 w-24" />
      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <SkeletonCard key={i} className="min-h-24" />
        ))}
      </div>
    </div>
  );
}
