import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { BuyersService } from './buyers.service';

@Controller('buyers')
export class BuyersController {
  constructor(private readonly buyersService: BuyersService) {}

  @Get(':id/beneficial-owners')
  @Roles(UserRole.FIU_ANALYST)
  getBeneficialOwners(@Param('id', ParseIntPipe) buyerId: number) {
    return this.buyersService.getBeneficialOwners(buyerId);
  }
}
