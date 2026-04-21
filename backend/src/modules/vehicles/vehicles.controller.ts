import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { AuditAction, UserRole } from '@prisma/client';
import { Audit } from '../../common/decorators/audit.decorator';
import { CurrentUserDecorator } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CurrentUser } from '../../common/interfaces/current-user.interface';
import { CreateImportDto } from './dto/create-import.dto';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { ZimraImportsQueryDto } from './dto/zimra-imports-query.dto';
import { VehiclesService } from './vehicles.service';

@Controller()
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post('vehicles/import')
  @Roles(UserRole.ZIMRA_OFFICER)
  @Audit(AuditAction.CREATE, 'import_record')
  createImport(@Body() dto: CreateImportDto, @CurrentUserDecorator() user: CurrentUser) {
    return this.vehiclesService.createImport(dto, user);
  }

  @Get('vehicles/import/:id')
  @Roles(UserRole.ZIMRA_OFFICER, UserRole.FIU_ANALYST)
  getImportRecord(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesService.getImportRecord(id);
  }

  @Get('zimra/dashboard-stats')
  @Roles(UserRole.ZIMRA_OFFICER)
  getZimraDashboardStats(@CurrentUserDecorator() user: CurrentUser) {
    return this.vehiclesService.getZimraDashboardStats(user);
  }

  @Get('zimra/imports')
  @Roles(UserRole.ZIMRA_OFFICER)
  listImports(@Query() query: ZimraImportsQueryDto, @CurrentUserDecorator() user: CurrentUser) {
    return this.vehiclesService.listImports(query, user);
  }

  @Get('dealers/:dealerId/inventory')
  @Roles(UserRole.DEALER, UserRole.FIU_ANALYST, UserRole.ADMIN)
  listInventory(
    @Param('dealerId', ParseIntPipe) dealerId: number,
    @Query() query: InventoryQueryDto,
    @CurrentUserDecorator() user: CurrentUser,
  ) {
    return this.vehiclesService.listInventory(dealerId, query, user);
  }

  @Get('vehicles/:id')
  @Roles(UserRole.DEALER, UserRole.FIU_ANALYST, UserRole.ADMIN, UserRole.CVR_OFFICER)
  getVehicle(@Param('id', ParseIntPipe) id: number, @CurrentUserDecorator() user: CurrentUser) {
    return this.vehiclesService.getVehicleDetail(id, user);
  }
}
