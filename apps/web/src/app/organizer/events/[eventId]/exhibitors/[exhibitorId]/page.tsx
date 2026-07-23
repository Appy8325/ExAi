import { loadOrganizerOverview } from "@/lib/organizer";
import ExhibitorDetailClient from "./exhibitor-detail-client";

export default async function ExhibitorDetailPage({ params }: { params: Promise<{ eventId: string; exhibitorId: string }> }) {
  const [{ eventId, exhibitorId }, overview] = await Promise.all([params, loadOrganizerOverview()]);

  return <ExhibitorDetailClient eventId={eventId} exhibitorId={exhibitorId} organizationId={overview?.organizationId ?? ""} />;
}
