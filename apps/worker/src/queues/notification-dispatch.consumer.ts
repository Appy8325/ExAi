import { Worker } from 'bullmq';
import { connection } from '../main';

/**
 * notification-dispatch queue consumer (docs/27-background-jobs-architecture.md §5.2).
 * Milestone 0 scaffolding only: correct BullMQ Worker registration shape,
 * handler intentionally unimplemented. Real payload handling lands with the
 * milestone that owns this queue's business logic.
 */
export const notificationDispatchWorker = new Worker(
  'notification-dispatch',
  async (_job) => {
    throw new Error('not implemented');
  },
  { connection },
);
