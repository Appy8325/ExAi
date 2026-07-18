import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { db } from '@concourse/database';
import { DATABASE_CLIENT } from '../../common/database-client';

/**
 * HealthModule — owns /healthz, /readyz (docs/18-api-architecture.md §1).
 *
 * Health checks are infra, not business logic, so this module wires a real
 * controller in Milestone 0 (the one exception among the 20 modules listed
 * in docs/18-api-architecture.md §1, all of which are otherwise empty shells).
 */
@Module({
  controllers: [HealthController],
  providers: [{ provide: DATABASE_CLIENT, useValue: db }],
})
export class HealthModule {}
