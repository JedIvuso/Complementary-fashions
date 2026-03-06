import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HttpModule } from "@nestjs/axios";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { PaymentSettingsService } from "./payment-settings.service";
import { Payment } from "./payment.entity";
import { Order } from "../orders/order.entity";
import { PaymentSettings } from "./payment-settings.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Order, PaymentSettings]),
    HttpModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentSettingsService],
  exports: [PaymentsService, PaymentSettingsService],
})
export class PaymentsModule {}
