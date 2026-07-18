import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { EventsRepository } from "./events.repository";

export interface CreateEventInput {
  organizationId: string;
  actorUserId: string;
  name: string;
  slug?: string;
  timezone: string;
  startAt: Date | string;
  endAt: Date | string;
}

export interface UpdateEventInput {
  organizationId: string;
  actorUserId: string;
  eventId: string;
  name?: string;
  slug?: string;
  timezone?: string;
  startAt?: Date | string;
  endAt?: Date | string;
  privacyPolicyUrl?: string | null;
  logoUrl?: string | null;
  primaryColor?: string;
}

export function eventSlug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63);
}

@Injectable()
export class EventsService {
  constructor(
    @Inject(EventsRepository)
    private readonly eventsRepository: EventsRepository,
  ) {}

  create(input: CreateEventInput) {
    const name = requireName(input.name);
    const slug = validateSlug(eventSlug(input.slug ?? name));
    const { startAt, endAt } = validateDates(input.startAt, input.endAt);
    validateTimezone(input.timezone);
    return this.eventsRepository.create({
      ...input,
      name,
      slug,
      startAt,
      endAt,
    });
  }

  findById(organizationId: string, eventId: string, actorUserId: string) {
    return this.eventsRepository.findById(organizationId, eventId, actorUserId);
  }

  async update(input: UpdateEventInput) {
    const name = input.name === undefined ? undefined : requireName(input.name);
    const slug =
      input.slug === undefined
        ? undefined
        : validateSlug(eventSlug(input.slug));
    if (input.timezone !== undefined) validateTimezone(input.timezone);
    const privacyPolicyUrl = validateOptionalUrl(
      input.privacyPolicyUrl,
      "Privacy policy URL",
    );
    const logoUrl = validateOptionalUrl(input.logoUrl, "Logo URL");
    const primaryColor =
      input.primaryColor === undefined
        ? undefined
        : validatePrimaryColor(input.primaryColor);
    const dates = validateDates(input.startAt, input.endAt, true);
    const { startAt: _startAt, endAt: _endAt, ...record } = input;
    const event = await this.eventsRepository.update({
      ...record,
      name,
      slug,
      privacyPolicyUrl,
      logoUrl,
      primaryColor,
      ...dates,
    });
    if (!event) throw new NotFoundException("Event not found or archived.");
    return event;
  }

  async publish(organizationId: string, eventId: string, actorUserId: string) {
    const event = await this.eventsRepository.findById(
      organizationId,
      eventId,
      actorUserId,
    );
    if (!event) throw new NotFoundException("Event not found.");
    if (event.status !== "draft") {
      throw new BadRequestException("Only draft events can be published.");
    }
    if (!event.privacyPolicyUrl) {
      throw new BadRequestException(
        "A privacy policy URL is required before publishing.",
      );
    }
    const published = await this.eventsRepository.publish(
      organizationId,
      eventId,
      actorUserId,
    );
    if (!published)
      throw new NotFoundException("Event could not be published.");
    return published;
  }

  async archive(organizationId: string, eventId: string, actorUserId: string) {
    const event = await this.eventsRepository.archive(
      organizationId,
      eventId,
      actorUserId,
    );
    if (!event)
      throw new NotFoundException("Event not found or already archived.");
    return event;
  }
}

function validateOptionalUrl(value: string | null | undefined, label: string) {
  if (value === undefined) return undefined;
  if (value === null || !value.trim()) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:")
      throw new Error();
    return url.toString();
  } catch {
    throw new BadRequestException(`${label} must be an HTTP(S) URL.`);
  }
}

function validatePrimaryColor(value: string) {
  const color = value.trim();
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
    throw new BadRequestException(
      "Primary color must be a six-digit hex color.",
    );
  }
  return color.toLowerCase();
}

function requireName(value: string): string {
  const name = value.trim();
  if (!name) throw new BadRequestException("Event name is required.");
  return name;
}

function validateSlug(value: string): string {
  if (!/^[a-z0-9-]{3,63}$/.test(value)) {
    throw new BadRequestException(
      "Event slug must contain 3-63 lowercase letters, numbers, or hyphens.",
    );
  }
  return value;
}

function validateTimezone(timezone: string) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
  } catch {
    throw new BadRequestException(
      "Event timezone must be a valid IANA timezone.",
    );
  }
}

function validateDates(
  startValue: Date | string,
  endValue: Date | string,
): { startAt: Date; endAt: Date };
function validateDates(
  startValue: Date | string | undefined,
  endValue: Date | string | undefined,
  optional: true,
): { startAt?: Date; endAt?: Date };
function validateDates(
  startValue: Date | string | undefined,
  endValue: Date | string | undefined,
  optional = false,
) {
  if (optional && startValue === undefined && endValue === undefined)
    return { startAt: undefined, endAt: undefined };
  if (startValue === undefined || endValue === undefined) {
    throw new BadRequestException(
      "Event start and end times must be updated together.",
    );
  }
  const startAt = new Date(startValue);
  const endAt = new Date(endValue);
  if (
    Number.isNaN(startAt.getTime()) ||
    Number.isNaN(endAt.getTime()) ||
    endAt <= startAt
  ) {
    throw new BadRequestException(
      "Event end time must be after its start time.",
    );
  }
  return { startAt, endAt };
}
