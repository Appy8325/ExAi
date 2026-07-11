import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

/**
 * HealthModule — owns /healthz, /readyz (docs/18-api-architecture.md §1).
 *
 * Health checks are infra, not business logic, so this module wires a real
 * controller in Milestone 0 (the one exception among the 20 modules listed
 * in docs/18-api-architecture.md §1, all of which are otherwise empty shells).
 */
@Module({
  controllers: [HealthController],
})
export class HealthModule {}
