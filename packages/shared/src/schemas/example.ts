import { z } from 'zod';

/**
 * Illustrative placeholder only.
 *
 * Real domain schemas land here one file per domain (mirroring
 * packages/database/schema/, per doc 37 §6.3) as each milestone
 * implements that domain — e.g. identity.ts, events-floor.ts,
 * exhibitor.ts, engagement.ts, ai-knowledge.ts, platform.ts, support.ts.
 *
 * This file exists only to demonstrate the pattern: a generic,
 * cross-domain cursor-pagination query schema matching the pagination
 * envelope convention in docs/00-foundation.md §9.
 */
export const paginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
