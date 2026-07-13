import { Module } from "@nestjs/common";

import { MembershipsRepository } from "./memberships.repository";
import { MembershipsService } from "./memberships.service";
import { OrganizationAuthorizationGuard } from "./organization-authorization.guard";
import { InvitationsService } from "./invitations.service";
import { OrganizationsRepository } from "./organizations.repository";
import { OrganizationsService } from "./organizations.service";
import { PermissionResolutionService } from "./permission-resolution.service";
import { RoleResolutionService } from "./role-resolution.service";

/**
 * Organization creation only. Membership management and invitations remain
 * separate milestones; the bootstrap owner membership is created atomically to
 * preserve ADR-001's ownership invariant.
 */
@Module({
  providers: [
    MembershipsRepository,
    MembershipsService,
    OrganizationAuthorizationGuard,
    InvitationsService,
    OrganizationsRepository,
    OrganizationsService,
    PermissionResolutionService,
    RoleResolutionService,
  ],
  exports: [
    InvitationsService,
    MembershipsService,
    OrganizationAuthorizationGuard,
    OrganizationsService,
    PermissionResolutionService,
    RoleResolutionService,
  ],
})
export class OrganizationsModule {}
