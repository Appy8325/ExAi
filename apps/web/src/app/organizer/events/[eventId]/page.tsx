import { loadOrganizerOverview } from "@/lib/organizer";
import { EventDashboardClient } from "./persisted-dashboard";
export default async function EventDashboard({ params }: { params: Promise<{ eventId:string }> }) { const { eventId }=await params; const overview=await loadOrganizerOverview(); return <EventDashboardClient organizationId={overview?.organizationId ?? ""} eventId={eventId}/>; }
