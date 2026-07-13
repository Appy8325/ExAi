import { Module } from '@nestjs/common';

import { AgendaSessionsRepository } from './agenda-sessions.repository';
import { AgendaSessionsService } from './agenda-sessions.service';

/**
 * AgendaModule — owns agenda_sessions, session_checkins (docs/18-api-architecture.md §1).
 * Milestone 0 scaffolding only: empty shell module, no providers/controllers wired.
 * Real routes/services land in the milestone that implements this domain
 * (see docs/45-implementation-roadmap.md for the per-module milestone mapping).
 */
@Module({
  providers: [AgendaSessionsRepository, AgendaSessionsService],
  exports: [AgendaSessionsService],
})
export class AgendaModule {}
