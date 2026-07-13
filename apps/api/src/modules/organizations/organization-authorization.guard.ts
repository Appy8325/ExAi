import {
  ForbiddenException,
  Inject,
  Injectable,
} from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { OrganizationPermission } from "@concourse/shared";

import {
  requestContextStorage,
} from "../../common/request-context";
import type { RequestContext } from "../../common/request-context";

import { ORGANIZATION_PERMISSIONS_KEY } from "./organization-permission.decorator";
import { PermissionResolutionService } from "./permission-resolution.service";

@Injectable()
export class OrganizationAuthorizationGuard implements CanActivate {
  private readonly permissionCache = new WeakMap<
    RequestContext,
    Map<string, readonly OrganizationPermission[]>
  >();

  constructor(
    @Inject(Reflector)
    private readonly reflector: Reflector,
    @Inject(PermissionResolutionService)
    private readonly permissionResolutionService: PermissionResolutionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<
      OrganizationPermission[]
    >(ORGANIZATION_PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
    if (!requiredPermissions?.length) {
      return true;
    }

    const requestContext = requestContextStorage.getStore();
    const request = context.switchToHttp().getRequest<{ params?: Record<string, string> }>();
    const organizationId = request.params?.organizationId ?? request.params?.orgId;
    const userId = requestContext?.principal.userId;

    if (!requestContext?.orgId || !organizationId || requestContext.orgId !== organizationId || !userId) {
      throw new ForbiddenException("Organization permission denied.");
    }

    const permissions = await this.resolvePermissions(
      requestContext,
      organizationId,
      userId,
    );
    if (!requiredPermissions.every((permission) => permissions.includes(permission))) {
      throw new ForbiddenException("Organization permission denied.");
    }
    return true;
  }

  private async resolvePermissions(
    requestContext: RequestContext,
    organizationId: string,
    userId: string,
  ): Promise<readonly OrganizationPermission[]> {
    const key = `${organizationId}:${userId}`;
    const cache = this.permissionCache.get(requestContext) ?? new Map();
    this.permissionCache.set(requestContext, cache);

    const cached = cache.get(key);
    if (cached) {
      return cached;
    }

    const resolved = await this.permissionResolutionService.resolveOrganizationPermissions(
      organizationId,
      userId,
    );
    cache.set(key, resolved.permissions);
    return resolved.permissions;
  }
}
