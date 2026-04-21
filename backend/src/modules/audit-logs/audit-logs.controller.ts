import { Controller, Get, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AuditLogsService } from './audit-logs.service';

@Controller('audit-logs')
@Roles(UserRole.FIU_ANALYST, UserRole.ADMIN)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  list(@Query() query: PaginationQueryDto & Record<string, string | undefined>) {
    return this.auditLogsService.list(query);
  }

  @Get('export')
  export(@Query() query: PaginationQueryDto & Record<string, string | undefined>) {
    return this.auditLogsService.export(query);
  }
}
