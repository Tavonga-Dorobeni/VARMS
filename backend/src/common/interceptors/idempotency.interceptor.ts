import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import { PrismaService } from '../services/prisma.service';
import { CurrentUser } from '../interfaces/current-user.interface';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    if (request.method !== 'POST') {
      return next.handle();
    }

    const idempotencyKey = request.headers['idempotency-key'];
    if (!idempotencyKey || typeof idempotencyKey !== 'string') {
      return next.handle();
    }

    const user = request.user as CurrentUser | undefined;
    const route = request.route?.path ?? request.originalUrl;

    if (!user) {
      return next.handle();
    }

    return from(
      this.prisma.idempotencyKey.findUnique({
        where: {
          userId_route_method_idempotencyKey: {
            userId: user.userId,
            route,
            method: request.method,
            idempotencyKey,
          },
        },
      }),
    ).pipe(
      mergeMap((existing) => {
        if (existing) {
          response.status(existing.responseCode);
          return from([existing.responseBody]);
        }

        return next.handle().pipe(
          tap(async (body) => {
            await this.prisma.idempotencyKey.create({
              data: {
                userId: user.userId,
                route,
                method: request.method,
                idempotencyKey,
                responseCode: response.statusCode || 201,
                responseBody: body as object,
              },
            });
          }),
        );
      }),
    );
  }
}
