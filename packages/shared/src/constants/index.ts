// Cross-cutting constants (doc 37 §6.3): permission strings, entitlement
// keys, domain-event names, queue names, as typed consts per foundation
// §11's naming grammar.
//
// Only the canonical role strings already locked in
// docs/00-foundation.md §8 are populated here. Permission strings
// (`resource:action`) and entitlement keys are NOT invented in this
// scaffolding pass — the role→permission matrix is owned by
// docs/28-permission-model.md; add them here once that doc's matrix is
// implemented, not before.

export const ROLES = [
  'platform:admin',
  'org:owner',
  'org:admin',
  'org:member',
  'event:admin',
  'event:staff',
  'exhibitor:admin',
  'exhibitor:rep',
  'attendee',
] as const;

export type Role = (typeof ROLES)[number];

export const ORGANIZATION_ROLES = ['owner', 'admin', 'member'] as const;

export type OrganizationRole = (typeof ORGANIZATION_ROLES)[number];

export function isOrganizationRole(role: string): role is OrganizationRole {
  return ORGANIZATION_ROLES.includes(role as OrganizationRole);
}

export function hasOrganizationRole(
  actual: OrganizationRole,
  required: OrganizationRole,
): boolean {
  return ORGANIZATION_ROLES.indexOf(actual) <= ORGANIZATION_ROLES.indexOf(required);
}

export const ORGANIZATION_PERMISSIONS = [
  'organizations:read',
  'organizations:update',
  'memberships:read',
  'memberships:update',
  'memberships:remove',
  'memberships:invite',
  'audit_logs:read',
] as const;

export type OrganizationPermission = (typeof ORGANIZATION_PERMISSIONS)[number];

const ORGANIZATION_ROLE_PERMISSIONS: Record<
  OrganizationRole,
  readonly OrganizationPermission[]
> = {
  owner: ORGANIZATION_PERMISSIONS,
  admin: ORGANIZATION_PERMISSIONS,
  member: ['organizations:read', 'memberships:read'],
};

export function organizationPermissions(
  role: OrganizationRole,
): readonly OrganizationPermission[] {
  return ORGANIZATION_ROLE_PERMISSIONS[role];
}
