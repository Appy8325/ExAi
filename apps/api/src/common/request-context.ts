import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * RequestContext shape per docs/18-api-architecture.md §3.9. Milestone 0
 * placeholder: the AsyncLocalStorage instance and type are declared so
 * dependents can compile against the shape, but nothing populates or reads
 * it yet (no Fastify onRequest hook wired). Real propagation into pino,
 * Sentry, OTel spans, and Postgres RLS session vars lands with the module
 * that owns request lifecycle (docs/18-api-architecture.md §4).
 */
export interface RequestContext {
  requestId: string;
  traceId: string;
  principal: {
    kind: 'session' | 'api_key' | 'service';
    userId?: string;
    sessionId?: string;
    apiKeyId?: string;
    serviceName?: string;
  };
  orgId?: string;
  eventId?: string;
  eventExhibitorId?: string;
}

export const requestContextStorage = new AsyncLocalStorage<RequestContext>();
