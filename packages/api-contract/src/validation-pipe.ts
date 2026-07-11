/**
 * nestjs-zod-style validation pipe/decorator pattern (docs/18-api-architecture.md
 * §2.1, docs/37-monorepo-and-folder-structure.md §6.5).
 *
 * Controllers in `apps/api` will declare request/response shapes with Zod 3
 * schemas from `packages/shared`; a pipe here validates the request against
 * the schema and the same schema drives OpenAPI generation (`openapi:emit`,
 * doc 18 §2 step 2) and the inferred TS types -- Zod is the single source
 * for validation, docs, and types.
 *
 * Real per-resource Zod schemas and the corresponding pipe/decorator
 * implementations land as each `apps/api` module is implemented, not in
 * Milestone 0. This file is a placeholder documenting the pattern only.
 */

export {};
