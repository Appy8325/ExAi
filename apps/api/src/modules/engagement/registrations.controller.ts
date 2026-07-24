import {
  Controller,
  Get,
  Param,
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

@Controller("v1/organizations/:organizationId/events/:eventId/registrations")
@UseGuards(SupabaseRequestContextGuard, OrganizationAuthorizationGuard)
@UseInterceptors(RequestContextInterceptor)
export class RegistrationsController {
  @Get()
  @RequireOrganizationPermissions("organizations:read")
  list(
    @Param("organizationId") _organizationId: string,
    @Param("eventId") _eventId: string,
    @Req() _request: AuthenticatedRequest,
  ) {
    return [];
  }
}
