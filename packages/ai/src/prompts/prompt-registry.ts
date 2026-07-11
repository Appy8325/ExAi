/**
 * PromptRegistry — public port resolving a versioned prompt definition by id
 * (docs/21-ai-architecture.md §1, §4).
 *
 * Prompts are code, not database rows: each lives at
 * `packages/ai/src/prompts/<feature>/<name>.prompt.ts` and is declared via
 * `definePrompt({ id, version, model, system, tools, maxTokens, temperature })`
 * (doc 21 §4), e.g. `id: 'copilot.answer'`, `version: 7`. A build step emits
 * `prompts.manifest.json` mapping `id@version -> sha256(content)`.
 *
 * No per-feature `.prompt.ts` files exist yet -- those land starting
 * Milestone 3 as each feature is implemented. This is the registry stub
 * only.
 */

export interface PromptDefinition {
  id: string;
  version: number;
  model: string;
  system: string;
  tools?: unknown[];
  maxTokens: number;
  temperature: number;
}

export class PromptRegistry {
  resolve(promptId: string): PromptDefinition {
    throw new Error("not implemented -- Milestone 3");
  }
}
