import type { ExhibitorDashboard, RelationshipWorkspace } from "@concourse/api-contract";

export type { RelationshipWorkspace } from "@concourse/api-contract";
export type { ExhibitorDashboard } from "@concourse/api-contract";

export type RelationshipWorkspaceClient = { baseUrl: string; accessToken: string; fetch?: typeof fetch };

export class ApiError extends Error {
  constructor(readonly status: number) { super(`API request failed: ${status}`); }
}

export async function getRelationshipWorkspace(client: RelationshipWorkspaceClient, organizationId: string, relationshipId: string) {
  return request<RelationshipWorkspace>(client, `/v1/organizations/${organizationId}/relationships/${relationshipId}`);
}

export async function getExhibitorDashboard(client: RelationshipWorkspaceClient, organizationId: string, eventExhibitorId: string) {
  return request<ExhibitorDashboard>(client, `/v1/organizations/${organizationId}/exhibitors/${eventExhibitorId}/dashboard`);
}

export function createRelationshipNote(client: RelationshipWorkspaceClient, organizationId: string, relationshipId: string, body: string) {
  return request(client, `/v1/organizations/${organizationId}/relationships/${relationshipId}/notes`, { method: "POST", body: JSON.stringify({ body }) });
}

export function updateRelationshipNote(client: RelationshipWorkspaceClient, organizationId: string, noteId: string, body: string) {
  return request(client, `/v1/organizations/${organizationId}/relationship-notes/${noteId}`, { method: "PATCH", body: JSON.stringify({ body }) });
}

export function archiveRelationshipNote(client: RelationshipWorkspaceClient, organizationId: string, noteId: string) {
  return request(client, `/v1/organizations/${organizationId}/relationship-notes/${noteId}`, { method: "DELETE" });
}

async function request<T>(client: RelationshipWorkspaceClient, path: string, init: RequestInit = {}) {
  const response = await (client.fetch ?? fetch)(`${client.baseUrl}${path}`, { ...init, headers: { authorization: `Bearer ${client.accessToken}`, "content-type": "application/json", ...init.headers } });
  if (!response.ok) throw new ApiError(response.status);
  return response.json() as Promise<T>;
}
