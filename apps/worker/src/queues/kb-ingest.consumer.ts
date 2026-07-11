import { Worker } from 'bullmq';
import { connection } from '../main';

/**
 * kb-ingest queue consumer (docs/27-background-jobs-architecture.md §5.3).
 * Milestone 0 scaffolding only: correct BullMQ Worker registration shape,
 * handler intentionally unimplemented. Real payload handling lands with the
 * milestone that owns this queue's business logic.
 */
export const kbIngestWorker = new Worker(
  'kb-ingest',
  async (_job) => {
    throw new Error('not implemented');
  },
  { connection },
);
