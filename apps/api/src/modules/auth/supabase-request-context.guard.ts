import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient } from "@supabase/supabase-js";
import type { RequestContext } from "../../common/request-context";
import { PermissionResolutionService } from "../organizations/permission-resolution.service";

export type AuthenticatedRequest = { id?: string; headers: { authorization?: string | string[]; [key: string]: unknown }; params: { organizationId?: string }; requestContext?: RequestContext };

@Injectable()
export class SupabaseRequestContextGuard implements CanActivate {
  constructor(private readonly config: ConfigService, private readonly permissions: PermissionResolutionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const organizationId = request.params.organizationId;
    const token = bearerToken(request.headers.authorization);
    const url = this.config.get<string>("supabase.url");
    const key = this.config.get<string>("supabase.serviceRoleKey");
    if (!organizationId || !token || !url || !key) throw new UnauthorizedException("Authentication required.");

    const { data, error } = await createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } }).auth.getUser(token);
    if (error || !data.user) throw new UnauthorizedException("Authentication required.");

    const resolved = await this.permissions.resolveOrganizationPermissions(organizationId, data.user.id);
    if (!resolved.role) throw new ForbiddenException("Organization access denied.");
    const requestContext: RequestContext = {
      requestId: request.id ?? data.user.id,
      traceId: request.id ?? data.user.id,
      principal: { kind: "session", userId: data.user.id, sessionId: data.user.id },
      orgId: organizationId,
      membership: { role: resolved.role, permissions: resolved.permissions },
    };
    request.requestContext = requestContext;
    return true;
  }
}

function bearerToken(value: string | string[] | undefined) {
  if (typeof value !== "string") return undefined;
  const [scheme, token] = value.split(" ");
  return scheme === "Bearer" && token ? token : undefined;
}
