# Project State — ExAi

Snapshot of where the repository actually is, for a migrating engineer or agent to pick up work without needing this chat transcript. This is a point-in-time status document, not architecture — it does not supersede anything in `/docs` (00-46) or the four canonical process docs ([BLUEPRINT_V1.md](BLUEPRINT_V1.md), [ENGINEERING_GUIDE.md](ENGINEERING_GUIDE.md), [IMPLEMENTATION_RULES.md](IMPLEMENTATION_RULES.md), [IMPLEMENTATION_PHASES.md](IMPLEMENTATION_PHASES.md)). Read those four first; this document assumes them.

**Snapshot date:** 2026-07-11.

---

## 1. Current milestone

**Milestone 0 — Platform Foundation** ([IMPLEMENTATION_PHASES.md](IMPLEMENTATION_PHASES.md)), in progress. Per team convention, M0 is being worked one ticket at a time rather than all 9 deliverables in a single pass — do not pull work forward into a later ticket "because it's convenient."

## 2. Completed tickets

| Ticket | Scope | Status |
|---|---|---|
| M0-0 (repo bootstrap) | Monorepo scaffold: `apps/{web,api,worker}`, all `packages/*`, `infra/`, CI pipeline skeleton — matches [37-monorepo-and-folder-structure.md](37-monorepo-and-folder-structure.md) exactly. Committed as `e226680`. | **Committed** |
| M0-1 (identity & tenancy schema) | The 8 identity/tenancy tables from [16-database-schema.md](16-database-schema.md) §3 (`organizations`, `users`, `organization_memberships`, `auth_sessions`, `api_keys`, `oauth_identities`, `webauthn_credentials`, `auth_tokens`): Drizzle schema, UUIDv7 generator migration, RLS policy per table, RLS isolation tests. | **Implemented, uncommitted** — see §3 and §5 |

M0-0's commit message overstated its scope ("platform foundation") — in reality only deliverable 1 of 9 was real; deliverables 2–9 were empty/stub shells. Don't trust that commit message as a completeness signal for anything beyond the folder scaffold.

## 3. Pending tickets

Remaining Milestone 0 deliverables ([IMPLEMENTATION_PHASES.md](IMPLEMENTATION_PHASES.md) M0), not yet started:

