# RC3 Phase 2 Build Failure Analysis

## Root cause

The failed production build raced with another active production build over the same Next output directory: `apps/web/.next-build`.

`apps/web/next.config.ts` selects `.next-build` whenever `NODE_ENV=production` (unless `NEXT_DIST_DIR` is supplied). The failed build attempted to read `server/pages-manifest.json` during Next's page-data collection before the concurrent build had produced it. A second `turbo run build` / `next build` process was active at the same time and wrote that manifest shortly afterward.

## Evidence

- Failed command: `pnpm build` → `turbo run build` → `web#build` → `next build`.
- Failure: `ENOENT ... apps/web/.next-build/server/pages-manifest.json` during “Collecting page data”.
- The manifest exists now. Its timestamps show creation at **22:38:54** and a later write at **22:41:18**; the failed build logged the missing file at **22:41:13**.
- Active concurrent processes were observed:
  - `cmd /c turbo run build` (PID 1672)
  - its Turbo child (PID 14788)
  - `cmd /c next build` (PID 13060)
- No post-build hook or custom manifest reader exists. `apps/web/package.json` runs only `next build`; Turbo has no post-build task.
- `.next-build` is intentional: it isolates production output from normal `.next` development output, but it does not isolate two simultaneous production builds.

## Feature-code implication

The breadcrumb and shared-counter refactors are not implicated. The error occurs in Next's generated-output read path and is independent of the changed application components. Those refactors remain unchanged.

## Minimal architectural fix

`apps/web/scripts/with-build-lock.mjs` now acquires `.next-build.lock` with an exclusive create before invoking `next build`. The web `build` script runs through this guard. A second build fails immediately with `A web production build is already running; wait for it to finish.` The lock is released when Next exits.

Fail-fast is intentional: it preserves the single canonical `.next-build` deployment artifact and prevents the corruption window without arbitrary waiting, retries, or output-directory workarounds.

## Validation evidence

| Run | Build A | Build B | Artifact state |
|---|---|---|---|
| 1 | Completed successfully; lock released. | Immediate exit with the lock message; Next was not started. | `.next-build.lock` existed only while A ran and was removed afterward. |
| 2 | Completed successfully; lock released. | Same immediate lock rejection. | Same deterministic cleanup. |

The successful builds produced the normal Next output. Existing non-failing warnings remain: one `no-img-element` warning and unused dashboard symbols. No manifest ENOENT recurred.

## Risk assessment

| Risk | Assessment | Control |
|---|---|---|
| Retrying while another build is active | High; repeats manifest races. | Wait for the active build to finish before validating. |
| Changing Next configuration globally | Medium; may affect deployment tooling that expects `.next-build`. | Preserve the current default; introduce only serialization or an explicit per-build directory. |
| Phase 2 regression | None observed. | Validate after build contention is removed. |
