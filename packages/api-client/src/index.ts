/**
 * @concourse/api-client — public barrel.
 *
 * Real generated client functions (one typed function per operationId, plus
 * shared types) are produced by a codegen step that reads
 * `packages/api-contract/openapi/concourse.v1.json` and writes into
 * `src/generated/` (docs/18-api-architecture.md §2, docs/37-monorepo-and-
 * folder-structure.md §6.6). That codegen output is never hand-edited.
 *
 * Until the contract pipeline runs against real `apps/api` routes,
 * `src/generated/` is empty and this barrel exports nothing.
 */

export * from "./relationship-workspace";
export * from "./public-exhibitors";
