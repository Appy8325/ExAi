import { NestFactory } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";

import { AppModule } from "./app.module";

/**
 * Bootstrap — NestJS 11 on the Fastify adapter (docs/18-api-architecture.md §1).
 * This is real Milestone-0 infrastructure (not a placeholder): a minimal,
 * correct app bootstrap. Business logic (guards, interceptors, versioning,
 * the RFC 9457 exception filter, etc.) is wired in the milestone that
 * implements each concern.
 */
async function bootstrap(): Promise<void> {
  const corsOrigin = requiredInProduction(
    "API_CORS_ORIGIN",
    "http://localhost:3000",
  );
  requiredInProduction("API_SUPABASE_URL");
  requiredInProduction("API_SUPABASE_SERVICE_ROLE_KEY");
  requiredInProduction("API_PUBLIC_WEB_ORIGIN", "http://localhost:3000");
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.enableCors({
    origin: corsOrigin
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  const port = process.env.API_PORT ? Number(process.env.API_PORT) : 3001;
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("API_PORT must be a valid TCP port.");
  await app.listen(port, "0.0.0.0");
}

function requiredInProduction(
  name: string,
  developmentDefault?: string,
): string {
  const value =
    process.env[name]?.trim() ||
    (process.env.NODE_ENV === "production" ? undefined : developmentDefault);
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

bootstrap();
