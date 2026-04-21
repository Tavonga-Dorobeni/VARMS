import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { from, Observable } from 'rxjs';
import { mergeMap, mapTo } from 'rxjs/operators';
import { AUDIT_KEY, AuditDecoratorMetadata } from '../decorators/audit.decorator';
import { AuditService } from '../services/audit.service';
import { CurrentUser } from '../interfaces/current-user.interface';
import { AuditedResult } from '../interfaces/audit.interface';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const auditConfig = this.reflector.getAllAndOverride<AuditDecoratorMetadata>(AUDIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!auditConfig) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as CurrentUser;

    return next.handle().pipe(
      mergeMap((result: AuditedResult<unknown>) => {
        if (!result?.audit || !user) {
          return from(Promise.resolve(result));
        }

        return from(
          this.auditService.log({
            userId: user.userId,
            role: user.role,
            action: result.audit.action ?? auditConfig.action,
            entityType: result.audit.entityType ?? auditConfig.entityType,
            entityId: result.audit.entityId,
            beforeValue: result.audit.beforeValue,
            afterValue: result.audit.afterValue,
            reason: result.audit.reason,
          }),
        ).pipe(mapTo(result));
      }),
    );
  }
}
