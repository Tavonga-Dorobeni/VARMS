import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/services/prisma.module';
import { DealersController } from './dealers.controller';
import { DealersService } from './dealers.service';

@Module({
  imports: [PrismaModule],
  controllers: [DealersController],
  providers: [DealersService],
  exports: [DealersService],
})
export class DealersModule {}
