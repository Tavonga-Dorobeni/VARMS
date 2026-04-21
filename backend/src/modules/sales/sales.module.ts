import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/services/prisma.module';
import { AppConfigModule } from '../../config/app-config.module';
import { DealersModule } from '../dealers/dealers.module';
import { StrAlertsModule } from '../str-alerts/str-alerts.module';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';

@Module({
  imports: [PrismaModule, AppConfigModule, DealersModule, StrAlertsModule],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
