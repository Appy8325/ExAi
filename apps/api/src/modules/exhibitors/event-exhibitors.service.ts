import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";

import { EventExhibitorsRepository } from "./event-exhibitors.repository";

export interface CreateEventExhibitorInput {
  organizationId: string;
  organizerOrganizationId: string;
  actorUserId: string;
  eventId: string;
  boothName: string;
  boothNumber?: string;
  logoUrl?: string;
  description?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  socialLinks?: Record<string, string>;
}

export interface UpdateEventExhibitorInput {
  exhibitorId: string;
  eventId: string;
  scopeOrganizationId: string;
  actorUserId: string;
  boothName?: string;
  boothNumber?: string | null;
  logoUrl?: string | null;
  description?: string | null;
  website?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  socialLinks?: Record<string, string>;
}

@Injectable()
export class EventExhibitorsService {
  constructor(@Inject(EventExhibitorsRepository) private readonly exhibitorsRepository: EventExhibitorsRepository) {}

  create(input: CreateEventExhibitorInput) {
    return this.exhibitorsRepository.create({
      ...input,
      boothName: requiredText(input.boothName, "Booth name"),
      boothNumber: optionalText(input.boothNumber),
      logoUrl: optionalUrl(input.logoUrl, "Logo URL"),
      description: optionalText(input.description),
      website: optionalUrl(input.website, "Website"),
      contactEmail: optionalEmail(input.contactEmail),
      contactPhone: optionalText(input.contactPhone),
      socialLinks: validateSocialLinks(input.socialLinks ?? {}),
    });
  }

  list(eventId: string, scopeOrganizationId: string, actorUserId: string) {
    return this.exhibitorsRepository.list(eventId, scopeOrganizationId, actorUserId);
  }

  findById(exhibitorId: string, scopeOrganizationId: string, actorUserId: string) {
    return this.exhibitorsRepository.findById(exhibitorId, scopeOrganizationId, actorUserId);
  }

  async update(input: UpdateEventExhibitorInput) {
    const exhibitor = await this.exhibitorsRepository.update({
      ...input,
      boothName: input.boothName === undefined ? undefined : requiredText(input.boothName, "Booth name"),
      boothNumber: normalizeNullableText(input.boothNumber),
      logoUrl: normalizeNullableUrl(input.logoUrl, "Logo URL"),
      description: normalizeNullableText(input.description),
      website: normalizeNullableUrl(input.website, "Website"),
      contactEmail: normalizeNullableEmail(input.contactEmail),
      contactPhone: normalizeNullableText(input.contactPhone),
      socialLinks: input.socialLinks === undefined ? undefined : validateSocialLinks(input.socialLinks),
    });
    if (!exhibitor) throw new NotFoundException("Exhibitor not found or archived.");
    return exhibitor;
  }

  async archive(exhibitorId: string, eventId: string, scopeOrganizationId: string, actorUserId: string) {
    const exhibitor = await this.exhibitorsRepository.archive(exhibitorId, eventId, scopeOrganizationId, actorUserId);
    if (!exhibitor) throw new NotFoundException("Exhibitor not found or already archived.");
    return exhibitor;
  }
}

function requiredText(value: string, label: string) {
  const normalized = value.trim();
  if (!normalized) throw new BadRequestException(`${label} is required.`);
  return normalized;
}

function optionalText(value: string | undefined) {
  const normalized = value?.trim();
  return normalized || undefined;
}

function normalizeNullableText(value: string | null | undefined) {
  return value === undefined ? undefined : value === null ? null : optionalText(value) ?? null;
}

function optionalUrl(value: string | undefined, label: string) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error();
    return url.toString();
  } catch {
    throw new BadRequestException(`${label} must be an HTTP(S) URL.`);
  }
}

function normalizeNullableUrl(value: string | null | undefined, label: string) {
  return value === undefined ? undefined : value === null ? null : optionalUrl(value, label) ?? null;
}

function optionalEmail(value: string | undefined) {
  if (!value) return undefined;
  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new BadRequestException("Contact email is invalid.");
  return email;
}

function normalizeNullableEmail(value: string | null | undefined) {
  return value === undefined ? undefined : value === null ? null : optionalEmail(value) ?? null;
}

function validateSocialLinks(value: Record<string, string>) {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    throw new BadRequestException("Social links must be an object.");
  }
  for (const url of Object.values(value)) optionalUrl(url, "Social link");
  return value;
}
