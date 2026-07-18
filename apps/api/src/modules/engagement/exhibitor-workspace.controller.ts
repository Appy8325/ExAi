import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Inject,
  Param,
  Patch,
  Post,
  Put,
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
import { OrganizationAuthorizationGuard } from "../organizations/organization-authorization.guard";
import { RequireOrganizationPermissions } from "../organizations/organization-permission.decorator";
import { ExhibitorWorkspaceService } from "./exhibitor-workspace.service";
import type { LeadFieldInput } from "./exhibitor-workspace.repository";

@Controller("v1/exhibitor")
export class ExhibitorBootstrapController {
  constructor(
    @Inject(SupabaseAuthService) private readonly auth: SupabaseAuthService,
    @Inject(ExhibitorWorkspaceService)
    private readonly workspace: ExhibitorWorkspaceService,
  ) {}

  @Get("overview")
  async overview(@Headers("authorization") authorization: string | undefined) {
    const [scheme, token] = authorization?.split(" ") ?? [];
    const user = await this.auth.identity(
      scheme === "Bearer" ? (token ?? "") : "",
    );
    if (!user) throw new UnauthorizedException("Authentication required.");
    return this.workspace.overview(user.id);
  }
}

@Controller("v1/organizations/:organizationId/exhibitors/:eventExhibitorId")
@UseGuards(SupabaseRequestContextGuard, OrganizationAuthorizationGuard)
@UseInterceptors(RequestContextInterceptor)
export class ExhibitorWorkspaceController {
  constructor(
    @Inject(ExhibitorWorkspaceService)
    private readonly workspace: ExhibitorWorkspaceService,
  ) {}

  @Get()
  @RequireOrganizationPermissions("organizations:read")
  find(
    @Param("organizationId") organizationId: string,
    @Param("eventExhibitorId") eventExhibitorId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workspace.find(
      organizationId,
      eventExhibitorId,
      actor(request),
    );
  }

  @Patch("booth")
  @RequireOrganizationPermissions("organizations:update")
  updateBooth(
    @Param("organizationId") organizationId: string,
    @Param("eventExhibitorId") eventExhibitorId: string,
    @Req() request: AuthenticatedRequest,
    @Body()
    body: {
      companyName?: string;
      boothName?: string;
      boothNumber?: string | null;
      logoUrl?: string | null;
      bannerUrl?: string | null;
      primaryColor?: string;
      description?: string;
      website?: string;
      contactEmail?: string;
      contactPhone?: string | null;
    },
  ) {
    return this.workspace.updateProfile({
      organizationId,
      eventExhibitorId,
      actorUserId: actor(request),
      ...body,
    });
  }

  @Post("booth/publish")
  @RequireOrganizationPermissions("organizations:update")
  publishBooth(
    @Param("organizationId") organizationId: string,
    @Param("eventExhibitorId") eventExhibitorId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workspace.publishBooth(
      organizationId,
      eventExhibitorId,
      actor(request),
    );
  }

  @Post("sources")
  @RequireOrganizationPermissions("organizations:update")
  createSource(
    @Param("organizationId") organizationId: string,
    @Param("eventExhibitorId") eventExhibitorId: string,
    @Req() request: AuthenticatedRequest,
    @Body()
    body: {
      sourceType?: string;
      title?: string;
      sourceUrl?: string;
      filename?: string;
      contentType?: string;
      byteSize?: number;
    },
  ) {
    return this.workspace.createSource({
      organizationId,
      eventExhibitorId,
      actorUserId: actor(request),
      ...body,
    });
  }

  @Post("sources/:sourceId/complete")
  @RequireOrganizationPermissions("organizations:update")
  completeSource(
    @Param("organizationId") organizationId: string,
    @Param("eventExhibitorId") eventExhibitorId: string,
    @Param("sourceId") sourceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workspace.completeSource(
      organizationId,
      eventExhibitorId,
      sourceId,
      actor(request),
    );
  }

  @Delete("sources/:sourceId")
  @RequireOrganizationPermissions("organizations:update")
  removeSource(
    @Param("organizationId") organizationId: string,
    @Param("eventExhibitorId") eventExhibitorId: string,
    @Param("sourceId") sourceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workspace.removeSource(
      organizationId,
      eventExhibitorId,
      sourceId,
      actor(request),
    );
  }

  @Put("lead-form")
  @RequireOrganizationPermissions("organizations:update")
  saveLeadForm(
    @Param("organizationId") organizationId: string,
    @Param("eventExhibitorId") eventExhibitorId: string,
    @Req() request: AuthenticatedRequest,
    @Body()
    body: {
      name?: string;
      description?: string | null;
      consentText?: string;
      fields?: LeadFieldInput[];
    },
  ) {
    return this.workspace.saveLeadForm({
      organizationId,
      eventExhibitorId,
      actorUserId: actor(request),
      ...body,
    });
  }

  @Post("lead-form/publish")
  @RequireOrganizationPermissions("organizations:update")
  publishLeadForm(
    @Param("organizationId") organizationId: string,
    @Param("eventExhibitorId") eventExhibitorId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workspace.publishLeadForm(
      organizationId,
      eventExhibitorId,
      actor(request),
    );
  }

  @Post("qr")
  @RequireOrganizationPermissions("organizations:update")
  generateQr(
    @Param("organizationId") organizationId: string,
    @Param("eventExhibitorId") eventExhibitorId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workspace.generateQr(
      organizationId,
      eventExhibitorId,
      actor(request),
    );
  }
}

function actor(request: AuthenticatedRequest) {
  return request.requestContext!.principal.userId!;
}
