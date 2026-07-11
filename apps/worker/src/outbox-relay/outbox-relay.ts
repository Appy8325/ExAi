/**
 * outbox-relay — the non-queue `domain_events` poll loop (docs/25-event-pipeline.md
 * §4, referenced from docs/27-background-jobs-architecture.md §7). Not a BullMQ
 * queue: a small continuously-running loop, safe to run as multiple replicas via
 * `FOR UPDATE SKIP LOCKED`, that reads `domain_events` and enqueues onto
 * `webhook-deliver`, `notification-dispatch`, `ai-batch`, `analytics-ingest`, and
 * (conditionally) `lead-voice-transcription`.
 *
 * Milestone 0 scaffolding only: this file documents the poll-loop shape: no
 * polling, batching, ordering, or crash-safety logic implemented yet. Real
 * content lands with the event-pipeline milestone (docs/25-event-pipeline.md).
 */
export {};
