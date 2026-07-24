# Deployment Failure Analysis

## Scope

This analysis covers the failed Vercel Preview deployment for frozen UI commit `3b0bd38` on `codex/rc3-ui-preview`. No implementation or deployment configuration was changed.

## Root cause

**Application code defect in the API package:** `apps/api/src/modules/engagement/engagement.module.ts` imports and registers three controllers that do not exist in commit `3b0bd38`:

- `./sessions.controller`
- `./speakers.controller`
- `./registrations.controller`

The API TypeScript build fails with `TS2307` for all three imports. Vercel therefore exits before building the Next.js application.

## Evidence

Vercel build log, 2026-07-23:

```text
Running "corepack pnpm --filter web... build"
...
../api build$ nest build
../api build: src/modules/engagement/engagement.module.ts:50:36 - error TS2307:
Cannot find module './sessions.controller'
...
../api build: Found 3 error(s).
Error: Command "corepack pnpm --filter web... build" exited with 1
```

The committed tree at `3b0bd38` contains `engagement.module.ts` but contains none of the three referenced controller files. The module imports them at lines 50–52 and includes them in its `controllers` array.

## Classification

| Candidate | Finding |
| --- | --- |
| Environment / Vercel configuration | Not causal. Installation completed successfully. |
| Missing environment variables | Not implicated. The failure occurs during static TypeScript module resolution. |
| Build configuration | Contributes to exposure, not the defect: `pnpm --filter web... build` builds transitive workspace dependencies, including `api`. |
| Monorepo configuration | Working as configured; dependency traversal correctly detects the invalid API package. |
| Dependency issue | Not implicated. Workspace install and prerequisite package builds complete. |
| Infrastructure issue | Not implicated. Vercel runs the command and reports deterministic compiler errors. |
| Application code defect | **Root cause.** Dangling API controller imports and registrations prevent `nest build`. |

## Relationship to RC3 UI Phase 2

The breadcrumb, animated-counter, and Next.js build-lock changes in `3b0bd38` do not modify `apps/api/src/modules/engagement/engagement.module.ts` or any of the missing controller paths. The Preview failure is unrelated to the frozen UI work.

## Minimal corrective direction (not implemented)

Reconcile `EngagementModule` with the API source of truth: either add the three intended controller modules or remove their imports and registrations if those routes are not part of the committed product scope. The correct choice requires product/API ownership confirmation; no speculative fix was applied.

## Risk assessment

Removing registrations without confirming intended API routes could silently remove endpoints. Adding controllers without their intended contracts, services, and authorization checks would be equally unsafe. This is an API workstream decision, not a Vercel or UI infrastructure change.

## Conclusion

The deployment is blocked by a deterministic API compilation failure, not by Vercel configuration, environment variables, or the RC3 UI Phase 2 refactors. Await approval before changing API source or deployment configuration.
