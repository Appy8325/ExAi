# `elasticache` module

Future purpose: the ElastiCache for Redis 7 cluster backing BullMQ queues (`apps/worker`), session/cache reads from `apps/api`, and rate-limiting state, per [docs/00-foundation.md](../../../docs/00-foundation.md) §6. Still required post-Supabase-adoption — Supabase replaces Postgres/storage/auth, not Redis.

Depends on the `network` module for its subnet group placement.

Not built out yet — this is Milestone 0 tooling scaffolding only. Real resource blocks land when the infra workstream begins in earnest.
