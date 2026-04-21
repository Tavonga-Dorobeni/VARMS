import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuditAction, UserRole } from '@prisma/client';
import { Audit } from '../../common/decorators/audit.decorator';
import { CurrentUserDecorator } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/interfaces/current-user.interface';
import { ApproveRegistrationDto } from './dto/approve-registration.dto';
import { RegistrationListQueryDto } from './dto/registration-list-query.dto';
import { RegistrationSearchDto } from './dto/registration-search.dto';
import { RegistrationService } from './registration.service';

@Controller('registration')
@Roles(UserRole.CVR_OFFICER)
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Get()
  list(@Query() query: RegistrationListQueryDto, @CurrentUserDecorator() user: CurrentUser) {
    return this.registrationService.list(query, user);
  }

  @Get('search')
  search(@Query() query: RegistrationSearchDto) {
    return this.registrationService.search(query);
  }

  @Post('approve')
  @Audit(AuditAction.CREATE, 'registration_record')
  approve(@Body() dto: ApproveRegistrationDto, @CurrentUserDecorator() user: CurrentUser) {
    return this.registrationService.approve(dto, user);
  }
}

@Controller('cvr')
@Roles(UserRole.CVR_OFFICER)
export class CvrDashboardController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Get('dashboard-stats')
  getDashboardStats(@CurrentUserDecorator() user: CurrentUser) {
    return this.registrationService.getDashboardStats(user);
  }
}
