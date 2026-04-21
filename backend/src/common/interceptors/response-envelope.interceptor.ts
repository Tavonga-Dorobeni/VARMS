import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((value: unknown) => ({
        success: true,
        data:
          value && typeof value === 'object' && 'data' in (value as Record<string, unknown>)
            ? (value as Record<string, unknown>).data
            : value,
        error: null,
      })),
    );
  }
}
