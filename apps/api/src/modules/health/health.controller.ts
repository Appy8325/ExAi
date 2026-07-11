import { Controller, Get } from '@nestjs/common';

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
  @Get('healthz')
  healthz(): { status: 'ok' } {
    return { status: 'ok' };
  }

  @Get('readyz')
  readyz(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
