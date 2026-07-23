import { PageHeader } from "@concourse/ui";

export default async function EventSectionPage({ params }: { params: Promise<{ section?: string[] }> }) {
  const { section } = await params;
  const title = section?.[0] ? `${section[0][0]!.toUpperCase()}${section[0].slice(1)}` : "Event";
  return <div className="space-y-6"><PageHeader title={title} description={`${title} management is available in a later approved phase.`} /><div className="rounded-xl border border-default bg-surface p-6 text-body text-secondary">Coming soon.</div></div>;
}
