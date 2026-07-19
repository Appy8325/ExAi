import { db } from "@concourse/database";
import { sql } from "drizzle-orm";

import { AiEmbeddingService } from "../embedding/ai-embedding.service";

/**
 * RetrievalService — public port for hybrid retrieval over the knowledge
 * base (docs/21-ai-architecture.md §1). Contract owned by
 * docs/22-rag-architecture.md; this is a Milestone 0 stub matching the
 * documented method signature only.
 */

export interface RetrievalPrincipal {
  kind: "session" | "api_key" | "service";
  userId?: string;
  organizationId?: string;
}

export interface RetrievalOptions {
  eventExhibitorId?: string;
  maxHops?: number;
  filters?: Record<string, unknown>;
  topK?: number;
}

export interface RetrievedChunk {
  documentId: string;
  chunkId: string;
  text: string;
  score: number;
  sourceType: string;
  title: string;
  deepLink: string;
}

export class RetrievalService {
  async search(
    _principal: RetrievalPrincipal,
    eventId: string,
    query: string,
    opts?: RetrievalOptions,
  ): Promise<RetrievedChunk[]> {
    const queryEmbedding = await new AiEmbeddingService().embedQuery(query);
    const vector = `[${queryEmbedding.values.join(",")}]`;
    const topK = Math.min(Math.max(opts?.topK ?? 8, 1), 12);
    const rows = (await db.execute(sql<{
      document_id: string;
      chunk_id: string;
      content: string;
      score: number;
      source_type: string;
      title: string;
      source_url: string | null;
      file_id: string | null;
    }>`
      SELECT document.id AS document_id, chunk.id AS chunk_id, chunk.content,
        1 - (chunk.embedding <=> ${vector}::vector) AS score,
        source.source_type, source.title, source.source_url, source.file_id
      FROM kb_chunks chunk
      JOIN kb_documents document ON document.id = chunk.kb_document_id
      JOIN kb_sources source ON source.id = document.kb_source_id
      WHERE chunk.event_id = ${eventId}
        AND chunk.visibility = 'public'
        AND (${opts?.eventExhibitorId ?? null}::uuid IS NULL OR source.event_exhibitor_id = ${opts?.eventExhibitorId ?? null}::uuid)
      ORDER BY chunk.embedding <=> ${vector}::vector
      LIMIT ${topK}
    `)) as unknown as Array<{
      document_id: string;
      chunk_id: string;
      content: string;
      score: number;
      source_type: string;
      title: string;
      source_url: string | null;
      file_id: string | null;
    }>;
    return rows.map((row) => ({
      documentId: row.document_id,
      chunkId: row.chunk_id,
      text: row.content,
      score: Number(row.score),
      sourceType: row.source_type,
      title: row.title,
      deepLink: row.source_url ?? `file:${row.file_id}`,
    }));
  }
}
