// Required for Vercel NestJS runtime detection.
// Our dual-mode bootstrap causes @nestjs/core to be tree-shaken from the compiled entrypoint.
// Do not remove unless the bootstrap architecture is refactored.
// See NESTJS_ENTRYPOINT_AUDIT.md.
import '@nestjs/core';
import "reflect-metadata";
import type { IncomingMessage, ServerResponse } from "node:http";
import { NestFactory } from "@nestjs/core";
import { createApiApplication } from "./application";

let applicationPromise: ReturnType<typeof createApiApplication> | undefined;

async function bootstrap(): Promise<void> {
  const app = await createApiApplication();
  const port = process.env.API_PORT ? Number(process.env.API_PORT) : 3001;
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("API_PORT must be a valid TCP port.");
  await app.listen(port, "0.0.0.0");
}

async function getApplication() {
  applicationPromise ??= createApiApplication();
  return applicationPromise;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const app = await getApplication();
  const instance = app.getHttpAdapter().getInstance();
  await instance.ready();
  instance.server.emit("request", req, res);
}

if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  bootstrap();
}