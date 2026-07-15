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
import { PublicBoothController } from './public-booth.controller';
import { AttendeeProfileController } from './attendee-profile.controller';
import { AttendeeProfileService } from './attendee-profile.service';
import { PublicExhibitorsController } from './public-exhibitors.controller';
import { PublicExhibitorsService } from './public-exhibitors.service';
import { AttendeeRelationshipsController } from './attendee-relationships.controller';
import { AttendeeRelationshipsService } from './attendee-relationships.service';

@Module({
  imports: [AuthModule, OrganizationsModule],
  controllers: [
    RelationshipWorkspaceController,
    ExhibitorDashboardController,
    PublicEnrollmentController,
    PublicBoothController,
    AttendeeProfileController,
    PublicExhibitorsController,
    AttendeeRelationshipsController,
  ],
  providers: [
    { provide: DATABASE_CLIENT, useValue: db },
    LeadFormsRepository, LeadFormsService,
    LeadSubmissionsRepository, LeadSubmissionsService,
    RelationshipNotesRepository, RelationshipNotesService,
    RelationshipWorkspaceRepository, RelationshipWorkspaceService,
    ExhibitorDashboardRepository, ExhibitorDashboardService,
    PlatformEnrollmentService,
    AttendeeProfileService,
    PublicExhibitorsService,
    AttendeeRelationshipsService,
  ],
  exports: [LeadFormsService, LeadSubmissionsService, RelationshipNotesService, RelationshipWorkspaceService, ExhibitorDashboardService],
})
export class EngagementModule {}
