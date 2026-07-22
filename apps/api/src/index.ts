import "reflect-metadata";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createApiApplication } from "./application";

let applicationPromise: ReturnType<typeof createApiApplication> | undefined;

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