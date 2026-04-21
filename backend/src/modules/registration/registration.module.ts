import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/services/prisma.module';
import { CvrDashboardController, RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';

@Module({
  imports: [PrismaModule],
  controllers: [RegistrationController, CvrDashboardController],
  providers: [RegistrationService],
  exports: [RegistrationService],
})
export class RegistrationModule {}
