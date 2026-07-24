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
import { SpeakersService, CreateSpeakerInput, UpdateSpeakerInput } from "../agenda/speakers.service";

@Controller("v1/organizations/:organizationId/events/:eventId/speakers")
@UseGuards(SupabaseRequestContextGuard, OrganizationAuthorizationGuard)
@UseInterceptors(RequestContextInterceptor)
export class SpeakersController {
  constructor(
    @Inject(SpeakersService)
    private readonly speakers: SpeakersService,
  ) {}

  @Get()
  @RequireOrganizationPermissions("organizations:read")
  list(
    @Param("organizationId") organizationId: string,
    @Param("eventId") eventId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.speakers.listByEvent(organizationId, eventId, request.requestContext!.principal.userId!);
  }

  @Post()
  @RequireOrganizationPermissions("organizations:update")
  create(
    @Param("organizationId") organizationId: string,
    @Param("eventId") eventId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: Omit<CreateSpeakerInput, "organizationId" | "actorUserId" | "eventId">,
  ) {
    return this.speakers.create({
      ...body,
      organizationId,
      actorUserId: request.requestContext!.principal.userId!,
      eventId,
    });
  }

  @Get(":speakerId")
  @RequireOrganizationPermissions("organizations:read")
  findById(
    @Param("organizationId") organizationId: string,
    @Param("eventId") eventId: string,
    @Param("speakerId") speakerId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.speakers.findById(organizationId, eventId, speakerId, request.requestContext!.principal.userId!);
  }

  @Patch(":speakerId")
  @RequireOrganizationPermissions("organizations:update")
  update(
    @Param("organizationId") organizationId: string,
    @Param("eventId") eventId: string,
    @Param("speakerId") speakerId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: Omit<UpdateSpeakerInput, "organizationId" | "actorUserId" | "eventId" | "speakerId">,
  ) {
    return this.speakers.update({
      ...body,
      organizationId,
      actorUserId: request.requestContext!.principal.userId!,
      eventId,
      speakerId,
    });
  }

  @Delete(":speakerId")
  @RequireOrganizationPermissions("organizations:update")
  delete(
    @Param("organizationId") organizationId: string,
    @Param("eventId") eventId: string,
    @Param("speakerId") speakerId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.speakers.delete(organizationId, eventId, speakerId, request.requestContext!.principal.userId!);
  }
}
