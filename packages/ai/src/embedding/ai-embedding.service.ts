/**
 * AiEmbeddingService — public port for Voyage `voyage-3.5` embeddings and
 * `rerank-2.5` reranking (docs/21-ai-architecture.md §1, consumed by
 * docs/22-rag-architecture.md).
 *
 * This class does not call the Voyage SDK directly -- Milestone 3 wires it
 * to the private AiGatewayService.
 */

export interface EmbeddingVector {
  values: number[];
  model: string;
}

export interface RerankedDocument<T = unknown> {
  document: T;
  score: number;
  index: number;
}

export class AiEmbeddingService {
  async embedDocuments(texts: string[]): Promise<EmbeddingVector[]> {
    throw new Error("not implemented -- Milestone 3");
  }

  async embedQuery(text: string): Promise<EmbeddingVector> {
    throw new Error("not implemented -- Milestone 3");
  }

  async rerank<T = unknown>(
    query: string,
    docs: T[],
  ): Promise<RerankedDocument<T>[]> {
    throw new Error("not implemented -- Milestone 3");
  }
}
