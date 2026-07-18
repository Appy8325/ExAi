import type { RelationshipWorkspaceClient } from "./relationship-workspace";
import { ApiError } from "./relationship-workspace";

type PublicApiClient = Pick<RelationshipWorkspaceClient, "baseUrl" | "fetch">;

export type PublicBooth = {
  id: string;
  companyName: string;
  boothName: string;
  boothNumber: string | null;
  logoUrl: string | null;
  description: string | null;
  website: string | null;
  eventSlug: string;
};

export type PublicEvent = {
  id: string;
  name: string;
  slug: string;
};

export type PublicExhibitor = {
  id: string;
  organizationId: string;
  companyName: string;
  boothName: string;
  boothNumber: string | null;
  logoUrl: string | null;
  description: string | null;
  website: string | null;
  socialLinks: Record<string, string>;
  contactEmail: string | null;
  contactPhone: string | null;
};

export type SavedRelationship = {
  relationshipId: string;
  status: string;
  createdAt: string;
  exhibitor: {
    id: string;
    companyName: string;
    boothName: string;
    boothNumber: string | null;
    logoUrl: string | null;
    description: string | null;
  };
};

export type OrganizerOverview = {
  organizationId: string;
  organizationName: string;
  totals: {
    events: number;
    exhibitors: number;
    attendees: number;
    relationships: number;
  };
  events: Array<{
    id: string;
    name: string;
    slug: string;
    startAt: string;
    endAt: string;
    timezone: string;
    status: string;
    privacyPolicyUrl: string | null;
    logoUrl: string | null;
    primaryColor: string;
    exhibitors: number;
    attendees: number;
    relationships: number;
  }>;
};

export function getPublicEventBySlug(client: PublicApiClient, slug: string) {
  return publicRequest<PublicEvent>(
    client,
    `/v1/public/events/slug/${encodeURIComponent(slug)}`,
  );
}

export function getPublicBooth(client: PublicApiClient, qrToken: string) {
  return publicRequest<PublicBooth>(
    client,
    `/v1/public/booths/${encodeURIComponent(qrToken)}`,
  );
}

export function getEventExhibitors(
  client: PublicApiClient,
  eventId: string,
  search?: string,
) {
  const params = search ? `?search=${encodeURIComponent(search)}` : "";
  return publicRequest<PublicExhibitor[]>(
    client,
    `/v1/public/events/${encodeURIComponent(eventId)}/exhibitors${params}`,
  );
}

export function getEventExhibitor(
  client: PublicApiClient,
  eventId: string,
  exhibitorId: string,
) {
  return publicRequest<PublicExhibitor>(
    client,
    `/v1/public/events/${encodeURIComponent(eventId)}/exhibitors/${encodeURIComponent(exhibitorId)}`,
  );
}

export function getSavedRelationships(
  client: RelationshipWorkspaceClient,
  eventId: string,
) {
  return request<SavedRelationship[]>(
    client,
    `/v1/attendee/relationships?eventId=${encodeURIComponent(eventId)}`,
  );
}

export function saveExhibitor(
  client: RelationshipWorkspaceClient,
  exhibitorId: string,
) {
  return request<{ relationshipId: string; saved: boolean }>(
    client,
    `/v1/attendee/relationships/${encodeURIComponent(exhibitorId)}`,
    { method: "POST" },
  );
}

export function unsaveExhibitor(
  client: RelationshipWorkspaceClient,
  exhibitorId: string,
) {
  return request<{ saved: boolean }>(
    client,
    `/v1/attendee/relationships/${encodeURIComponent(exhibitorId)}`,
    { method: "DELETE" },
  );
}

export function enrollAtBooth(
  client: PublicApiClient,
  boothId: string,
  email: string,
) {
  return publicRequest<{ id: string }>(
    client,
    `/v1/public/booths/${encodeURIComponent(boothId)}/enroll`,
    {
      method: "POST",
      body: JSON.stringify({ email }),
    },
  );
}

export function updateAttendeeProfile(
  client: RelationshipWorkspaceClient,
  body: AttendeeProfileUpdate,
) {
  return request<AttendeeProfileUpdate>(client, `/v1/attendee/profile`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function getOrganizerOverview(client: RelationshipWorkspaceClient) {
  return request<OrganizerOverview>(client, "/v1/organizer/overview");
}

type AttendeeProfileUpdate = {
  fullName: string;
  company: string;
  jobTitle: string;
  shareProfileWithExhibitors: boolean;
};

async function request<T>(
  client: RelationshipWorkspaceClient,
  path: string,
  init: RequestInit = {},
) {
  const response = await (client.fetch ?? fetch)(`${client.baseUrl}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${client.accessToken}`,
      ...(init.body == null ? {} : { "content-type": "application/json" }),
      ...init.headers,
    },
  });
  if (!response.ok) throw new ApiError(response.status);
  return response.json() as Promise<T>;
}

async function publicRequest<T>(
  client: PublicApiClient,
  path: string,
  init: RequestInit = {},
) {
  const response = await (client.fetch ?? fetch)(`${client.baseUrl}${path}`, {
    ...init,
    headers: {
      ...(init.body == null ? {} : { "content-type": "application/json" }),
      ...init.headers,
    },
  });
  if (!response.ok) throw new ApiError(response.status);
  return response.json() as Promise<T>;
}
