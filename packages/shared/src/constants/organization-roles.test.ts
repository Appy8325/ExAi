import { describe, expect, it } from 'vitest';

import {
  hasOrganizationRole,
  isOrganizationRole,
  organizationPermissions,
} from './index';

describe('organization roles', () => {
  it('validates the supported organization roles', () => {
    expect(isOrganizationRole('owner')).toBe(true);
    expect(isOrganizationRole('admin')).toBe(true);
    expect(isOrganizationRole('member')).toBe(true);
    expect(isOrganizationRole('invalid')).toBe(false);
  });

  it('orders owner above admin above member', () => {
    expect(hasOrganizationRole('owner', 'admin')).toBe(true);
    expect(hasOrganizationRole('admin', 'member')).toBe(true);
    expect(hasOrganizationRole('member', 'admin')).toBe(false);
  });

  it('resolves the organization permission set for every role', () => {
    expect(organizationPermissions('owner')).toContain('memberships:invite');
    expect(organizationPermissions('admin')).toContain('organizations:update');
    expect(organizationPermissions('member')).toEqual([
      'organizations:read',
      'memberships:read',
    ]);
  });
});
