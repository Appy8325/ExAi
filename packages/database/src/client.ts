import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../schema';

// Pooled connection factory against the Supabase-managed Postgres
// connection string (docs/00-foundation.md §14 Amendment A5). Reads
// whichever *_DATABASE_URL the calling deployable has in scope rather
// than minting its own prefix (doc 37 §10, decision M8): apps/api sets
// API_DATABASE_URL, apps/worker sets WORKER_DATABASE_URL.
const connectionString = process.env.API_DATABASE_URL ?? process.env.WORKER_DATABASE_URL;

if (!connectionString) {
  throw new Error(
    '@concourse/database: no *_DATABASE_URL found in scope. Set API_DATABASE_URL (or WORKER_DATABASE_URL) before importing the client.',
  );
}

const queryClient = postgres(connectionString, {
  // Pooled — one postgres.js connection pool per process, per Drizzle's
  // own recommended usage with postgres-js.
  max: 10,
});

export const db = drizzle(queryClient, { schema });

export type Database = typeof db;

export { setRlsContext } from './rls-context';
