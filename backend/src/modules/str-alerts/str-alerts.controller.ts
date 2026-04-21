import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';
import { AuditAction, UserRole } from '@prisma/client';
import { Audit } from '../../common/decorators/audit.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { UpdateStrStatusDto } from './dto/update-str-status.dto';
import { StrAlertsService } from './str-alerts.service';

@Controller()
@Roles(UserRole.FIU_ANALYST)
export class StrAlertsController {
  constructor(private readonly strAlertsService: StrAlertsService) {}

  @Get('str-alerts')
  list(@Query() query: PaginationQueryDto & Record<string, string | undefined>) {
    return this.strAlertsService.list(query);
  }

  @Get('str-alerts/:id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.strAlertsService.getById(id);
  }

  @Patch('str-alerts/:id/status')
  @Audit(AuditAction.UPDATE, 'str_alert')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStrStatusDto) {
    return this.strAlertsService.updateStatus(id, dto);
  }

  @Get('nominee-flags')
  listNomineeFlags(@Query() query: PaginationQueryDto) {
    return this.strAlertsService.listNomineeFlags(query);
  }
}
