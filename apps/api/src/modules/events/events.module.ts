import { Module } from '@nestjs/common';

import { EventsRepository } from './events.repository';
import { EventsService } from './events.service';

/**
 * EventsModule — owns events, event_staff (docs/18-api-architecture.md §1).
 * Milestone 0 scaffolding only: empty shell module, no providers/controllers wired.
 * Real routes/services land in the milestone that implements this domain
 * (see docs/45-implementation-roadmap.md for the per-module milestone mapping).
 */
@Module({
  providers: [EventsRepository, EventsService],
  exports: [EventsService],
})
export class EventsModule {}
