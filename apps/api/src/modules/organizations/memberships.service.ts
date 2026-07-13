import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import {
  MembershipsRepository,
  type MembershipStatus,
} from "./memberships.repository";

export interface CreateMembershipInput {
  organizationId: string;
  userId: string;
  role?: "admin" | "member";
  status?: MembershipStatus;
  invitedByUserId?: string;
}

@Injectable()
export class MembershipsService {
  constructor(
    @Inject(MembershipsRepository)
    private readonly membershipsRepository: MembershipsRepository,
  ) {}

  create(input: CreateMembershipInput) {
    const role = input.role ?? "member";
    const status = input.status ?? "pending";

    if (!(["admin", "member"] as const).includes(role)) {
      throw new BadRequestException("Membership role is invalid.");
    }
    if (!(["pending", "active"] as const).includes(status)) {
      throw new BadRequestException("Membership status is invalid.");
    }

    return this.membershipsRepository.create({
      ...input,
      role,
      status,
      actorUserId: input.invitedByUserId ?? input.userId,
    });
  }

  findByOrganizationId(organizationId: string) {
    return this.membershipsRepository.findByOrganizationId(organizationId);
  }

  findByUserId(userId: string) {
    return this.membershipsRepository.findByUserId(userId);
  }

  async activate(organizationId: string, userId: string, actorUserId = userId) {
    const membership = await this.membershipsRepository.activate(
      organizationId,
      userId,
      actorUserId,
    );
    if (!membership) {
      throw new NotFoundException("Membership was not found.");
    }
    return membership;
  }
}
