import { Injectable, PipeTransform } from '@nestjs/common';

/**
 * IdempotencyKeyPipe — placeholder for the `Idempotency-Key` handling
 * described in docs/18-api-architecture.md §3.6 (Redis-backed replay/conflict
 * detection keyed `idem:{principalId}:{method}:{route}:{key}`, 24h TTL).
 *
 * Milestone 0 scaffolding only: correct PipeTransform shape, no storage/replay
 * logic wired. Real content lands with the module(s) that expose POST routes
 * requiring idempotency (docs/45-implementation-roadmap.md).
 */
@Injectable()
export class IdempotencyKeyPipe implements PipeTransform {
  transform(value: unknown): unknown {
    return value;
  }
}
