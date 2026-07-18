import { defineConfig } from 'drizzle-kit';

// packages/database's CLI borrows whichever *_DATABASE_URL its caller has
// in scope rather than minting its own tooling-only env prefix (doc 37
// §10, decision M8). `API_DATABASE_URL` is the default (CI/local invoke
// via `pnpm --filter database migrate` from an apps/api context);
// `WORKER_DATABASE_URL` is the documented fallback for a worker-context
// invocation. Both ultimately point at the same Supabase Postgres
// connection string (docs/00-foundation.md §14 Amendment A5).
const connectionString = process.env.MIGRATION_DATABASE_URL ?? process.env.API_DATABASE_URL ?? process.env.WORKER_DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'packages/database: no database URL found. Set MIGRATION_DATABASE_URL (preferred), API_DATABASE_URL, or WORKER_DATABASE_URL before running drizzle-kit.',
  );
}

export default defineConfig({
  schema: './schema/*.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionString,
  },
});
