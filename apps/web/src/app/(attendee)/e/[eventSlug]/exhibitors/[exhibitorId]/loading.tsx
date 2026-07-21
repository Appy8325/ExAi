import { Skeleton } from "@concourse/ui";

export default function ExhibitorDetailLoading() {
  return (
    <div className="space-y-4 px-4 animate-enter" aria-label="Loading exhibitor">
      <Skeleton className="h-5 w-20" />
      <div className="space-y-4 rounded-xl border border-default bg-surface p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="size-14 rounded-xl" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-16 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1 rounded-lg" />
          <Skeleton className="h-9 flex-1 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
