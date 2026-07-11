/**
 * Model routing aliases (docs/21-ai-architecture.md §2). These are locked
 * in the frozen architecture, not placeholders — every AiModule caller
 * imports these constants rather than hardcoding a model id.
 */
export const MODEL_REASONING = 'claude-fable-5';
export const MODEL_FAST = 'claude-haiku-4-5';
