import { loadOrganizerOverview } from "@/lib/organizer";
import { EventsClient } from "./events-client";
export default async function EventsPage() { const overview = await loadOrganizerOverview(); return <EventsClient organizationId={overview?.organizationId ?? ""} events={overview?.events ?? []} />; }
