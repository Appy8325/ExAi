import type { ExecutionContext } from "@nestjs/common";
import { ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { lastValueFrom, of } from "rxjs";

const supabase = vi.hoisted(() => ({ getUser: vi.fn(), createClient: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({ createClient: supabase.createClient }));
vi.mock("@concourse/database", () => ({}));

import { requestContextStorage } from "../../common/request-context";
import { SupabaseRequestContextGuard, type AuthenticatedRequest } from "../auth/supabase-request-context.guard";
import { RequestContextInterceptor } from "../auth/request-context.interceptor";
import { OrganizationAuthorizationGuard } from "../organizations/organization-authorization.guard";
import { RelationshipWorkspaceController } from "./relationship-workspace.controller";

const projection = { attendee: { id: "attendee", name: null, company: null, title: null, industry: null, contact: { email: null, linkedInUrl: null }, profileCompleteness: 0, consentStatus: "not_shared" as const }, relationship: { id: "relationship", eventExhibitorId: "exhibitor", status: "active", firstInteractionAt: "2026-01-01T00:00:00.000Z", latestInteractionAt: "2026-01-01T00:00:00.000Z", interactionCount: 1, hasPotentialDuplicate: false, updatedAt: "2026-01-01T00:00:00.000Z" }, timeline: [], notes: [], summary: { interactionCount: 1, lastActivityAt: "2026-01-01T00:00:00.000Z", noteCount: 0, profileCompleteness: 0 } };

function request(organizationId = "org-id"): AuthenticatedRequest {
  return { id: "request-id", headers: { authorization: "Bearer verified-token" }, params: { organizationId } };
}

function executionContext(value: AuthenticatedRequest): ExecutionContext {
  return { getClass: () => class {}, getHandler: () => () => undefined, switchToHttp: () => ({ getRequest: () => value }) } as unknown as ExecutionContext;
}

describe("Relationship Workspace transport", () => {
  it("authenticates, propagates verified context, authorizes once, and returns the unreshaped consent-filtered projection", async () => {
    const req = request();
    const resolveOrganizationPermissions = vi.fn().mockResolvedValue({ role: "org:admin", permissions: ["organizations:read", "organizations:update"] });
    supabase.getUser.mockResolvedValue({ data: { user: { id: "user-id" } }, error: null });
    supabase.createClient.mockReturnValue({ auth: { getUser: supabase.getUser } });
    const auth = new SupabaseRequestContextGuard({ get: (key: string) => key === "supabase.url" ? "https://supabase.example" : "service-key" } as never, { resolveOrganizationPermissions } as never);
    const authorize = new OrganizationAuthorizationGuard({ getAllAndOverride: () => ["organizations:read"] } as never, { resolveOrganizationPermissions } as never);
    const find = vi.fn(() => projection);
    const controller = new RelationshipWorkspaceController({ find } as never, {} as never);

    await auth.canActivate(executionContext(req));
    await authorize.canActivate(executionContext(req));
    expect(controller.find("relationship-id", req)).toMatchObject(projection);
    expect(find).toHaveBeenCalledWith("org-id", "relationship-id", "user-id");
    expect(resolveOrganizationPermissions).toHaveBeenCalledTimes(1);
    await expect(lastValueFrom(new RequestContextInterceptor().intercept(executionContext(req), { handle: () => of(requestContextStorage.getStore()) }))).resolves.toMatchObject({ orgId: "org-id", principal: { userId: "user-id" }, membership: { role: "org:admin" } });
  });

  it("rejects unauthenticated and cross-organization access before the controller", async () => {
    const resolveOrganizationPermissions = vi.fn().mockResolvedValue({ permissions: [] });
    supabase.getUser.mockResolvedValue({ data: { user: null }, error: new Error("invalid") });
    supabase.createClient.mockReturnValue({ auth: { getUser: supabase.getUser } });
    const auth = new SupabaseRequestContextGuard({ get: () => "value" } as never, { resolveOrganizationPermissions } as never);
    await expect(auth.canActivate(executionContext(request()))).rejects.toBeInstanceOf(UnauthorizedException);
    supabase.getUser.mockResolvedValue({ data: { user: { id: "user-id" } }, error: null });
    await expect(auth.canActivate(executionContext(request("other-org")))).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("delegates note mutations with server-derived organization and actor values", async () => {
    const req = request();
    req.requestContext = { requestId: "request-id", traceId: "request-id", principal: { kind: "session", userId: "user-id" }, orgId: "org-id", membership: { role: "org:admin", permissions: ["organizations:update"] } };
    const notes = { create: vi.fn(), update: vi.fn(), archive: vi.fn() };
    const controller = new RelationshipWorkspaceController({} as never, notes as never);

    controller.createNote("relationship-id", { body: "Note" }, req);
    controller.updateNote("note-id", { body: "Updated" }, req);
    controller.archiveNote("note-id", req);
    expect(notes.create).toHaveBeenCalledWith({ organizationId: "org-id", actorUserId: "user-id", relationshipId: "relationship-id", body: "Note" });
    expect(notes.update).toHaveBeenCalledWith({ organizationId: "org-id", actorUserId: "user-id", noteId: "note-id", body: "Updated" });
    expect(notes.archive).toHaveBeenCalledWith({ organizationId: "org-id", actorUserId: "user-id", noteId: "note-id" });
  });
});
