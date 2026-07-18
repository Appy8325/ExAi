import { getOrganizerOverview } from "@concourse/api-client";

import { getApiBaseUrl } from "@/lib/api/config";
import { createClient } from "@/lib/supabase/server";

export async function loadOrganizerOverview() {
  const {
    data: { session },
  } = await (await createClient()).auth.getSession();
  if (!session) return undefined;
  try {
    return await getOrganizerOverview({
      baseUrl: getApiBaseUrl(),
      accessToken: session.access_token,
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    });
  } catch {
    return undefined;
  }
}

export async function loadOrganizationMembers(organizationId: string) {
  return organizerRequest<
    Array<{
      id: string;
      userId: string;
      email: string;
      fullName: string;
      role: string;
      status: string;
      joinedAt: string;
    }>
  >(`/v1/organizations/${encodeURIComponent(organizationId)}/members`);
}

export async function loadExhibitorInvitations(
  organizationId: string,
  eventId: string,
) {
  return organizerRequest<
    Array<{
      id: string;
      email: string;
      companyName: string;
      expiresAt: string;
      status: string;
    }>
  >(
    `/v1/organizations/${encodeURIComponent(organizationId)}/events/${encodeURIComponent(eventId)}/exhibitor-invitations`,
  );
}

async function organizerRequest<T>(path: string): Promise<T | undefined> {
  const {
    data: { session },
  } = await (await createClient()).auth.getSession();
  if (!session) return undefined;
  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      headers: { authorization: `Bearer ${session.access_token}` },
      cache: "no-store",
    });
    if (!response.ok) return undefined;
    return response.json() as Promise<T>;
  } catch {
    return undefined;
  }
}
