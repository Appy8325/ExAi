# ExAi AI Handoff

This document tells a new AI assistant how to work in this repository. It does not grant permission to implement beyond the assigned ticket and does not replace the frozen architecture.

## Onboard in this order

1. [START_HERE.md](START_HERE.md)
2. [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)
3. [docs/PROJECT_STATE.md](docs/PROJECT_STATE.md)
4. [DECISIONS_LOG.md](DECISIONS_LOG.md)
5. [docs/00-foundation.md](docs/00-foundation.md)
6. [docs/BLUEPRINT_V1.md](docs/BLUEPRINT_V1.md)
7. [docs/IMPLEMENTATION_RULES.md](docs/IMPLEMENTATION_RULES.md)
8. [docs/IMPLEMENTATION_PHASES.md](docs/IMPLEMENTATION_PHASES.md)
9. Only the numbered blueprint documents directly relevant to the assigned ticket.

Do not reread all 47 numbered documents for every small ticket. First identify the current milestone and the owner document for the concern.

## Development workflow

```text
Small ticket
  -> inspect current state and relevant blueprint sections
  -> confirm dependencies and scope
  -> implement the minimum correct change
  -> run proportionate validation
  -> review architecture and working-tree scope
  -> report and commit when authorized
  -> stop
```

Keep planning, implementation, validation, and reporting inside the ticket boundary. Do not automatically begin the next ticket.

## Required ticket format

Use this shape when creating or interpreting work:

```text
Ticket: <stable ID and short title>
Milestone: <M0-M5>
Objective: <one testable outcome>

In scope:
- ...

Out of scope:
- ...

Blueprint owners:
- docs/<owner>.md section ...

Constraints:
- no unrelated changes
- no architecture invention

Validation:
- exact commands appropriate to the change

Deliverables:
- summary
- files changed
- validation results
- deviations/remaining work

Stop condition:
- stop after this ticket
```

If the ticket is ambiguous in a way that changes architecture, stop and request a documented decision. Do not silently choose a new convention.

## Validation requirements

The standard repository gates are:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Use targeted commands while iterating, then run every gate required by the ticket and [docs/42-testing-strategy.md](docs/42-testing-strategy.md). Examples:

```bash
pnpm --filter web build
pnpm --filter @concourse/database typecheck
pnpm --filter @concourse/database test
```

Never report a command as passing unless it was executed in the current checkout. Separate:

- **Passed** — command executed successfully.
- **Failed** — command executed and the first relevant failure is reported.
- **Not run** — state why.
- **Pre-existing failure** — prove it is outside the ticket and do not hide it.

Current known state is in [docs/PROJECT_STATE.md](docs/PROJECT_STATE.md), not in chat history.

## Coding standards

- Preserve strict TypeScript; do not use `any` or non-null assertions as error suppression.
- Do not disable ESLint rules to make a ticket green. Fix the cause or scope an exception only where the runtime format requires it.
- Use type-only imports when a symbol is used only as a type.
- Follow the naming, database, API, validation, and component conventions in [docs/ENGINEERING_GUIDE.md](docs/ENGINEERING_GUIDE.md) §5.
- Put shared Zod resource schemas in `packages/shared`.
- Keep UI primitives and self-hosted assets in `packages/ui`; consume semantic design tokens.
- Only `packages/ai` may import model-provider SDKs.
- Every tenant-owned table ships with RLS and a same-change isolation test.
- Never hardcode credentials, environment secrets, tenant IDs, role strings, entitlement keys, or unregistered error codes.

## Architecture principles

1. The frozen blueprint is the design; code proves it.
2. `docs/00-foundation.md` is the first authority when documents disagree.
3. Preserve the pnpm/Turborepo modular-monorepo boundaries.
4. Keep business logic single-sourced and reusable only after a real second use appears.
5. Supabase owns managed Database/Auth/Storage/Realtime concerns described by Amendments A5-A6; do not reintroduce the superseded stack.
6. Application scoping and PostgreSQL RLS are defense in depth, not alternatives.
7. AI is additive: deterministic fallback behavior must work without a model call.
8. Offline, security, privacy, accessibility, and performance budgets are release constraints.

## Things an AI must never do

- Regenerate or wholesale rewrite the architecture documents.
- Invent a route, entity, status, role, permission, entitlement, error code, queue, event, or provider.
- Pull a later milestone into the current ticket.
- Implement login UI or account business flows merely because auth infrastructure exists.
- Replace Supabase auth with a different pattern.
- Replace self-hosted fonts with a CDN or `next/font` without an approved architecture amendment.
- Bypass lint, typecheck, tests, RLS, or Git hooks.
- Add placeholder tests, dead code, unresolved TODOs, or speculative abstractions.
- Modify unrelated user changes in the dirty working tree.
- Commit secrets, generated build output, or local environment files.
- Claim M0 or a ticket is complete while required gates are failing or unexecuted.

## Repository and Git rules

- Inspect `git status` before and after editing. Existing changes belong to the current project state; preserve them.
- Work on one independently reviewable ticket.
- Use branch names `feat|fix|chore/<scope>-<description>` and Conventional Commits when a branch/commit is requested.
- Cite the blueprint owner documents in the PR/commit body.
- Do not force-push, rewrite history, or use destructive resets.
- The current `m0-validation-complete` tag is not trustworthy as a completion marker; see [docs/PROJECT_STATE.md](docs/PROJECT_STATE.md).
- Generated `.js`, `.d.ts`, source maps, build directories, secrets, and local environment files are ignored. `pnpm-lock.yaml`, migrations, docs, source, and font assets must remain trackable.

## Stopping conditions

Stop and report when any of these is true:

- The assigned objective is complete.
- A required architecture decision is missing or contradictory after checking `00-foundation.md`.
- The next action would expand scope or enter another milestone.
- Validation reaches the first failure the ticket asked you to investigate.
- A required external credential, service, or user decision is unavailable.
- Continuing would overwrite unrelated work or require a destructive operation.

When blocked, report the exact evidence, what was attempted, and the smallest decision or state change needed to continue.

## Definition of Done

A ticket is done only when:

1. Its stated scope is fully satisfied without unrelated changes.
2. The implementation matches the named blueprint owner documents.
3. Required tests and validation have run and passed, or every remaining pre-existing failure is explicitly evidenced.
4. Security, tenancy, type-safety, accessibility, and performance requirements relevant to the change are satisfied.
5. Files changed and architectural choices are reported.
6. Documentation is updated only when observable behavior or factual project state changed.
7. Remaining work and known limitations are identified.
8. The repository is left understandable from its files alone.
9. The assistant stops instead of beginning the next ticket.
