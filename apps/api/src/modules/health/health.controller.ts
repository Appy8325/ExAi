import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DATABASE_CLIENT, type DatabaseClient } from '../../common/database-client';

/**
 * HealthController — /healthz, /readyz (unauthenticated, ALB-internal),
 * docs/18-api-architecture.md §1.
 *
 * Health checks are infrastructure, not business logic, so this controller is
 * genuinely implemented in Milestone 0 (unlike every other module stub in
 * src/modules, which are intentionally empty). Real liveness/readiness signal
 * (DB/Redis/Supabase connectivity checks) can be layered on in a later milestone
 * without changing this shape.
 */
@Controller()
export class HealthController {
  constructor(@Inject(DATABASE_CLIENT) private readonly database: DatabaseClient) {}

  @Get('healthz')
  healthz(): { status: 'ok' } {
    return { status: 'ok' };
  }

  @Get('readyz')
  async readyz(): Promise<{ status: 'ok' }> {
    try {
      await this.database.execute(sql`SELECT 1`);
      return { status: 'ok' };
    } catch {
      throw new ServiceUnavailableException('Database is unavailable.');
    }
  }
}
