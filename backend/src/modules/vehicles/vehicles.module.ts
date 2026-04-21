import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/services/prisma.module';
import { DealersModule } from '../dealers/dealers.module';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';

@Module({
  imports: [PrismaModule, DealersModule],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
