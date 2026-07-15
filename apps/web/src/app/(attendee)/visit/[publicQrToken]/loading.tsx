import { Skeleton } from "@concourse/ui";

export default function BoothLoading() {
  return <main className="mx-auto min-h-screen max-w-(--mq-attendee-content-max) bg-canvas px-gutter py-section"><div className="space-y-5 rounded-md border border-default bg-surface p-(--spacing-card-p)"><Skeleton className="h-16 w-16" /><Skeleton className="h-8 w-2/3" /><Skeleton className="h-5 w-full" /><Skeleton className="h-11 w-full" /></div></main>;
}
