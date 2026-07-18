import {
  ApiError,
  type RelationshipWorkspaceClient,
} from "./relationship-workspace";

export type ExhibitorOverviewItem = {
  organizationId: string;
  organizationName: string;
  eventExhibitorId: string;
  eventName: string;
  boothName: string;
  status: string;
};

export type ExhibitorLeadField = {
  key: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  sortOrder: number;
};

export type ExhibitorWorkspace = {
  organization: { id: string; name: string; websiteUrl: string | null };
  event: { id: string; name: string; status: string };
  booth: {
    id: string;
    boothName: string;
    boothNumber: string | null;
    logoUrl: string | null;
    bannerUrl: string | null;
    primaryColor: string;
    description: string | null;
    website: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    status: string;
    publishedAt: string | null;
  };
  sources: Array<{
    id: string;
    sourceType: string;
    title: string;
    sourceUrl: string | null;
    status: string;
    fileStatus: string | null;
    contentType: string | null;
    byteSize: number | null;
  }>;
  leadForm: {
    id: string;
    name: string;
    description: string | null;
    consentText: string | null;
    version: number;
    status: string;
    fields: ExhibitorLeadField[];
  } | null;
  qr: ExhibitorQr | null;
};

export type ExhibitorQr = {
  publicToken: string;
  publicUrl: string;
  imageDataUrl: string;
  createdAt: string;
};

export function getExhibitorOverview(client: RelationshipWorkspaceClient) {
  return request<ExhibitorOverviewItem[]>(client, "/v1/exhibitor/overview");
}

export function getExhibitorWorkspace(
  client: RelationshipWorkspaceClient,
  organizationId: string,
  eventExhibitorId: string,
) {
  return request<ExhibitorWorkspace>(
    client,
    base(organizationId, eventExhibitorId),
  );
}

export function updateExhibitorBooth(
  client: RelationshipWorkspaceClient,
  organizationId: string,
  eventExhibitorId: string,
  body: Record<string, string | null>,
) {
  return request(client, `${base(organizationId, eventExhibitorId)}/booth`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function createExhibitorSource(
  client: RelationshipWorkspaceClient,
  organizationId: string,
  eventExhibitorId: string,
  body: {
    sourceType: string;
    title: string;
    sourceUrl?: string;
    filename?: string;
    contentType?: string;
    byteSize?: number;
  },
) {
  return request<{
    source: { id: string };
    upload: { url: string; path: string } | null;
  }>(client, `${base(organizationId, eventExhibitorId)}/sources`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function completeExhibitorSource(
  client: RelationshipWorkspaceClient,
  organizationId: string,
  eventExhibitorId: string,
  sourceId: string,
) {
  return request(
    client,
    `${base(organizationId, eventExhibitorId)}/sources/${encodeURIComponent(sourceId)}/complete`,
    { method: "POST" },
  );
}

export function removeExhibitorSource(
  client: RelationshipWorkspaceClient,
  organizationId: string,
  eventExhibitorId: string,
  sourceId: string,
) {
  return request(
    client,
    `${base(organizationId, eventExhibitorId)}/sources/${encodeURIComponent(sourceId)}`,
    { method: "DELETE" },
  );
}

export function saveExhibitorLeadForm(
  client: RelationshipWorkspaceClient,
  organizationId: string,
  eventExhibitorId: string,
  body: {
    name: string;
    description: string;
    consentText: string;
    fields: ExhibitorLeadField[];
  },
) {
  return request(
    client,
    `${base(organizationId, eventExhibitorId)}/lead-form`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    },
  );
}

export function publishExhibitorLeadForm(
  client: RelationshipWorkspaceClient,
  organizationId: string,
  eventExhibitorId: string,
) {
  return request(
    client,
    `${base(organizationId, eventExhibitorId)}/lead-form/publish`,
    { method: "POST" },
  );
}

export function publishExhibitorBooth(
  client: RelationshipWorkspaceClient,
  organizationId: string,
  eventExhibitorId: string,
) {
  return request(
    client,
    `${base(organizationId, eventExhibitorId)}/booth/publish`,
    { method: "POST" },
  );
}

export function generateExhibitorQr(
  client: RelationshipWorkspaceClient,
  organizationId: string,
  eventExhibitorId: string,
) {
  return request<ExhibitorQr>(
    client,
    `${base(organizationId, eventExhibitorId)}/qr`,
    { method: "POST" },
  );
}

function base(organizationId: string, eventExhibitorId: string) {
  return `/v1/organizations/${encodeURIComponent(organizationId)}/exhibitors/${encodeURIComponent(eventExhibitorId)}`;
}

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
  if (!response.ok) {
    const problem = (await response.json().catch(() => ({}))) as {
      message?: string;
    };
    throw new ApiError(response.status, problem.message);
  }
  return response.json() as Promise<T>;
}
