import { BadRequestException, Inject, Injectable } from "@nestjs/common";

import { OrganizationsRepository } from "./organizations.repository";

export type OrganizationKind = "organizer" | "exhibitor";

export interface CreateOrganizationInput {
  ownerUserId: string;
  name: string;
  kind: OrganizationKind;
  slug?: string;
}

export function organizationSlug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63);
}

@Injectable()
export class OrganizationsService {
  constructor(
    @Inject(OrganizationsRepository)
    private readonly organizationsRepository: OrganizationsRepository,
  ) {}

  create(input: CreateOrganizationInput) {
    const name = input.name.trim();
    const slug = organizationSlug(input.slug ?? name);

    if (!name) {
      throw new BadRequestException("Organization name is required.");
    }
    if (input.kind !== "organizer" && input.kind !== "exhibitor") {
      throw new BadRequestException(
        "Organization kind must be organizer or exhibitor.",
      );
    }
    if (!/^[a-z0-9-]{3,63}$/.test(slug)) {
      throw new BadRequestException(
        "Organization slug must contain 3-63 lowercase letters, numbers, or hyphens.",
      );
    }

    return this.organizationsRepository.create({
      ownerUserId: input.ownerUserId,
      name,
      kind: input.kind,
      slug,
    });
  }
}
