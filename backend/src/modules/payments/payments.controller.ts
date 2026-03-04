import {
  Controller, Post, Get, Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('mpesa/initiate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  initiateMpesa(@Body() body: { orderId: string; phoneNumber: string }) {
    return this.paymentsService.initiateMpesaStkPush(body.orderId, body.phoneNumber);
  }

  @Post('mpesa/callback')
  handleCallback(@Body() body: any) {
    return this.paymentsService.handleMpesaCallback(body);
  }

  @Get('mpesa/status/:checkoutRequestId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  checkStatus(@Param('checkoutRequestId') checkoutRequestId: string) {
    return this.paymentsService.checkPaymentStatus(checkoutRequestId);
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getOrderPayments(@Param('orderId') orderId: string) {
    return this.paymentsService.getOrderPayments(orderId);
  }
}
