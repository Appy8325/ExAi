import { Module } from '@nestjs/common';
import { LeadFormsService } from './lead-forms.service';
import { LeadFormsRepository } from './lead-forms.repository';

/**
 * EngagementModule — owns booth_visits, leads, lead_notes, meetings (docs/18-api-architecture.md §1).
 * Milestone 0 scaffolding only: empty shell module, no providers/controllers wired.
 * Real routes/services land in the milestone that implements this domain
 * (see docs/45-implementation-roadmap.md for the per-module milestone mapping).
 */
@Module({ providers: [LeadFormsRepository, LeadFormsService], exports: [LeadFormsService] })
export class EngagementModule {}
