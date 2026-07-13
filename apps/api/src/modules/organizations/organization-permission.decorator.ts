import { SetMetadata } from "@nestjs/common";
import type { OrganizationPermission } from "@concourse/shared";

export const ORGANIZATION_PERMISSIONS_KEY = "organization_permissions";

export const RequireOrganizationPermissions = (
  ...permissions: OrganizationPermission[]
) => SetMetadata(ORGANIZATION_PERMISSIONS_KEY, permissions);
