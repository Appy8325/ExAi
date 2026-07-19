import "reflect-metadata";
import type { InjectOptions } from "fastify";

import { createApiApplication } from "./application";

let application: ReturnType<typeof createApiApplication> | undefined;

export type ApiInjectionResponse = {
  statusCode: number;
  headers: Record<string, string | string[] | number | undefined>;
  rawPayload: Buffer;
};

export type ApiRequestOptions = {
  method: string;
  url: string;
  headers?: Record<string, string>;
  payload?: Buffer;
};

export async function injectApiRequest(options: ApiRequestOptions): Promise<ApiInjectionResponse> {
  application ??= createApiApplication();
  const app = await application;
  return app.getHttpAdapter().getInstance().inject(options as InjectOptions);
}
