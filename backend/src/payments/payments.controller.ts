import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminJwtGuard } from '../auth/guards/admin-jwt.guard';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('stk-push')
  initiateStkPush(@Body() body: { orderId: string; phone: string }) {
    return this.paymentsService.initiateStkPush(body.orderId, body.phone);
  }

  @Post('callback')
  handleCallback(@Body() body: any) {
    return this.paymentsService.handleCallback(body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('status/:checkoutRequestId')
  checkStatus(@Param('checkoutRequestId') id: string) {
    return this.paymentsService.checkPaymentStatus(id);
  }

  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @Post('confirm/:orderId')
  confirmManually(@Param('orderId') orderId: string) {
    return this.paymentsService.confirmManually(orderId);
  }
}
