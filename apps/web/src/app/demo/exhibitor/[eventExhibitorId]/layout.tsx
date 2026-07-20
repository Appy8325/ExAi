import Link from "next/link";

export default async function DemoExhibitorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ eventExhibitorId: string }>;
}) {
  const { eventExhibitorId } = await params;

  const nav = [
    { label: "Dashboard", href: `/demo/exhibitor/${eventExhibitorId}` },
    { label: "Booth profile", href: `/demo/exhibitor/${eventExhibitorId}/booth` },
    { label: "Documents", href: `/demo/exhibitor/${eventExhibitorId}/documents` },
    { label: "Analytics", href: `/demo/exhibitor/${eventExhibitorId}/analytics` },
    { label: "AI Insights", href: `/demo/exhibitor/${eventExhibitorId}/ai-insights` },
    { label: "Booth QR", href: `/demo/exhibitor/${eventExhibitorId}/qr` },
  ];

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl">
      <aside className="hidden w-56 shrink-0 border-r border-default px-4 py-8 sm:block">
        <Link href="/demo/exhibitor" className="mb-6 inline-flex items-center gap-1 text-xs text-link hover:underline">
          <svg className="size-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 12l-4-4 4-4" />
          </svg>
          All exhibitors
        </Link>
        <nav className="mt-4 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm text-secondary transition-colors hover:bg-sunken hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        {children}
      </div>
    </div>
  );
}
