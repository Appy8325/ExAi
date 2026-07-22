import "reflect-metadata";
import { createApiApplication } from "./src/application";

let applicationPromise: ReturnType<typeof createApiApplication> | undefined;

async function getApplication() {
  applicationPromise ??= createApiApplication();
  return applicationPromise;
}

export default async function handler(req: any, res: any) {
  const app = await getApplication();
  const instance = app.getHttpAdapter().getInstance();
  await instance.ready();

  if (typeof instance.handle === "function") {
    return instance.handle(req, res);
  }

  instance.server.emit("request", req, res);
}