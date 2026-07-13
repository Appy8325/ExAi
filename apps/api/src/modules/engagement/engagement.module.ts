import { Module } from '@nestjs/common';
import { LeadFormsService } from './lead-forms.service';
import { LeadFormsRepository } from './lead-forms.repository';
import { LeadSubmissionsRepository } from './lead-submissions.repository';
import { LeadSubmissionsService } from './lead-submissions.service';
import { RelationshipNotesRepository } from './relationship-notes.repository';
import { RelationshipNotesService } from './relationship-notes.service';
import { RelationshipWorkspaceRepository } from './relationship-workspace.repository';
import { RelationshipWorkspaceService } from './relationship-workspace.service';
import { db } from '@concourse/database';
import { DATABASE_CLIENT } from '../../common/database-client';
import { AuthModule } from '../auth/auth.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { RelationshipWorkspaceController } from './relationship-workspace.controller';
import { ExhibitorDashboardRepository } from './exhibitor-dashboard.repository';
import { ExhibitorDashboardService } from './exhibitor-dashboard.service';
import { ExhibitorDashboardController } from './exhibitor-dashboard.controller';
import { PlatformEnrollmentService } from './platform-enrollment.service';
import { PublicEnrollmentController } from './public-enrollment.controller';

/**
 * EngagementModule — owns booth_visits, leads, lead_notes, meetings (docs/18-api-architecture.md §1).
 * Milestone 0 scaffolding only: empty shell module, no providers/controllers wired.
 * Real routes/services land in the milestone that implements this domain
 * (see docs/45-implementation-roadmap.md for the per-module milestone mapping).
 */
@Module({ imports: [AuthModule, OrganizationsModule], controllers: [RelationshipWorkspaceController, ExhibitorDashboardController, PublicEnrollmentController], providers: [{ provide: DATABASE_CLIENT, useValue: db }, LeadFormsRepository, LeadFormsService, LeadSubmissionsRepository, LeadSubmissionsService, RelationshipNotesRepository, RelationshipNotesService, RelationshipWorkspaceRepository, RelationshipWorkspaceService, ExhibitorDashboardRepository, ExhibitorDashboardService, PlatformEnrollmentService], exports: [LeadFormsService, LeadSubmissionsService, RelationshipNotesService, RelationshipWorkspaceService, ExhibitorDashboardService] })
export class EngagementModule {}
