import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";

import { RequestContextInterceptor } from "../auth/request-context.interceptor";
import {
  SupabaseRequestContextGuard,
  type AuthenticatedRequest,
} from "../auth/supabase-request-context.guard";
import { OrganizationAuthorizationGuard } from "../organizations/organization-authorization.guard";
import { RequireOrganizationPermissions } from "../organizations/organization-permission.decorator";
import { AgendaSessionsService, CreateAgendaSessionInput, UpdateAgendaSessionInput } from "../agenda/agenda-sessions.service";

@Controller("v1/organizations/:organizationId/events/:eventId/sessions")
@UseGuards(SupabaseRequestContextGuard, OrganizationAuthorizationGuard)
@UseInterceptors(RequestContextInterceptor)
export class SessionsController {
  constructor(
    @Inject(AgendaSessionsService)
    private readonly sessions: AgendaSessionsService,
  ) {}

  @Get()
  @RequireOrganizationPermissions("organizations:read")
  list(
    @Param("organizationId") organizationId: string,
    @Param("eventId") eventId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.sessions.listByEvent(organizationId, eventId, request.requestContext!.principal.userId!);
  }

  @Post()
  @RequireOrganizationPermissions("organizations:update")
  create(
    @Param("organizationId") organizationId: string,
    @Param("eventId") eventId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: Omit<CreateAgendaSessionInput, "organizationId" | "actorUserId" | "eventId">,
  ) {
    return this.sessions.create({
      ...body,
      organizationId,
      actorUserId: request.requestContext!.principal.userId!,
      eventId,
    });
  }

  @Get(":sessionId")
  @RequireOrganizationPermissions("organizations:read")
  findById(
    @Param("organizationId") organizationId: string,
    @Param("eventId") eventId: string,
    @Param("sessionId") sessionId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.sessions.findById(organizationId, eventId, sessionId, request.requestContext!.principal.userId!);
  }

  @Patch(":sessionId")
  @RequireOrganizationPermissions("organizations:update")
  update(
    @Param("organizationId") organizationId: string,
    @Param("eventId") eventId: string,
    @Param("sessionId") sessionId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: Omit<UpdateAgendaSessionInput, "organizationId" | "actorUserId" | "eventId" | "sessionId">,
  ) {
    return this.sessions.update({
      ...body,
      organizationId,
      actorUserId: request.requestContext!.principal.userId!,
      eventId,
      sessionId,
    });
  }

  @Delete(":sessionId")
  @RequireOrganizationPermissions("organizations:update")
  archive(
    @Param("organizationId") organizationId: string,
    @Param("eventId") eventId: string,
    @Param("sessionId") sessionId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.sessions.archive(organizationId, eventId, sessionId, request.requestContext!.principal.userId!);
  }

  @Post(":sessionId/publish")
  @RequireOrganizationPermissions("organizations:update")
  publish(
    @Param("organizationId") organizationId: string,
    @Param("eventId") eventId: string,
    @Param("sessionId") sessionId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.sessions.publish(organizationId, eventId, sessionId, request.requestContext!.principal.userId!);
  }

  @Post(":sessionId/unpublish")
  @RequireOrganizationPermissions("organizations:update")
  unpublish(
    @Param("organizationId") organizationId: string,
    @Param("eventId") eventId: string,
    @Param("sessionId") sessionId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.sessions.unpublish(organizationId, eventId, sessionId, request.requestContext!.principal.userId!);
  }
}
