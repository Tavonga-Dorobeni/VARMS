import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/services/prisma.module';
import { AppConfigModule } from '../../config/app-config.module';
import { StrAlertsController } from './str-alerts.controller';
import { StrAlertsService } from './str-alerts.service';
import { StrRulesService } from './str-rules.service';

@Module({
  imports: [PrismaModule, AppConfigModule],
  controllers: [StrAlertsController],
  providers: [StrAlertsService, StrRulesService],
  exports: [StrAlertsService, StrRulesService],
})
export class StrAlertsModule {}
