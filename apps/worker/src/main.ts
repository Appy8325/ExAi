import { Redis } from 'ioredis';

/**
 * Worker bootstrap (docs/27-background-jobs-architecture.md §11): a single
 * process runs one BullMQ Worker per queue in src/queues/, the repeatable
 * jobs in src/scheduled/, and the outbox relay poll loop in src/outbox-relay/,
 * all sharing one Redis connection. This file wires the connection only —
 * Milestone 0 scaffolding, no consumers registered yet.
 *
 * Each consumer under src/queues/ is expected to import `connection` from
 * here (or construct its own from WORKER_REDIS_URL) and register itself with
 * `new Worker(queueName, handler, { connection })` once its real handler
 * lands in a later milestone.
 */
const redisUrl = process.env.WORKER_REDIS_URL ?? (process.env.NODE_ENV === 'production' ? undefined : 'redis://localhost:6379');
if (!redisUrl) throw new Error('WORKER_REDIS_URL is required.');

export const connection = new Redis(
  redisUrl,
  { maxRetriesPerRequest: null },
);

async function main(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('[worker] starting knowledge ingestion consumer');

  await import('./queues/kb-ingest.consumer');

  // Queue consumers, scheduled repeatable jobs, and the outbox relay each
  // register themselves here once their real bodies land (docs/27 §5-§7):
  //   import './queues/webhook-deliver.consumer';
  //   import './queues/notification-dispatch.consumer';
  //   import './queues/kb-ingest.consumer';
  //   import './queues/ai-batch.consumer';
  //   import './queues/exports.consumer';
  //   import './queues/imports.consumer';
  //   import './queues/file-av-scan.consumer';
  //   import './queues/lead-voice-transcription.consumer';
  //   import './queues/analytics-ingest.consumer';
  //   import './scheduled/file-retention-sweep.job';
  //   import './outbox-relay/outbox-relay';
}

void main();
