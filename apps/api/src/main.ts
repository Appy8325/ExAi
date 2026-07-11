import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from './app.module';

/**
 * Bootstrap — NestJS 11 on the Fastify adapter (docs/18-api-architecture.md §1).
 * This is real Milestone-0 infrastructure (not a placeholder): a minimal,
 * correct app bootstrap. Business logic (guards, interceptors, versioning,
 * the RFC 9457 exception filter, etc.) is wired in the milestone that
 * implements each concern.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.enableCors({
    origin: process.env.API_CORS_ORIGIN,
  });

  const port = process.env.API_PORT ? Number(process.env.API_PORT) : 3001;
  await app.listen(port, '0.0.0.0');
}

bootstrap();
