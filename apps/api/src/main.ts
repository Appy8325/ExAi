import { createApiApplication } from "./application";

/**
 * Bootstrap — NestJS 11 on the Fastify adapter (docs/18-api-architecture.md §1).
 * This is real Milestone-0 infrastructure (not a placeholder): a minimal,
 * correct app bootstrap. Business logic (guards, interceptors, versioning,
 * the RFC 9457 exception filter, etc.) is wired in the milestone that
 * implements each concern.
 */
async function bootstrap(): Promise<void> {
  const app = await createApiApplication();
  const port = process.env.API_PORT ? Number(process.env.API_PORT) : 3001;
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("API_PORT must be a valid TCP port.");
  await app.listen(port, "0.0.0.0");
}

bootstrap();
