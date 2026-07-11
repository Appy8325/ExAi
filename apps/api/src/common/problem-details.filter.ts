import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';

/**
 * ProblemDetailsFilter — placeholder for the RFC 9457 `application/problem+json`
 * error envelope fixed in docs/18-api-architecture.md §3.5 (type/title/status/
 * code/detail/requestId/errors[] shape).
 *
 * Milestone 0 scaffolding only: correct ExceptionFilter shape, no mapping from
 * exceptions to problem documents implemented yet. Real content lands with the
 * error-handling milestone referencing docs/41-error-code-registry.md.
 */
@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  catch(_exception: unknown, _host: ArgumentsHost): void {
    // Intentionally unimplemented — see class doc comment above.
  }
}
