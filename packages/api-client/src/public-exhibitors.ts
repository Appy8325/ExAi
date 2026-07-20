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
  privacyPolicyUrl: string | null;
  resources: Array<{
    id: string;
    title: string;
    sourceType: string;
    href: string;
    external: boolean;
  }>;
  leadForm: null | {
    name: string;
    description: string | null;
    consentText: string | null;
    fields: Array<{
      key: string;
      label: string;
      type: string;
      required: boolean;
      placeholder: string | null;
      helpText: string | null;
      validation: unknown;
    }>;
  };
};

export type BoothChatResponse = {
  answer: string;
  citations: Array<{
    marker: string;
    documentId: string;
    title: string;
    href: string;
  }>;
};

export type BoothSubmissionResponse = {
  submissionId: string;
  accepted: boolean;
  recommendations: Array<{ title: string; reason: string }>;
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

export type OrganizerAnalytics = {
  organizationId: string;
  event: { id: string; name: string; status: string; timezone: string };
  generatedAt: string;
  traffic: {
    capturedVisits: number;
    uniqueVisitors: number;
    returningVisitors: number;
  };
  conversions: { leads: number; conversionRate: number };
  engagement: {
    repeatEngagementRate: number;
    averageInteractions: number;
    analyzedLeads: number;
  };
  booths: Array<{
    id: string;
    name: string;
    boothNumber: string | null;
    visits: number;
    leads: number;
    uniqueVisitors: number;
    conversionRate: number;
    heat: number;
  }>;
  industries: Array<{ name: string; count: number }>;
  topics: Array<{ name: string; count: number }>;
};

export type OrganizerReport = {
  id: string;
  eventId: string;
  status: "processing" | "complete" | "failed";
  content: string | null;
  generatedAt: string | null;
  model: string | null;
  metricsSnapshot: OrganizerAnalytics;
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
  publicQrToken: string,
  email: string,
) {
  return publicRequest<{ id: string }>(
    client,
    `/v1/public/booths/${encodeURIComponent(publicQrToken)}/enroll`,
    {
      method: "POST",
      body: JSON.stringify({ email }),
    },
  );
}

export function getDemoBoothQr(
  client: PublicApiClient,
  eventId: string,
  exhibitorId: string,
) {
  return publicRequest<{ publicQrToken: string }>(
    client,
    `/v1/public/events/${encodeURIComponent(eventId)}/exhibitors/${encodeURIComponent(exhibitorId)}/demo-qr`,
  );
}

export type PublicDemoOverview = {
  organizers: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  events: Array<{
    id: string;
    name: string;
    slug: string;
    organizerOrganizationId: string;
    startAt: string;
    endAt: string;
    timezone: string;
    status: string;
    exhibitors: Array<{
      id: string;
      organizationId: string;
      companyName: string;
      boothName: string;
      boothNumber: string | null;
      publicQrToken: string | null;
    }>;
  }>;
  exhibitorOrganizations: Array<{
    id: string;
    name: string;
    slug: string;
    events: Array<{ eventId: string; eventSlug: string; eventExhibitorId: string }>;
  }>;
  relationships: Array<{
    id: string;
    organizationId: string;
    eventExhibitorId: string;
    attendeeEmail: string | null;
  }>;
  demoAccounts: Array<{
    role: "organizer" | "exhibitor" | "attendee";
    email: string;
    fullName: string;
  }>;
};

export type PublicDemoAnalytics = {
  organizationId: string;
  event: { id: string; name: string; status: string; timezone: string };
  generatedAt: string;
  traffic: { capturedVisits: number; uniqueVisitors: number; returningVisitors: number };
  conversions: { leads: number; conversionRate: number };
  engagement: { repeatEngagementRate: number; averageInteractions: number; analyzedLeads: number };
  booths: Array<{
    id: string; name: string; boothNumber: string | null;
    visits: number; leads: number; uniqueVisitors: number;
    conversionRate: number; heat: number;
  }>;
  industries: Array<{ name: string; count: number }>;
  topics: Array<{ name: string; count: number }>;
};

export type PublicDemoExhibitorDashboard = {
  performance: {
    qrScans: number; relationshipsCreated: number; returningVisitors: number;
    profileCompletion: number; formCompletionRate: number;
  };
  pipeline: { new: number; active: number; returning: number; needsFollowUp: number };
  recentActivity: Array<{ id: string; at: string; type: string; relationshipId: string; label: string }>;
  attention: Array<{ relationshipId: string; attendeeName: string; reasons: string[] }>;
  intelligenceFeed: {
    profilesEnriched: number; completeProfiles: number;
    sinceLastVisited: { since: string; newRelationships: number; profilesEnriched: number; returningVisitors: number; notesAdded: number; completeProfiles: number };
    items: Array<{ id: string; at: string; label: string }>;
  };
  boothInfo: { companyName: string; sourceCount: number };
};

export function getPublicDemoOverview(client: PublicApiClient) {
  return publicRequest<PublicDemoOverview>(client, "/v1/public/demo");
}

export function getPublicDemoAnalytics(client: PublicApiClient, eventId: string) {
  return publicRequest<PublicDemoAnalytics>(
    client,
    `/v1/public/demo/analytics/${encodeURIComponent(eventId)}`,
  );
}

export function getPublicDemoExhibitorDashboard(client: PublicApiClient, eventExhibitorId: string) {
  return publicRequest<PublicDemoExhibitorDashboard>(
    client,
    `/v1/public/demo/exhibitor/${encodeURIComponent(eventExhibitorId)}/dashboard`,
  );
}

export function chatAtBooth(
  client: PublicApiClient,
  publicQrToken: string,
  question: string,
) {
  return publicRequest<BoothChatResponse>(
    client,
    `/v1/public/booths/${encodeURIComponent(publicQrToken)}/chat`,
    { method: "POST", body: JSON.stringify({ question }) },
  );
}

export function submitBoothLead(
  client: RelationshipWorkspaceClient,
  publicQrToken: string,
  idempotencyKey: string,
  responses: Record<string, unknown>,
) {
  return request<BoothSubmissionResponse>(
    client,
    `/v1/public/booths/${encodeURIComponent(publicQrToken)}/submissions`,
    {
      method: "POST",
      headers: { "idempotency-key": idempotencyKey },
      body: JSON.stringify({ responses }),
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

export function getOrganizerAnalytics(
  client: RelationshipWorkspaceClient,
  eventId: string,
) {
  return request<OrganizerAnalytics>(
    client,
    `/v1/organizer/events/${encodeURIComponent(eventId)}/analytics`,
  );
}

export function getOrganizerReport(
  client: RelationshipWorkspaceClient,
  eventId: string,
) {
  return request<OrganizerReport | null>(
    client,
    `/v1/organizer/events/${encodeURIComponent(eventId)}/report`,
  );
}

export function generateOrganizerReport(
  client: RelationshipWorkspaceClient,
  eventId: string,
  idempotencyKey: string,
) {
  return request<OrganizerReport>(
    client,
    `/v1/organizer/events/${encodeURIComponent(eventId)}/report`,
    { method: "POST", headers: { "idempotency-key": idempotencyKey } },
  );
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
