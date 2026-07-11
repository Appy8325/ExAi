/**
 * AiGuardrailService — public port for prompt-injection/abuse screening and
 * output validation (docs/21-ai-architecture.md §1, §7).
 *
 * `screenInput` covers attendee/organizer free text (§7.5); `screenOutput`
 * covers post-generation validation (citations, evidence ids, banned
 * patterns, §7.4); `screenDocument` covers ingestion-time KB document
 * screening (§7.3). All run a `claude-haiku-4-5` injection/abuse classifier
 * -- not implemented until Milestone 3.
 */

export interface GuardrailScreenResult {
  allowed: boolean;
  flagged: boolean;
  reasons?: string[];
}

export interface ScreenInputRequest {
  organizationId: string;
  eventId?: string;
  text: string;
  priorTurnsFlagged?: boolean;
}

export interface ScreenOutputRequest {
  organizationId: string;
  eventId?: string;
  text: string;
  citations?: Array<{ marker: string; documentId: string }>;
  evidenceIds?: string[];
}

export interface ScreenDocumentRequest {
  organizationId: string;
  eventId?: string;
  documentId: string;
  text: string;
}

export class AiGuardrailService {
  async screenInput(req: ScreenInputRequest): Promise<GuardrailScreenResult> {
    throw new Error("not implemented -- Milestone 3");
  }

  async screenOutput(
    req: ScreenOutputRequest,
  ): Promise<GuardrailScreenResult> {
    throw new Error("not implemented -- Milestone 3");
  }

  async screenDocument(
    req: ScreenDocumentRequest,
  ): Promise<GuardrailScreenResult> {
    throw new Error("not implemented -- Milestone 3");
  }
}