1. **M0-2 — Authentication wiring** (deliverable 3): Supabase Auth integration (email/password, OAuth, magic-link, passkeys) per [19-authentication-strategy.md](19-authentication-strategy.md), including the `public.users` provisioning trigger off Supabase's `auth.users` that M0-1 deliberately deferred. **Recommended next ticket — see §6.**
2. **M0-3 — Entitlement resolution service** (deliverable 4): `plans → subscriptions → entitlements` resolution + manual Platform Admin provisioning.
3. **M0-4 — Transactional email** (deliverable 5): SES wiring + the account-lifecycle templates needed by M0-2/M0-3 (only 1 of ~26 templates exists today, and it's a self-labeled scaffolding demo with no send path).
4. **M0-5 — Platform Admin baseline** (deliverable 6): tenant/user directory, manual entitlement provisioning UI.
5. **M0-6 — Audit logging** (deliverable 7): `audit_logs` table + synchronous write path from every privileged action introduced by M0-2/M0-3/M0-5.
6. **M0-7 — Observability baseline** (deliverable 8): Sentry, OTel, structured logging actually wired (packages installed but currently zero call sites).
7. **M0-8 — Concourse → ExAi rename** (deliverable 9, tracked non-blocking per [00-foundation.md](00-foundation.md) §14 Amendment A4): ~123 occurrences outside `/docs` — package names (`@concourse/*`), `docker-compose.yml` container/volume names, `supabase/config.toml` `project_id`, `.env.example` cookie name, `packages/api-contract/openapi/concourse.v1.json`.

Milestones 1–5 ([IMPLEMENTATION_PHASES.md](IMPLEMENTATION_PHASES.md)) have not been started and are blocked on Milestone 0's Definition of Done.

## 4. Current Git commit hash

```
e226680007d9cb7c42ebd97ca82ae096e3d93a21
```

Branch: whatever the default/current branch was at snapshot time (single commit history, no other branches observed).

**Working tree is dirty** — M0-1's implementation is uncommitted:

```
 D packages/database/migrations/.gitkeep
 M packages/database/package.json
 M packages/database/schema/identity.ts
?? packages/database/migrations/0001_uuid_v7.sql
?? packages/database/migrations/0002_identity_tenancy.sql
?? packages/database/migrations/meta/
?? packages/database/src/identity-rls.test.ts
```

A migrating engineer should decide whether to commit this working tree before continuing, per [ENGINEERING_GUIDE.md](ENGINEERING_GUIDE.md) §6 (one milestone deliverable per branch/PR, Conventional Commits, cite the blueprint doc(s) implemented).

## 5. Runtime validation pending

**None of M0-1's implementation has been executed.** The authoring environment had no Node, pnpm, or Docker installed at all — not a partial toolchain, a fully bare sandbox. Nothing below has ever been run:

- `pnpm install` (dependency resolution, including the newly-added `@testcontainers/postgresql` devDependency).
- `pnpm --filter database typecheck` — the Drizzle column builders used (`customType`, `check`, `.generatedAlwaysAs`) are unverified against `drizzle-orm@0.38.2`'s actual type signatures.
- `pnpm --filter database test` — the RLS isolation test suite (`packages/database/src/identity-rls.test.ts`) has never connected to a real Postgres.
- The UUIDv7 generator function (`packages/database/migrations/0001_uuid_v7.sql`) — the bit-manipulation (version/variant nibble setting) has never been executed. The migration file has an inline comment with the exact manual check to run (`SELECT concourse.uuid_generate_v7()` ×10, confirm version/variant nibbles and monotonic ordering).
- `packages/database/migrations/0002_identity_tenancy.sql` was hand-authored to stand in for `drizzle-kit generate` output (that command also never ran). It needs reconciling against a real `pnpm --filter database generate` run so drizzle-kit's snapshot/journal metadata reflects reality going forward.
- CI (`.github/workflows/ci.yml`) has never executed against this repository state — no confirmation the `affected` or `contract-check` jobs actually pass.

**First priority on a new machine with working tooling: run the commands in §9, then re-run the M0-1 validation above before trusting any of it.**

## 6. Next recommended ticket

**M0-2 — Authentication wiring**, per [19-authentication-strategy.md](19-authentication-strategy.md). It's the natural next step: it's the first real consumer of the tables M0-1 just created, and every later M0 deliverable (entitlements, audit logging, Platform Admin) depends on a working identity/session substrate. Read [19-authentication-strategy.md](19-authentication-strategy.md) and [20-session-strategy.md](20-session-strategy.md) in full before starting (they specify exactly which flows are Supabase-client-side vs. `apps/api`-side under Amendment A5).

## 7. Known risks

- **No tooling in the authoring environment.** Everything in §5 is unverified. Treat M0-1 as a draft pending its first real CI run, not as done.
- **UUIDv7 function correctness.** Hand-derived Postgres byte-manipulation for RFC 9562 compliance, never executed. Verify before any code relies on id ordering (e.g. cursor pagination per [18-api-architecture.md](18-api-architecture.md)).
- **drizzle-kit migration/snapshot drift.** `0002_identity_tenancy.sql` was hand-written, not tool-generated. The first real `drizzle-kit generate` run in a tooled environment must be checked carefully — if it doesn't recognize the hand-authored migration as already-applied, it may try to regenerate conflicting DDL.
- **Rename debt (M0-8) compounds with every ticket that lands before it.** Every new file created under M0-2 onward will use `@concourse/*` imports and `concourse_*` naming until the rename lands; the rename ticket's diff grows with every commit merged first. Consider sequencing it earlier than deliverable-order strictly implies, or accept a larger rename diff later — this is a call for the team, not a unilateral change; the ticket is currently deliverable 9 (last) per [IMPLEMENTATION_PHASES.md](IMPLEMENTATION_PHASES.md).
- **`docker-compose.yml` only provisions Redis.** Postgres/Auth/Storage/Realtime come from `supabase start` (the Supabase CLI), which requires Docker itself and a separate `supabase` CLI install not covered by `pnpm install`.
- **No `.env` files exist yet** — only `.env.example` (placeholders). A new machine cannot run `apps/api`, `apps/worker`, or `apps/web` until real Supabase local-stack keys are copied in per the file's own header comment.

## 8. Required software

| Tool | Version | Why |
|---|---|---|
| Node.js | 22.x (see `.nvmrc`, `package.json` `engines.node >=22.0.0`) | Runtime for all three apps + tooling |
| pnpm | 9.15.0 exactly (`packageManager` field) — `>=9.0.0` per `engines`, but pin to 9.15.0 to match the committed lockfile | Monorepo package manager / workspaces |
| Docker | any recent version supporting `docker compose` | Runs Redis (`docker-compose.yml`) and, via the Supabase CLI, the local Postgres+pgvector/Auth/Storage/Realtime stack |
| Supabase CLI | latest stable | `supabase start` — local Database/Auth/Storage/Realtime per `supabase/config.toml` |
| Git | any recent version | — |

Not required to install separately: TypeScript, Turborepo, Vitest, Playwright, drizzle-kit, ESLint — all installed as workspace devDependencies via `pnpm install`.

## 9. Setup commands

Run from the repository root, in order:

```bash
# 1. Correct Node version (if using nvm/fnm/volta)
nvm use   # reads .nvmrc

# 2. Install pnpm at the pinned version (skip if already present)
corepack enable
corepack prepare pnpm@9.15.0 --activate

# 3. Install all workspace dependencies
pnpm install

# 4. Copy env template and fill in real values
#    (apps/web/.env.local, apps/api/.env, apps/worker/.env — see the
#    header comment in .env.example for which prefix goes where)
cp .env.example .env.local.reference   # reference only; do not commit
# then manually populate apps/web/.env.local, apps/api/.env, apps/worker/.env

# 5. Start Redis
docker compose up -d

# 6. Start the local Supabase stack (Postgres+pgvector, Auth, Storage, Realtime, Studio)
supabase start

# 7. Apply database migrations
pnpm --filter database migrate
```

## 10. First commands to run on a new machine

Once §9 is complete, run these to establish a known-good baseline before writing any new code:

```bash
# Confirm the workspace resolves and builds
pnpm turbo run build lint typecheck

# Confirm the uncommitted M0-1 work actually passes (see §5 — never verified)
pnpm --filter database typecheck
pnpm --filter database test

# Manually sanity-check the UUIDv7 generator (see the comment in
# packages/database/migrations/0001_uuid_v7.sql for exactly what to check)
psql "$API_DATABASE_URL" -c "SELECT concourse.uuid_generate_v7();"

# Confirm CI would pass locally before pushing
pnpm turbo run build lint typecheck test
```

If `pnpm --filter database test` fails, treat that as expected discovery work, not a regression — this suite has literally never run before (see §5).

---

## Related documents

- [BLUEPRINT_V1.md](BLUEPRINT_V1.md), [ENGINEERING_GUIDE.md](ENGINEERING_GUIDE.md), [IMPLEMENTATION_RULES.md](IMPLEMENTATION_RULES.md), [IMPLEMENTATION_PHASES.md](IMPLEMENTATION_PHASES.md) — the four documents this snapshot assumes and never overrides.
- [00-foundation.md](00-foundation.md) §14 — Amendments Log (A1–A5), including the Supabase adoption (A5) and the Concourse→ExAi rename tracking (A4) referenced above.
