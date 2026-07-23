import {
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";

import { RequestContextInterceptor } from "../auth/request-context.interceptor";
import { SupabaseAuthService } from "../auth/supabase-auth.service";
import {
  SupabaseRequestContextGuard,
  type AuthenticatedRequest,
} from "../auth/supabase-request-context.guard";
import { EventsService } from "../events/events.service";
import { EventExhibitorsService } from "../exhibitors/event-exhibitors.service";
import { InvitationsService } from "../organizations/invitations.service";
import { MembershipsService } from "../organizations/memberships.service";
import { OrganizationAuthorizationGuard } from "../organizations/organization-authorization.guard";
import { RequireOrganizationPermissions } from "../organizations/organization-permission.decorator";
import { OrganizationsService } from "../organizations/organizations.service";

@Controller("v1/organizer")
export class OrganizerBootstrapController {
  constructor(
    @Inject(SupabaseAuthService)
    private readonly auth: SupabaseAuthService,
    @Inject(OrganizationsService)
    private readonly organizations: OrganizationsService,
    @Inject(EventExhibitorsService)
    private readonly exhibitors: EventExhibitorsService,
    @Inject(InvitationsService)
    private readonly invitations: InvitationsService,
  ) {}

  @Post("organizations")
  async createOrganization(
    @Headers("authorization") authorization: string | undefined,
    @Body() body: { name?: string },
  ) {
    const user = await this.identity(authorization);
    return this.organizations.create({
      ownerUserId: user.id,
      name: body.name ?? "",
      kind: "organizer",
    });
  }

  @Post("invitations/accept")
  async acceptInvitation(
    @Headers("authorization") authorization: string | undefined,
    @Body() body: { token?: string },
  ) {
    const user = await this.identity(authorization);
    return this.invitations.accept({
      token: body.token ?? "",
      userId: user.id,
    });
  }

  private async identity(authorization: string | undefined) {
    const [scheme, token] = authorization?.split(" ") ?? [];
    const user = await this.auth.identity(
      scheme === "Bearer" ? (token ?? "") : "",
    );
    if (!user) throw new UnauthorizedException("Authentication required.");
    return user;
  }
}

@Controller("v1/organizations/:organizationId")
@UseGuards(SupabaseRequestContextGuard, OrganizationAuthorizationGuard)
@UseInterceptors(RequestContextInterceptor)
export class OrganizerManagementController {
  constructor(
    @Inject(SupabaseAuthService)
    private readonly auth: SupabaseAuthService,
    @Inject(EventsService)
    private readonly events: EventsService,
    @Inject(InvitationsService)
    private readonly invitations: InvitationsService,
    @Inject(MembershipsService)
    private readonly memberships: MembershipsService,
    @Inject(OrganizationsService)
    private readonly organizations: OrganizationsService,
    @Inject(EventExhibitorsService)
    private readonly exhibitors: EventExhibitorsService,
  ) {}

  @Get("members")
  @RequireOrganizationPermissions("memberships:read")
  listMembers(
    @Param("organizationId") organizationId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.memberships.listWithUsers(
      organizationId,
      request.requestContext!.principal.userId!,
    );
  }

  @Post("members/invite")
  @RequireOrganizationPermissions("memberships:invite")
  async inviteMember(
    @Param("organizationId") organizationId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: { email?: string; role?: "admin" | "member" },
  ) {
    const invitation = await this.invitations.createOrganizationInvitation({
      organizationId,
      email: body.email ?? "",
      role: body.role,
      invitedByUserId: request.requestContext!.principal.userId!,
    });
    await this.auth.sendMagicLink(
      body.email ?? "",
      invitationRedirect(invitation.token, "/org/users"),
    );
    return { expiresAt: invitation.expiresAt, status: "sent" };
  }

  @Post("events")
  @RequireOrganizationPermissions("organizations:update")
  createEvent(
    @Param("organizationId") organizationId: string,
    @Req() request: AuthenticatedRequest,
    @Body()
    body: {
      name?: string;
      slug?: string;
      timezone?: string;
      startAt?: string;
      endAt?: string;
    },
  ) {
    return this.events.create({
      organizationId,
      actorUserId: request.requestContext!.principal.userId!,
      name: body.name ?? "",
      slug: body.slug,
      timezone: body.timezone ?? "",
      startAt: body.startAt ?? "",
      endAt: body.endAt ?? "",
    });
  }

  @Post("exhibitor-organizations")
  @RequireOrganizationPermissions("organizations:update")
  createExhibitorOrganization(
    @Req() request: AuthenticatedRequest,
    @Body() body: { name?: string },
  ) {
    return this.organizations.create({
      ownerUserId: request.requestContext!.principal.userId!,
      name: body.name ?? "",
      kind: "exhibitor",
    });
  }

  @Get("events/:eventId/exhibitors")
  @RequireOrganizationPermissions("organizations:read")
  listExhibitors(
    @Param("organizationId") organizationId: string,
    @Param("eventId") eventId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.exhibitors.list(eventId, organizationId, request.requestContext!.principal.userId!);
  }

  @Post("events/:eventId/exhibitors")
  @RequireOrganizationPermissions("organizations:update")
  createExhibitor(@Param("organizationId") organizerOrganizationId: string, @Param("eventId") eventId: string, @Req() request: AuthenticatedRequest, @Body() body: { organizationId?: string; boothName?: string; boothNumber?: string; logoUrl?: string; description?: string; contactEmail?: string; contactPhone?: string }) {
    return this.exhibitors.create({ organizerOrganizationId, eventId, actorUserId: request.requestContext!.principal.userId!, organizationId: body.organizationId ?? "", boothName: body.boothName ?? "", boothNumber: body.boothNumber, logoUrl: body.logoUrl, description: body.description, contactEmail: body.contactEmail, contactPhone: body.contactPhone });
  }

  @Get("events/:eventId/exhibitors/:exhibitorId")
  @RequireOrganizationPermissions("organizations:read")
  getExhibitor(@Param("organizationId") organizationId: string, @Param("exhibitorId") exhibitorId: string, @Req() request: AuthenticatedRequest) { return this.exhibitors.findById(exhibitorId, organizationId, request.requestContext!.principal.userId!); }

  @Patch("events/:eventId/exhibitors/:exhibitorId")
  @RequireOrganizationPermissions("organizations:update")
  updateExhibitor(@Param("organizationId") scopeOrganizationId: string, @Param("eventId") eventId: string, @Param("exhibitorId") exhibitorId: string, @Req() request: AuthenticatedRequest, @Body() body: { boothName?: string; boothNumber?: string | null; logoUrl?: string | null; description?: string | null; contactEmail?: string | null; contactPhone?: string | null }) { return this.exhibitors.update({ ...body, scopeOrganizationId, eventId, exhibitorId, actorUserId: request.requestContext!.principal.userId! }); }

  @Post("events/:eventId/exhibitors/:exhibitorId/archive")
  @RequireOrganizationPermissions("organizations:update")
  archiveExhibitor(@Param("organizationId") organizationId: string, @Param("eventId") eventId: string, @Param("exhibitorId") exhibitorId: string, @Req() request: AuthenticatedRequest) { return this.exhibitors.archive(exhibitorId, eventId, organizationId, request.requestContext!.principal.userId!); }

  @Get("events/:eventId")
  @RequireOrganizationPermissions("organizations:read")
  async getEvent(
    @Param("organizationId") organizationId: string,
    @Param("eventId") eventId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const event = await this.events.findById(organizationId, eventId, request.requestContext!.principal.userId!);
    if (!event) throw new NotFoundException("Event not found.");
    return event;
  }

  @Post("events/:eventId/duplicate")
  @RequireOrganizationPermissions("organizations:update")
  duplicateEvent(
    @Param("organizationId") organizationId: string,
    @Param("eventId") eventId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.events.duplicate(organizationId, eventId, request.requestContext!.principal.userId!);
  }

  @Patch("events/:eventId")
  @RequireOrganizationPermissions("organizations:update")
  updateEvent(
    @Param("organizationId") organizationId: string,
    @Param("eventId") eventId: string,
    @Req() request: AuthenticatedRequest,
    @Body()
    body: {
      name?: string;
      slug?: string;
      timezone?: string;
      startAt?: string;
      endAt?: string;
      privacyPolicyUrl?: string | null;
      logoUrl?: string | null;
      primaryColor?: string;
    },
  ) {
    return this.events.update({
      organizationId,
      eventId,
      actorUserId: request.requestContext!.principal.userId!,
      ...body,
    });
  }

  @Post("events/:eventId/publish")
  @RequireOrganizationPermissions("organizations:update")
  publishEvent(
    @Param("organizationId") organizationId: string,
    @Param("eventId") eventId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.events.publish(
      organizationId,
      eventId,
      request.requestContext!.principal.userId!,
    );
  }

  @Post("events/:eventId/archive")
  @RequireOrganizationPermissions("organizations:update")
  archiveEvent(
    @Param("organizationId") organizationId: string,
    @Param("eventId") eventId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.events.archive(
      organizationId,
      eventId,
      request.requestContext!.principal.userId!,
    );
  }

  @Get("events/:eventId/exhibitor-invitations")
  @RequireOrganizationPermissions("organizations:read")
  listExhibitorInvitations(
    @Param("organizationId") organizationId: string,
    @Param("eventId") eventId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.invitations.listEventExhibitorInvitations(
      organizationId,
      eventId,
      request.requestContext!.principal.userId!,
    );
  }

  @Post("events/:eventId/exhibitor-invitations")
  @RequireOrganizationPermissions("organizations:update")
  async inviteExhibitor(
    @Param("organizationId") organizationId: string,
    @Param("eventId") eventId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: { email?: string; companyName?: string },
  ) {
    const invitation = await this.invitations.createEventExhibitorInvitation({
      organizationId,
      eventId,
      email: body.email ?? "",
      companyName: body.companyName ?? "",
      invitedByUserId: request.requestContext!.principal.userId!,
    });
    await this.auth.sendMagicLink(
      body.email ?? "",
      invitationRedirect(invitation.token, "/exhibit"),
    );
    return { expiresAt: invitation.expiresAt, status: "sent" };
  }
}

function invitationRedirect(token: string, next: string) {
  const params = new URLSearchParams({ invitation: token, next });
  return `/auth/invitation?${params}`;
}
