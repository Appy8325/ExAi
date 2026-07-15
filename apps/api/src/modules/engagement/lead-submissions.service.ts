import { BadRequestException, Injectable } from "@nestjs/common";
import type { LeadSubmissionsRepository } from "./lead-submissions.repository";
import type { CreateLeadSubmissionInput } from "./lead-submissions.repository";

@Injectable()
export class LeadSubmissionsService {
  constructor(private readonly repository: LeadSubmissionsRepository) {}
  create(input: CreateLeadSubmissionInput) {
    if (input.interactionSource !== "visitor_qr" && input.interactionSource !== "exhibitor_device") throw new BadRequestException("Unsupported interaction source.");
    return this.repository.create(input);
  }
  ensureRelationship(input: { organizationId: string; actorUserId: string; eventExhibitorId: string; attendeeUserId: string }) { return this.repository.ensureRelationship(input); }
  prefill(input: Pick<CreateLeadSubmissionInput, "organizationId" | "actorUserId" | "leadFormId" | "attendeeUserId">) { return this.repository.prefill(input); }
}
