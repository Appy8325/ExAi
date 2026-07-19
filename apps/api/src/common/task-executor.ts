import { Injectable } from "@nestjs/common";
import { ingestSource } from "@concourse/ai/knowledge";

export type BackgroundTask = { type: "knowledge.ingest"; sourceId: string };

export abstract class TaskExecutor {
  abstract execute(task: BackgroundTask): Promise<void>;
}

@Injectable()
export class DeploymentTaskExecutor implements TaskExecutor {
  async execute(task: BackgroundTask) {
    // The retained worker claims pending rows in normal deployments.
    if (process.env.MVP_VERCEL_MODE !== "true") return;
    if (task.type === "knowledge.ingest") await ingestSource(task.sourceId);
  }
}
