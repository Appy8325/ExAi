import { getApiBaseUrl } from "@/lib/api/config";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const {
    data: { session },
  } = await (await createClient()).auth.getSession();
  if (!session) return new Response("Authentication required", { status: 401 });
  const response = await fetch(
    `${getApiBaseUrl()}/v1/organizer/events/${encodeURIComponent(eventId)}/report.pdf`,
    {
      headers: { authorization: `Bearer ${session.access_token}` },
      cache: "no-store",
    },
  );
  if (!response.ok)
    return new Response("Completed report not found", {
      status: response.status,
    });
  return new Response(await response.arrayBuffer(), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="event-${eventId}-executive-report.pdf"`,
      "cache-control": "private, no-store",
    },
  });
}
