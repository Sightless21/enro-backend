import { Body, Controller, Param, Post, Patch } from '@nestjs/common';
import { InstallmentsService } from './installments.service';
import { SubmitSlipDto } from './dto/submit-slip.dto';
import { CurrentUser } from '@/auth/decorator/current-user.decorator';
import { Roles } from '@/auth/decorator/roles.decorator';
import { VerifyInstallmentDto } from './dto/verify-installment.dto';

@Controller('installments')
export class InstallmentsController {
  constructor(private readonly installmentsService: InstallmentsService) {}

  @Patch(':id/submit-slip')
  @Roles('STUDENT')
  submitSlip(
    @Param('id') id: string,
    @Body() data: SubmitSlipDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.installmentsService.submitSlip(id, data, userId);
  }

  @Post(':id/verify')
  @Roles('ADMIN')
  verify(@Param('id') id: string, @Body() data: VerifyInstallmentDto) {
    return this.installmentsService.verify(id, data.approve);
  }
}
