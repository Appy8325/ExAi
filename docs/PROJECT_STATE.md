# Project State — ExAi

This is a point-in-time implementation snapshot for a migrating engineer or AI assistant. It does not supersede the frozen architecture in docs 00-46 or the process documents [BLUEPRINT_V1.md](BLUEPRINT_V1.md), [ENGINEERING_GUIDE.md](ENGINEERING_GUIDE.md), [IMPLEMENTATION_RULES.md](IMPLEMENTATION_RULES.md), and [IMPLEMENTATION_PHASES.md](IMPLEMENTATION_PHASES.md).

**Snapshot date:** 2026-07-13.

**Current milestone:** Milestone 0 — Platform Foundation, in progress.

**Completed engineering milestones:** None.

## 1. Git and working-tree state

Verified in the active checkout:

- Branch: `master`.
- HEAD: `fb962107f8d7abed3d7f764c3a9692a14ea9d63c` (`feat(m0): import ExAi blueprint and platform foundation`).
- The worktree is dirty. Repository stabilization, documentation reconciliation, root control files, fonts, and web auth-foundation changes are not committed.
- Tag `m0-validation-complete` points to the current HEAD, which predates the uncommitted validation and auth work. The tag name therefore overstates the state and must not be used as completion evidence.

Always run `git status`, `git rev-parse HEAD`, and `git tag --points-at HEAD` before relying on this snapshot.

## 2. Implementation status verified by inspection

### M0 deliverable 1 — Repository scaffold: partial

- The monorepo shape exists: `apps/{web,api,worker}`, `packages/{ai,api-client,api-contract,config,database,flags,notifications,shared,ui}`, `infra/`, `evals/`, `supabase/`, and `docs/`.
- `.gitignore`, `.env.example`, and `pnpm-lock.yaml` exist in the working tree.
- `.npmrc` and `.github/workflows/ci.yml` are still absent although the frozen folder specification expects them.
- `.nvmrc` is absent and remains optional; root `package.json#engines` and `packageManager` are binding.

### M0 deliverable 2 — Identity and tenancy: implemented and locally tested

- `packages/database/schema/identity.ts` defines the eight M0 identity/tenancy tables.
- `packages/database/migrations/0001_uuid_v7.sql` and `0002_identity_tenancy.sql` exist with RLS policies.
- `packages/database/src/identity-rls.test.ts` exists.
- On 2026-07-13, `pnpm test` passed the database suite: 1 test file and 10/10 RLS tests.

This validates the current local Testcontainers path. It does not by itself satisfy all M0 staging and CI exit criteria.

### M0 deliverable 3 — Authentication: foundation only

The current working tree contains web-side Supabase session infrastructure:

- browser client: `apps/web/src/lib/supabase/client.ts`;
- request-scoped server client: `apps/web/src/lib/supabase/server.ts`;
- public config guard: `apps/web/src/lib/supabase/config.ts`;
- cookie refresh middleware client: `apps/web/src/lib/supabase/middleware.ts`;
- session/user helpers: `apps/web/src/lib/auth/session.ts`;
- protected-route middleware for `/admin`, `/exhibit`, and `/org`.

This is not the full M0 authentication deliverable. Login, signup, recovery, magic-link UI, passkeys, `auth.users` to `public.users` provisioning, organization creation, invitations, device/session management, and account settings remain incomplete or pending.

### Other M0 work

- Validation fixes are present for React typings, shared TypeScript config, CommonJS ESLint config, API type-only imports, BullMQ/ioredis alignment, and empty-test-package handling.
- Inter Variable Latin, Inter Variable Latin Extended, and JetBrains Mono WOFF2 files exist under `packages/ui/src/fonts/`.
- Entitlement resolution, transactional email delivery, Platform Admin, audit logging, observability, and the Concourse-to-ExAi rename remain pending.

## 3. Runtime validation status

Verified on 2026-07-13:

| Check                         | Result                                                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Toolchain                     | Node `v24.18.0`, pnpm `9.15.0`, Git `2.55.0.windows.2`, Docker `29.6.1` available                             |
| `pnpm typecheck`              | **Pass** — 19/19 Turbo tasks                                                                                  |
| `pnpm test`                   | **Pass** — 20/20 Turbo tasks; database RLS 10/10                                                              |
| `pnpm --filter web build`     | **Pass** — Next.js production build completed                                                                 |
| `pnpm lint`                   | **Fail** — generated `.js` and `.d.ts` files inside `apps/api/src` and `apps/worker/src` are linted as source |
| Supabase local stack          | **Not verified by this snapshot**                                                                             |
| Full M0 staging demonstration | **Not run**                                                                                                   |

Non-blocking warnings observed:

- Next.js ESLint plugin not detected.
- Scaffolded AI methods and the database seed log produce lint warnings.
- Vitest reports the Vite CJS API deprecation.
- Turbo reports no output declaration for database/web test tasks.

## 4. Root artifact disposition

| Artifact                   | Current state      | Required disposition                                                                                           |
| -------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------- |
| `.env.example`             | Present, untracked | Commit placeholder names only; never real secrets.                                                             |
| `.gitignore`               | Present, untracked | Commit after review. It intentionally keeps the lockfile, source, docs, migrations, and font assets trackable. |
| `.npmrc`                   | Absent             | Required by doc 37; create only from its documented pnpm settings in a focused bootstrap ticket.               |
| `.nvmrc`                   | Absent             | Optional; do not fabricate it. `package.json#engines` is binding.                                              |
| `.github/workflows/ci.yml` | Absent             | Required by doc 37/M0 scaffold; implement in a focused CI ticket.                                              |
| `pnpm-lock.yaml`           | Present, untracked | Generated with pnpm 9.15.0; review and commit, never hand-edit.                                                |

## 5. Known contradictions and stale statements

- Root `README.md` still describes the repository as having no authentication, but web auth infrastructure now exists. Full authentication remains incomplete, so the README needs a narrowly worded factual update in a future documentation ticket.
- `apps/api/src/modules/auth/auth.module.ts` still says the Supabase auth/session documents are pending detailed revision. Amendment A6 records that the revisions are complete; the comment is stale.
- The tag `m0-validation-complete` conflicts with the actual dirty, partially validated M0 state.

## 6. Remaining M0 work

1. Fix the root lint gate at the correct configuration/build-output level.
2. Complete the missing `.npmrc` and CI workflow bootstrap controls.
3. Commit the reviewed stabilization, root-control, font, documentation, and auth-foundation changes in coherent tickets.
4. Complete M0 authentication and identity provisioning per docs 19-20.
5. Implement entitlement resolution and manual provisioning.
6. Implement account-lifecycle transactional email.
7. Implement the Platform Admin baseline.
8. Implement the synchronous audit-log baseline.
9. Wire the observability baseline.
10. Complete the tracked Concourse-to-ExAi rename when approved.
11. Run the full M0 staging demonstration and all CI gates.

Milestone 1 must not begin until M0's Definition of Done in [IMPLEMENTATION_PHASES.md](IMPLEMENTATION_PHASES.md) is satisfied.

## 7. Highest-priority next action

Resolve the current root lint failure caused by generated TypeScript output under `apps/api/src` and `apps/worker/src`, using the smallest correct configuration change. The formal ticket ID is **Unknown**. After all validation gates are green and the current work is committed, continue the remaining M0 authentication scope.
