import { NestFactory } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";

import { AppModule } from "./app.module";

export async function createApiApplication() {
  const corsOrigin = requiredInProduction("API_CORS_ORIGIN", "http://localhost:3000");
  requiredInProduction("API_SUPABASE_URL");
  requiredInProduction("API_SUPABASE_SERVICE_ROLE_KEY");
  requiredInProduction("API_PUBLIC_WEB_ORIGIN", "http://localhost:3000");
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  app.enableCors({
    origin: corsOrigin.split(",").map((origin) => origin.trim()).filter(Boolean),
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });
  await app.init();
  return app;
}

function requiredInProduction(name: string, developmentDefault?: string) {
  const value = process.env[name]?.trim() ||
    (process.env.NODE_ENV === "production" ? undefined : developmentDefault);
  if (!value) throw new Error(`${name} is required.`);
  return value;
}
