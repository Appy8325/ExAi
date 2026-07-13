import { Inject, Injectable } from "@nestjs/common";
import {
  isOrganizationRole,
  type Role,
} from "@concourse/shared";

import { MembershipsRepository } from "./memberships.repository";

@Injectable()
export class RoleResolutionService {
  constructor(
    @Inject(MembershipsRepository)
    private readonly membershipsRepository: MembershipsRepository,
  ) {}

  async resolveOrganizationRole(
    organizationId: string,
    userId: string,
  ): Promise<Role | undefined> {
    const membership = await this.membershipsRepository.findByOrganizationAndUser(
      organizationId,
      userId,
    );
    if (!membership || membership.status !== "active") {
      return undefined;
    }
    if (!isOrganizationRole(membership.role)) {
      return undefined;
    }
    return `org:${membership.role}` as Role;
  }
}
