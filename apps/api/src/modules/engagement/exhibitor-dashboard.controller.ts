import { Controller, Get, Param, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { RequestContextInterceptor } from "../auth/request-context.interceptor";
import { SupabaseRequestContextGuard, type AuthenticatedRequest } from "../auth/supabase-request-context.guard";
import { OrganizationAuthorizationGuard } from "../organizations/organization-authorization.guard";
import { RequireOrganizationPermissions } from "../organizations/organization-permission.decorator";
import { ExhibitorDashboardService } from "./exhibitor-dashboard.service";

@Controller("v1/organizations/:organizationId/exhibitors/:eventExhibitorId/dashboard")
@UseGuards(SupabaseRequestContextGuard, OrganizationAuthorizationGuard)
@UseInterceptors(RequestContextInterceptor)
export class ExhibitorDashboardController {
  constructor(private readonly dashboard: ExhibitorDashboardService) {}
  @Get()
  @RequireOrganizationPermissions("organizations:read")
  find(@Param("eventExhibitorId") eventExhibitorId: string, @Req() request: AuthenticatedRequest) {
    return this.dashboard.find(request.requestContext!.orgId!, eventExhibitorId, request.requestContext!.principal.userId!);
  }
}
