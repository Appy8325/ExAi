import type { ExecutionContext } from "@nestjs/common";
import { ForbiddenException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

import {
  requestContextStorage,
  type RequestContext,
} from "../../common/request-context";

vi.mock("./permission-resolution.service", () => ({
  PermissionResolutionService: class PermissionResolutionService {},
}));

import { OrganizationAuthorizationGuard } from "./organization-authorization.guard";

const requestContext = (orgId: string, userId = "user-id"): RequestContext => ({
  requestId: "request-id",
  traceId: "trace-id",
  principal: { kind: "session", userId },
  orgId,
});

function executionContext(organizationId: string): ExecutionContext {
  return {
    getClass: () => class {},
    getHandler: () => () => undefined,
    switchToHttp: () => ({ getRequest: () => ({ params: { organizationId } }) }),
  } as unknown as ExecutionContext;
}

function guard(
  permissions: readonly string[],
  requiredPermissions: string[],
) {
  const resolveOrganizationPermissions = vi.fn().mockResolvedValue({ permissions });
  return {
    guard: new OrganizationAuthorizationGuard(
      {
        getAllAndOverride: vi.fn().mockReturnValue(requiredPermissions),
      } as never,
      { resolveOrganizationPermissions } as never,
    ),
    resolveOrganizationPermissions,
  };
}

describe("OrganizationAuthorizationGuard", () => {
  it.each([
    ["owner", ["organizations:update"]],
    ["admin", ["memberships:invite"]],
    ["member", ["organizations:read"]],
  ])("authorizes an active %s with its granted permission", async (_role, permissions) => {
    const { guard: authorizationGuard } = guard(permissions, [permissions[0]!]);

    await expect(
      requestContextStorage.run(requestContext("organization-id"), () =>
        authorizationGuard.canActivate(executionContext("organization-id")),
      ),
    ).resolves.toBe(true);
  });

  it.each(["pending", "missing", "invalid"])(
    "denies a %s membership result",
    async () => {
      const { guard: authorizationGuard } = guard([], ["organizations:read"]);

      await expect(
        requestContextStorage.run(requestContext("organization-id"), () =>
          authorizationGuard.canActivate(executionContext("organization-id")),
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    },
  );

  it("denies a missing permission", async () => {
    const { guard: authorizationGuard } = guard(
      ["organizations:read"],
      ["organizations:update"],
    );

    await expect(
      requestContextStorage.run(requestContext("organization-id"), () =>
        authorizationGuard.canActivate(executionContext("organization-id")),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("denies cross-organization access before resolving permissions", async () => {
    const { guard: authorizationGuard, resolveOrganizationPermissions } = guard(
      ["organizations:read"],
      ["organizations:read"],
    );

    await expect(
      requestContextStorage.run(requestContext("organization-a"), () =>
        authorizationGuard.canActivate(executionContext("organization-b")),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(resolveOrganizationPermissions).not.toHaveBeenCalled();
  });

  it("resolves permissions once per request context", async () => {
    const { guard: authorizationGuard, resolveOrganizationPermissions } = guard(
      ["organizations:read"],
      ["organizations:read"],
    );

    await requestContextStorage.run(requestContext("organization-id"), async () => {
      await authorizationGuard.canActivate(executionContext("organization-id"));
      await authorizationGuard.canActivate(executionContext("organization-id"));
    });

    expect(resolveOrganizationPermissions).toHaveBeenCalledTimes(1);
  });
});
