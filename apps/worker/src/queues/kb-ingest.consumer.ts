import { Queue, Worker } from 'bullmq';
import { connection } from '../main';
import { ingestSource, pendingSourceIds } from '../knowledge/ingest';

/**
 * kb-ingest queue consumer (docs/27-background-jobs-architecture.md §5.3).
 * Milestone 0 scaffolding only: correct BullMQ Worker registration shape,
 * handler intentionally unimplemented. Real payload handling lands with the
 * milestone that owns this queue's business logic.
 */
export const kbIngestWorker = new Worker(
  'kb-ingest',
  async (job) => {
    await ingestSource(String(job.data.sourceId));
  },
  { connection, concurrency: 2 },
);

const queue = new Queue('kb-ingest', { connection });

async function enqueuePending() {
  for (const source of await pendingSourceIds()) {
    await queue.add('ingest', { sourceId: source.id }, {
      jobId: source.id, attempts: 3, backoff: { type: 'exponential', delay: 2_000 },
      removeOnComplete: true, removeOnFail: 100,
    });
  }
}

void enqueuePending();
setInterval(() => void enqueuePending().catch((error) =>
  console.error('[worker] knowledge poll failed', error)), 5_000).unref();
