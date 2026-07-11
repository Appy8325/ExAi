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
    principal: RetrievalPrincipal,
    eventId: string,
    query: string,
    opts?: RetrievalOptions,
  ): Promise<RetrievedChunk[]> {
    throw new Error("not implemented -- Milestone 3");
  }
}
