import { BadRequestException, Injectable } from "@nestjs/common";
import { LeadSubmissionsRepository, type CreateLeadSubmissionInput } from "./lead-submissions.repository";
import { LeadIntelligenceService } from "./lead-intelligence.service";

@Injectable()
export class LeadSubmissionsService {
  constructor(private readonly repository: LeadSubmissionsRepository, private readonly intelligence: LeadIntelligenceService) {}
  async create(input: CreateLeadSubmissionInput) {
    if (input.interactionSource !== "visitor_qr" && input.interactionSource !== "exhibitor_device") throw new BadRequestException("Unsupported interaction source.");
    const submission = await this.repository.create(input);
    await this.intelligence.enrich({ submissionId: submission.id, organizationId: input.organizationId, actorUserId: input.actorUserId, eventId: input.eventId, eventExhibitorId: input.eventExhibitorId });
    return submission;
  }
  ensureRelationship(input: { organizationId: string; actorUserId: string; eventExhibitorId: string; attendeeUserId: string }) { return this.repository.ensureRelationship(input); }
  prefill(input: Pick<CreateLeadSubmissionInput, "organizationId" | "actorUserId" | "leadFormId" | "attendeeUserId">) { return this.repository.prefill(input); }
}
