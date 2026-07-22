import { PageTabs } from "@/components/navigation";

export default async function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  const tabs = [
    { id: "overview", label: "Overview", href: `/org/events/${eventId}` },
    { id: "exhibitors", label: "Exhibitors", href: `/org/events/${eventId}/exhibitors` },
    { id: "reports", label: "Reports", href: `/org/events/${eventId}/reports` },
    { id: "settings", label: "Settings", href: `/org/events/${eventId}/settings` },
  ];

  return (
    <div className="space-y-6">
      <PageTabs tabs={tabs} />
      {children}
    </div>
  );
}
