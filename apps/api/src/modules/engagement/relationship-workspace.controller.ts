import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { RequestContextInterceptor } from "../auth/request-context.interceptor";
import { SupabaseRequestContextGuard, type AuthenticatedRequest } from "../auth/supabase-request-context.guard";
import { OrganizationAuthorizationGuard } from "../organizations/organization-authorization.guard";
import { RequireOrganizationPermissions } from "../organizations/organization-permission.decorator";
import { RelationshipNotesService } from "./relationship-notes.service";
import { RelationshipWorkspaceService } from "./relationship-workspace.service";

@Controller("v1/organizations/:organizationId")
@UseGuards(SupabaseRequestContextGuard, OrganizationAuthorizationGuard)
@UseInterceptors(RequestContextInterceptor)
export class RelationshipWorkspaceController {
  constructor(private readonly workspace: RelationshipWorkspaceService, private readonly notes: RelationshipNotesService) {}

  @Get("relationships/:relationshipId")
  @RequireOrganizationPermissions("organizations:read")
  find(@Param("relationshipId") relationshipId: string, @Req() request: AuthenticatedRequest) {
    return this.workspace.find(request.requestContext!.orgId!, relationshipId, request.requestContext!.principal.userId!);
  }

  @Post("relationships/:relationshipId/notes")
  @RequireOrganizationPermissions("organizations:update")
  createNote(@Param("relationshipId") relationshipId: string, @Body() body: { body: string }, @Req() request: AuthenticatedRequest) {
    return this.notes.create({ organizationId: request.requestContext!.orgId!, actorUserId: request.requestContext!.principal.userId!, relationshipId, body: body.body });
  }

  @Patch("relationship-notes/:noteId")
  @RequireOrganizationPermissions("organizations:update")
  updateNote(@Param("noteId") noteId: string, @Body() body: { body: string }, @Req() request: AuthenticatedRequest) {
    return this.notes.update({ organizationId: request.requestContext!.orgId!, actorUserId: request.requestContext!.principal.userId!, noteId, body: body.body });
  }

  @Delete("relationship-notes/:noteId")
  @RequireOrganizationPermissions("organizations:update")
  archiveNote(@Param("noteId") noteId: string, @Req() request: AuthenticatedRequest) {
    return this.notes.archive({ organizationId: request.requestContext!.orgId!, actorUserId: request.requestContext!.principal.userId!, noteId });
  }
}
