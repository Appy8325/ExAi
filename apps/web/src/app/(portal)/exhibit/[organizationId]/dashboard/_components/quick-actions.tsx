import Link from "next/link";

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href="/exhibit"
        className="inline-flex h-10 items-center rounded-lg border border-default bg-surface px-4 text-caption font-medium text-primary transition-colors hover:bg-sunken"
      >
        View dashboard
      </Link>
    </div>
  );
}