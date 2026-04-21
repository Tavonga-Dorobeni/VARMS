import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { AuditAction, UserRole } from '@prisma/client';
import { Audit } from '../../common/decorators/audit.decorator';
import { CurrentUserDecorator } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CurrentUser } from '../../common/interfaces/current-user.interface';
import { CreateDealerDto } from './dto/create-dealer.dto';
import { UpdateDealerDto } from './dto/update-dealer.dto';
import { UpdateDealerStatusDto } from './dto/update-dealer-status.dto';
import { DealersService } from './dealers.service';

@Controller('dealers')
export class DealersController {
  constructor(private readonly dealersService: DealersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @Audit(AuditAction.CREATE, 'dealer')
  create(@Body() dto: CreateDealerDto) {
    return this.dealersService.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.FIU_ANALYST, UserRole.ZIMRA_OFFICER)
  list(
    @Query()
    query: PaginationQueryDto & { status?: 'ACTIVE' | 'SUSPENDED' | 'REVOKED'; search?: string },
    @CurrentUserDecorator() user: CurrentUser,
  ) {
    return this.dealersService.list(query, user);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.FIU_ANALYST)
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.dealersService.getById(id);
  }

  @Get(':id/dashboard-stats')
  @Roles(UserRole.DEALER)
  getDashboardStats(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserDecorator() user: CurrentUser,
  ) {
    return this.dealersService.getDashboardStats(id, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @Audit(AuditAction.UPDATE, 'dealer')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDealerDto) {
    return this.dealersService.update(id, dto);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @Audit(AuditAction.UPDATE, 'dealer')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDealerStatusDto) {
    return this.dealersService.updateStatus(id, dto);
  }
}
