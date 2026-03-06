import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { PaymentsService } from "./payments.service";
import { PaymentSettingsService } from "./payment-settings.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { AdminAuthGuard } from "../../common/guards/admin-auth.guard";

@ApiTags("Payments")
@Controller("payments")
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paymentSettingsService: PaymentSettingsService,
  ) {}

  // Public — customer gets available payment methods (no sensitive keys)
  @Get("settings/public")
  getPublicSettings() {
    return this.paymentSettingsService.getPublicSettings();
  }

  // Admin — get full settings
  @Get("settings")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  getSettings() {
    return this.paymentSettingsService.getSettings();
  }

  // Admin — update settings
  @Put("settings")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  updateSettings(@Body() body: any) {
    return this.paymentSettingsService.updateSettings(body);
  }

  // Customer confirms manual payment (paybill/till/send money)
  @Post("confirm")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  confirmPayment(
    @Body() body: { orderId: string; mpesaCode: string; method: string },
  ) {
    return this.paymentsService.confirmManualPayment(
      body.orderId,
      body.mpesaCode,
      body.method,
    );
  }

  @Post("mpesa/stk-push")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  stkPush(@Body() body: { orderId: string; phone: string }) {
    return this.paymentsService.initiateMpesaStkPush(body.orderId, body.phone);
  }

  @Post("mpesa/initiate")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  initiateMpesa(@Body() body: { orderId: string; phoneNumber: string }) {
    return this.paymentsService.initiateMpesaStkPush(
      body.orderId,
      body.phoneNumber,
    );
  }

  @Post("mpesa/callback")
  handleCallback(@Body() body: any) {
    return this.paymentsService.handleMpesaCallback(body);
  }

  @Get("mpesa/status/:checkoutRequestId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  checkStatus(@Param("checkoutRequestId") checkoutRequestId: string) {
    return this.paymentsService.checkPaymentStatus(checkoutRequestId);
  }

  @Get("order/:orderId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getOrderPayments(@Param("orderId") orderId: string) {
    return this.paymentsService.getOrderPayments(orderId);
  }
}
