import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";

import { AgendaSessionsRepository } from "./agenda-sessions.repository";

export interface CreateAgendaSessionInput {
  organizationId: string;
  actorUserId: string;
  eventId: string;
  title: string;
  slug?: string;
  description?: string;
  startAt: Date | string;
  endAt: Date | string;
  timezone: string;
  room?: string;
  capacity?: number;
}

export interface UpdateAgendaSessionInput {
  organizationId: string;
  actorUserId: string;
  eventId: string;
  sessionId: string;
  title?: string;
  slug?: string;
  description?: string | null;
  startAt?: Date | string;
  endAt?: Date | string;
  timezone?: string;
  room?: string | null;
  capacity?: number | null;
}

@Injectable()
export class AgendaSessionsService {
  constructor(@Inject(AgendaSessionsRepository) private readonly sessionsRepository: AgendaSessionsRepository) {}

  create(input: CreateAgendaSessionInput) {
    const title = requireTitle(input.title);
    const slug = validateSlug(slugify(input.slug ?? title));
    const { startAt, endAt } = validateDates(input.startAt, input.endAt);
    validateTimezone(input.timezone);
    validateCapacity(input.capacity);
    return this.sessionsRepository.create({ ...input, title, slug, startAt, endAt });
  }

  findById(organizationId: string, eventId: string, sessionId: string, actorUserId: string) {
    return this.sessionsRepository.findById(organizationId, eventId, sessionId, actorUserId);
  }

  async update(input: UpdateAgendaSessionInput) {
    const title = input.title === undefined ? undefined : requireTitle(input.title);
    const slug = input.slug === undefined ? undefined : validateSlug(slugify(input.slug));
    if (input.timezone !== undefined) validateTimezone(input.timezone);
    validateCapacity(input.capacity);
    const dates = validateDates(input.startAt, input.endAt, true);
    const { startAt: _startAt, endAt: _endAt, ...record } = input;
    const session = await this.sessionsRepository.update({ ...record, title, slug, ...dates });
    if (!session) throw new NotFoundException("Session not found or archived.");
    return session;
  }

  async archive(organizationId: string, eventId: string, sessionId: string, actorUserId: string) {
    const session = await this.sessionsRepository.archive(organizationId, eventId, sessionId, actorUserId);
    if (!session) throw new NotFoundException("Session not found or already archived.");
    return session;
  }
}

export function agendaSessionSlug(value: string): string {
  return slugify(value);
}

function requireTitle(value: string): string {
  const title = value.trim();
  if (!title) throw new BadRequestException("Session title is required.");
  return title;
}

function slugify(value: string): string {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 63);
}

function validateSlug(value: string): string {
  if (!/^[a-z0-9-]{3,63}$/.test(value)) {
    throw new BadRequestException("Session slug must contain 3-63 lowercase letters, numbers, or hyphens.");
  }
  return value;
}

function validateTimezone(timezone: string) {
  try { Intl.DateTimeFormat(undefined, { timeZone: timezone }); }
  catch { throw new BadRequestException("Session timezone must be a valid IANA timezone."); }
}

function validateCapacity(capacity: number | null | undefined) {
  if (capacity !== undefined && capacity !== null && (!Number.isInteger(capacity) || capacity < 0)) {
    throw new BadRequestException("Session capacity must be a non-negative integer.");
  }
}

function validateDates(startValue: Date | string, endValue: Date | string): { startAt: Date; endAt: Date };
function validateDates(startValue: Date | string | undefined, endValue: Date | string | undefined, optional: true): { startAt?: Date; endAt?: Date };
function validateDates(startValue: Date | string | undefined, endValue: Date | string | undefined, optional = false) {
  if (optional && startValue === undefined && endValue === undefined) return { startAt: undefined, endAt: undefined };
  if (startValue === undefined || endValue === undefined) {
    throw new BadRequestException("Session start and end times must be updated together.");
  }
  const startAt = new Date(startValue);
  const endAt = new Date(endValue);
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime()) || endAt <= startAt) {
    throw new BadRequestException("Session end time must be after its start time.");
  }
  return { startAt, endAt };
}
