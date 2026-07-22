import Link from "next/link";

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href="qr"
        className="inline-flex h-10 items-center rounded-lg bg-primary px-5 text-body-sm font-semibold text-on-brand transition-colors hover:bg-primary-hover"
      >
        Share QR Code
      </Link>
      <Link
        href="visitors"
        className="inline-flex h-10 items-center rounded-lg border border-default bg-surface px-5 text-body-sm font-semibold text-primary transition-colors hover:bg-sunken"
      >
        View Visitors
      </Link>
      <Link
        href="products"
        className="inline-flex h-10 items-center rounded-lg border border-default bg-surface px-5 text-body-sm font-semibold text-primary transition-colors hover:bg-sunken"
      >
        Manage Products
      </Link>
      <Link
        href="settings"
        className="inline-flex h-10 items-center rounded-lg border border-default bg-surface px-5 text-body-sm font-semibold text-primary transition-colors hover:bg-sunken"
      >
        Event Settings
      </Link>
    </div>
  );
}