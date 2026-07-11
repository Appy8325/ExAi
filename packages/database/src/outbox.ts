/**
 * Transactional outbox pattern — owned in full by
 * docs/25-event-pipeline.md §3-4 (the `outbox_events` table shape, the
 * non-queue SKIP LOCKED relay loop in apps/worker/src/outbox-relay/).
 * This is a placeholder stub for Milestone 0 tooling scaffolding only;
 * real logic lands when that milestone's work begins.
 */
export async function writeOutboxEvent(_event: unknown): Promise<void> {
  throw new Error('writeOutboxEvent: not implemented — see docs/25-event-pipeline.md §3-4');
}
