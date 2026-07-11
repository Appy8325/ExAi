/**
 * file-retention-sweep — repeatable (cron) job, daily 0 3 * * * UTC
 * (docs/27-background-jobs-architecture.md §6). Executes the retention
 * schedule against `files` (docs/38-data-retention-privacy-compliance.md,
 * docs/26-file-storage.md §9.3) plus sweeps orphaned `pending` uploads and
 * abandoned `background_jobs` rows in the same tick.
 *
 * Milestone 0 scaffolding only: this file documents the repeatable-job
 * registration pattern (a BullMQ `Queue.upsertJobScheduler` / repeatable
 * `add` call against a dedicated queue or the worker's own scheduler,
 * wired from src/main.ts once implemented) — no real sweep logic here yet.
 * Real content lands with the retention/compliance milestone.
 */
export {};
