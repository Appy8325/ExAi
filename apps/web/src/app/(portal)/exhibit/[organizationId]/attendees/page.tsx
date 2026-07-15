import { Suspense } from "react";
import { getExhibitorDashboard } from "@concourse/api-client";
import { createClient } from "@/lib/supabase/server";
import { getApiBaseUrl } from "@/lib/api/config";
import { AttendeeListScreen } from "./attendee-list-screen";

export default function AttendeesPage({ params, searchParams }: { params: Promise<{ organizationId: string }>; searchParams: Promise<{ eeId?: string }> }) {
  return <Suspense fallback={<AttendeesLoading />}><Attendees params={params} searchParams={searchParams} /></Suspense>;
}

async function Attendees({ params, searchParams }: { params: Promise<{ organizationId: string }>; searchParams: Promise<{ eeId?: string }> }) {
  const { organizationId } = await params;
  const { eeId } = await searchParams;
  const { data: { session } } = await (await createClient()).auth.getSession();
  if (!session) return <Message title="Sign in required" detail="Sign in to view attendees." />;
  if (!eeId) return <Message title="No dashboard context" detail="Navigate from your exhibitor dashboard to view attendees." />;
  try {
    const dashboard = await getExhibitorDashboard(
      { baseUrl: getApiBaseUrl(), accessToken: session.access_token, fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
      organizationId,
      eeId
    );
    return <AttendeeListScreen dashboard={dashboard} organizationId={organizationId} />;
  } catch {
    return <Message title="Unable to load attendees" detail="Could not load attendee data." />;
  }
}

function AttendeesLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="h-8 w-48 animate-pulse rounded bg-sunken" />
      <div className="h-12 w-full animate-pulse rounded-xl bg-sunken" />
      <div className="space-y-3">{Array.from({ length: 5 }, (_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-sunken" />)}</div>
    </div>
  );
}

function Message({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl items-center p-6">
      <section className="w-full rounded-xl border border-default bg-surface p-6">
        <h1 className="text-title-sm font-semibold text-primary">{title}</h1>
        <p className="mt-2 text-body text-secondary">{detail}</p>
      </section>
    </div>
  );
}
