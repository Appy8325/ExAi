import Link from "next/link";
import { getEventExhibitor } from "@concourse/api-client";
import { getApiBaseUrl } from "@/lib/api/config";

export default async function ExhibitorPage({ params }: { params: Promise<{ eventId: string; exhibitorId: string }> }) {
  const { eventId, exhibitorId } = await params;
  let exhibitor: Awaited<ReturnType<typeof getEventExhibitor>> | undefined;
  try { exhibitor = await getEventExhibitor({ baseUrl: getApiBaseUrl(), fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) }, eventId, exhibitorId); } catch { /* unavailable state below */ }
  if (!exhibitor) return <p className="rounded-xl border border-default bg-surface p-6 text-secondary">Exhibitor unavailable.</p>;
  return <div className="space-y-6"><Link href={`/org/events/${eventId}/exhibitors`} className="text-sm text-secondary hover:text-primary">← Back to exhibitors</Link><header><h1 className="text-2xl font-semibold text-primary">{exhibitor.companyName}</h1><p className="mt-1 text-secondary">{exhibitor.boothName}{exhibitor.boothNumber ? ` · Booth ${exhibitor.boothNumber}` : ""}</p></header>{exhibitor.description ? <section className="rounded-xl border border-default bg-surface p-5"><h2 className="font-semibold text-primary">Profile</h2><p className="mt-2 text-secondary">{exhibitor.description}</p></section> : null}{exhibitor.website ? <a href={exhibitor.website} rel="noreferrer" target="_blank" className="text-brand hover:underline">Visit exhibitor website</a> : null}</div>;
}
