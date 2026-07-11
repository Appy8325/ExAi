import type { PgTransaction } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * Sets the two Postgres session GUCs Row-Level Security policies key off
 * (docs/00-foundation.md §8): `app.current_org_id` and
 * `app.current_user_id`. Must be called at the start of every
 * request-scoped transaction that touches tenant-owned tables — `SET
 * LOCAL` scopes the value to the current transaction only, so it can
 * never leak across pooled connections.
 *
 * `userId` is optional because some request-scoped transactions (e.g. a
 * platform-admin action, or the app_platform BYPASSRLS pool) carry an
 * org context without an authenticated end-user in scope.
 */
export async function setRlsContext(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: PgTransaction<any, any, any>,
  orgId: string,
  userId?: string,
): Promise<void> {
  await tx.execute(sql`SET LOCAL app.current_org_id = ${orgId}`);
  if (userId) {
    await tx.execute(sql`SET LOCAL app.current_user_id = ${userId}`);
  }
}
