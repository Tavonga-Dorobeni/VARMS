import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { AuditAction, UserRole } from '@prisma/client';
import { Audit } from '../../common/decorators/audit.decorator';
import { CurrentUserDecorator } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/interfaces/current-user.interface';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SalesListQueryDto } from './dto/sales-list-query.dto';
import { SalesService } from './sales.service';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @Roles(UserRole.DEALER)
  @Audit(AuditAction.CREATE, 'sale_transaction')
  create(@Body() dto: CreateSaleDto, @CurrentUserDecorator() user: CurrentUser) {
    return this.salesService.create(dto, user);
  }

  @Get()
  @Roles(UserRole.DEALER, UserRole.FIU_ANALYST, UserRole.ADMIN)
  list(@Query() query: SalesListQueryDto, @CurrentUserDecorator() user: CurrentUser) {
    return this.salesService.list(query, user);
  }

  @Get(':id')
  @Roles(UserRole.DEALER, UserRole.FIU_ANALYST, UserRole.ADMIN, UserRole.CVR_OFFICER)
  getById(@Param('id', ParseIntPipe) id: number, @CurrentUserDecorator() user: CurrentUser) {
    return this.salesService.getById(id, user);
  }
}
