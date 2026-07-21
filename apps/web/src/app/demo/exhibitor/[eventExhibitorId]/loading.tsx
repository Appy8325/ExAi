import { Skeleton, SkeletonCard } from "@concourse/ui";

export default function BoothLoading() {
  return (
    <div className="space-y-section animate-enter" aria-label="Loading booth">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-4 w-64" />
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}