import { Worker } from 'bullmq';
import { connection } from '../main';

/**
 * exports queue consumer (docs/27-background-jobs-architecture.md §5.5).
 * Milestone 0 scaffolding only: correct BullMQ Worker registration shape,
 * handler intentionally unimplemented. Real payload handling lands with the
 * milestone that owns this queue's business logic.
 */
export const exportsWorker = new Worker(
  'exports',
  async (_job) => {
    throw new Error('not implemented');
  },
  { connection },
);
