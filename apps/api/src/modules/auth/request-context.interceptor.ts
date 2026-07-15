import type { CallHandler, ExecutionContext, NestInterceptor} from "@nestjs/common";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { requestContextStorage } from "../../common/request-context";
import type { AuthenticatedRequest } from "./supabase-request-context.guard";

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.requestContext) throw new UnauthorizedException("Authentication required.");
    return new Observable((subscriber) => requestContextStorage.run(request.requestContext!, () => next.handle().subscribe(subscriber)));
  }
}
