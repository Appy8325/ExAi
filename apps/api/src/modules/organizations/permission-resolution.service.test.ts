import { describe, expect, it, vi } from "vitest";

vi.mock("./role-resolution.service", () => ({
  RoleResolutionService: class RoleResolutionService {},
}));

import { PermissionResolutionService } from "./permission-resolution.service";

describe("PermissionResolutionService", () => {
  it("resolves active organization roles to their permission set", async () => {
    const resolveOrganizationRole = vi.fn().mockResolvedValue("org:admin");
    const service = new PermissionResolutionService({
      resolveOrganizationRole,
    } as never);

    await expect(
      service.resolveOrganizationPermissions("organization-id", "user-id"),
    ).resolves.toEqual({
      role: "org:admin",
      permissions: expect.arrayContaining([
        "organizations:update",
        "memberships:invite",
      ]),
    });
  });

  it("resolves no permissions when no active role exists", async () => {
    const service = new PermissionResolutionService({
      resolveOrganizationRole: vi.fn().mockResolvedValue(undefined),
    } as never);

    await expect(
      service.resolveOrganizationPermissions("organization-id", "user-id"),
    ).resolves.toEqual({ permissions: [] });
  });

  it("resolves the member read-only permission set", async () => {
    const service = new PermissionResolutionService({
      resolveOrganizationRole: vi.fn().mockResolvedValue("org:member"),
    } as never);

    await expect(
      service.resolveOrganizationPermissions("organization-id", "user-id"),
    ).resolves.toEqual({
      role: "org:member",
      permissions: ["organizations:read", "memberships:read"],
    });
  });

  it("does not resolve permissions for a non-organization role", async () => {
    const service = new PermissionResolutionService({
      resolveOrganizationRole: vi.fn().mockResolvedValue("platform:admin"),
    } as never);

    await expect(
      service.resolveOrganizationPermissions("organization-id", "user-id"),
    ).resolves.toEqual({ permissions: [] });
  });
});
