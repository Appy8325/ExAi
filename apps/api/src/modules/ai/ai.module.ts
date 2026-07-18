import { Module } from "@nestjs/common";
import { AiGenerationService } from "@concourse/ai";

/**
 * AiModule — owns ai_conversations, ai_messages (mount point for packages/ai, docs/21-ai-architecture.md) (docs/18-api-architecture.md §1).
 * Provider-backed services are registered here and consumed by feature modules.
 */
@Module({
  providers: [AiGenerationService],
  exports: [AiGenerationService],
})
export class AiModule {}
