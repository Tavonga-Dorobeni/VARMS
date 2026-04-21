import { Controller, Get, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { FiuService } from './fiu.service';

@Controller('fiu')
@Roles(UserRole.FIU_ANALYST)
export class FiuController {
  constructor(private readonly fiuService: FiuService) {}

  @Get('dashboard-stats')
  getDashboardStats() {
    return this.fiuService.getDashboardStats();
  }

  @Get('vehicles')
  listVehicles(@Query() query: PaginationQueryDto & Record<string, string | undefined>) {
    return this.fiuService.listVehicles(query);
  }

  @Get('sales')
  listSales(@Query() query: PaginationQueryDto & Record<string, string | undefined>) {
    return this.fiuService.listSales(query);
  }

  @Get('dealers')
  listDealers(@Query() query: PaginationQueryDto & Record<string, string | undefined>) {
    return this.fiuService.listDealers(query);
  }

  @Get('trends')
  getTrends() {
    return this.fiuService.getTrends();
  }
}
