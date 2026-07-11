// Root Vitest workspace file, not a single shared `vitest.config.ts`.
//
// Why a workspace file and not one config extended per-package: this monorepo's packages need
// genuinely different Vitest *environments* per doc 42 §4-§5 (apps/web needs `jsdom` for React
// component tests, apps/api and apps/worker need plain `node`, packages/* mostly need `node`) and
// different coverage thresholds per package (doc 42 §4's 80%/60% split). A single root config can't
// express "package A uses jsdom, package B uses node" without ad-hoc `environmentMatchGlobs` hacks
// that get unreadable fast. `vitest.workspace.ts` lets every package own a normal, self-contained
// `vitest.config.ts` (extending the shared base in packages/config/vitest/base.ts) while this file
// just tells the root-level `vitest` CLI which project configs to discover and run together --
// matching Turborepo's own per-workspace task model (turbo.json's `test` task) rather than fighting it.
import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  // Every package/app that ships its own vitest.config.ts is picked up here. Glob is intentionally
  // broad (apps/* and packages/*) so a newly-scaffolded package's config is discovered automatically
  // without a second edit to this file.
  'apps/*/vitest.config.ts',
  'packages/*/vitest.config.ts',
]);
