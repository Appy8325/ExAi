# Testcontainers integration-test convention

This documents the integration-tier pattern fixed by [docs/42-testing-strategy.md](../../../docs/42-testing-strategy.md) §5-§6 (the seeded fixture-event pattern) as a written convention for later milestones to follow. It is not itself a test runner config -- there is nothing to seed yet (no application behavior exists in this Milestone 0 scaffolding pass) -- it is the reference future integration suites (`apps/api`, `apps/worker`, `packages/ai`) should implement against.

## Containers

Every integration run provisions, per Vitest worker (not per test file, to amortize ~1-2s container startup):

- One ephemeral **Postgres 16 + pgvector** container via `@testcontainers/postgresql`, migrated with the same `drizzle-kit` migrations (`packages/database/migrations`) that run in production.
- One ephemeral **Redis 7** container via `@testcontainers/redis`.

## Isolation strategy

- One container pair per Vitest worker, reused across that worker's whole file set.
- Each test runs inside a transaction: `BEGIN` in `beforeEach`, `ROLLBACK` in `afterEach`, so tests within a worker never see each other's writes without a full re-seed.
- Tests that specifically need cross-transaction visibility (e.g., verifying a BullMQ consumer reads a row a prior request committed) opt out of the rollback wrapper explicitly and truncate the tables they touched in `afterEach` instead.

## The seeded fixture event

Every integration suite reads from **one canonical fixture event** ("TechExpo 2027", per doc 42 §6.1) rather than each subsystem inventing its own dataset. The seed will live in `packages/testing/fixtures/techexpo-2027/` as a set of typed, composable factory functions (`packages/testing/fixtures/factory.ts` -- one factory per entity, e.g. `createLead({ status: 'qualified' })` fills every other field with a sensible default) plus one `seedFixtureEvent(db)` entry point that inserts the full graph in dependency order inside a single transaction.

Key properties this pattern depends on (doc 42 §6.2):

- **Determinism:** every seeded row uses a fixed, checked-in UUIDv7 (never `randomUUID()`), so ids referenced in AI eval golden sets (`evals/*/golden.jsonl`) and RLS isolation tests stay stable across every run, everywhere.
- **Idempotency:** `seedFixtureEvent` is safe to call against an already-seeded database (upsert semantics), so it can run once per CI job or once per Testcontainers-provisioned container without an "already exists" failure.

## Reuse across layers

The same `seedFixtureEvent()` call is the substrate for:

- Integration tests (this package) -- re-seeded per container lifetime.
- E2E tests (Playwright) -- seeded once per CI run against the preview stack.
- AI evals (`evals/*`) -- golden-set queries resolve against the fixed evidence/lead/document ids this seed produces.
- RLS isolation tests -- the fixture's 4 exhibitor orgs + 1 organizer org supply the ≥2 real tenants the isolation matrix needs.

## Status

Not implemented yet. `packages/testing/` (the fixtures package itself) does not exist as of this Milestone 0 tooling pass -- there is no application schema/behavior to seed against. This README is the written convention; the factory functions and `seedFixtureEvent` entry point land alongside the first feature that needs real integration coverage.
