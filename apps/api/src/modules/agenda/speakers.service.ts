import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";

import { SpeakersRepository } from "./speakers.repository";

export interface CreateSpeakerInput {
  organizationId: string;
  actorUserId: string;
  eventId: string;
  name: string;
  bio?: string;
  photoUrl?: string;
  company?: string;
  title?: string;
  socialLinks?: Array<{ platform: string; url: string }>;
  sortOrder?: number;
}

export interface UpdateSpeakerInput {
  organizationId: string;
  actorUserId: string;
  eventId: string;
  speakerId: string;
  name?: string;
  bio?: string | null;
  photoUrl?: string | null;
  company?: string | null;
  title?: string | null;
  socialLinks?: Array<{ platform: string; url: string }> | null;
  sortOrder?: number | null;
}

@Injectable()
export class SpeakersService {
  constructor(@Inject(SpeakersRepository) private readonly repository: SpeakersRepository) {}

  create(input: CreateSpeakerInput) {
    const name = requireName(input.name);
    return this.repository.create({ ...input, name });
  }

  findById(organizationId: string, eventId: string, speakerId: string, actorUserId: string) {
    return this.repository.findById(organizationId, eventId, speakerId, actorUserId);
  }

  listByEvent(organizationId: string, eventId: string, actorUserId: string) {
    return this.repository.listByEvent(organizationId, eventId, actorUserId);
  }

  async update(input: UpdateSpeakerInput) {
    const name = input.name === undefined ? undefined : requireName(input.name);
    const speaker = await this.repository.update({ ...input, name });
    if (!speaker) throw new NotFoundException("Speaker not found.");
    return speaker;
  }

  async delete(organizationId: string, eventId: string, speakerId: string, actorUserId: string) {
    const speaker = await this.repository.delete(organizationId, eventId, speakerId, actorUserId);
    if (!speaker) throw new NotFoundException("Speaker not found.");
    return speaker;
  }
}

function requireName(value: string): string {
  const name = value.trim();
  if (!name) throw new BadRequestException("Speaker name is required.");
  return name;
}
