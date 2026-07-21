import { Skeleton, SkeletonCard } from "@concourse/ui";

export default function ProfileLoading() {
  return (
    <div className="space-y-4 px-4 animate-enter" aria-label="Loading profile">
      <Skeleton className="h-5 w-32" />
      <SkeletonCard className="min-h-48" />
    </div>
  );
}
