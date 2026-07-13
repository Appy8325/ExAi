import { Inject, Injectable } from "@nestjs/common";
import {
  isOrganizationRole,
  organizationPermissions,
  type OrganizationPermission,
  type Role,
} from "@concourse/shared";

import { RoleResolutionService } from "./role-resolution.service";

export interface ResolvedOrganizationPermissions {
  role?: Role;
  permissions: readonly OrganizationPermission[];
}

@Injectable()
export class PermissionResolutionService {
  constructor(
    @Inject(RoleResolutionService)
    private readonly roleResolutionService: RoleResolutionService,
  ) {}

  async resolveOrganizationPermissions(
    organizationId: string,
    userId: string,
  ): Promise<ResolvedOrganizationPermissions> {
    const role = await this.roleResolutionService.resolveOrganizationRole(
      organizationId,
      userId,
    );
    const organizationRole = role?.startsWith("org:")
      ? role.slice(4)
      : undefined;

    if (!role || !organizationRole || !isOrganizationRole(organizationRole)) {
      return { permissions: [] };
    }

    return { role, permissions: organizationPermissions(organizationRole) };
  }
}
