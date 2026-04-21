import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppConfigModule } from './config/app-config.module';
import { PrismaService } from './common/services/prisma.service';
import { PrismaModule } from './common/services/prisma.module';
import { AuditService } from './common/services/audit.service';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { ResponseEnvelopeInterceptor } from './common/interceptors/response-envelope.interceptor';
import { IdempotencyInterceptor } from './common/interceptors/idempotency.interceptor';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DealersModule } from './modules/dealers/dealers.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { SalesModule } from './modules/sales/sales.module';
import { StrAlertsModule } from './modules/str-alerts/str-alerts.module';
import { RegistrationModule } from './modules/registration/registration.module';
import { FiuModule } from './modules/fiu/fiu.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { BuyersModule } from './modules/buyers/buyers.module';
import { HealthModule } from './modules/health/health.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AppConfigModule,
    AuthModule,
    UsersModule,
    DealersModule,
    VehiclesModule,
    SalesModule,
    StrAlertsModule,
    RegistrationModule,
    FiuModule,
    AuditLogsModule,
    BuyersModule,
    HealthModule,
    AdminModule,
  ],
  providers: [
    AuditService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: IdempotencyInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseEnvelopeInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: ApiExceptionFilter,
    },
  ],
})
export class AppModule {}
