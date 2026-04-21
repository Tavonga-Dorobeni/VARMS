import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/services/prisma.module';
import { FiuController } from './fiu.controller';
import { FiuService } from './fiu.service';

@Module({
  imports: [PrismaModule],
  controllers: [FiuController],
  providers: [FiuService],
})
export class FiuModule {}
