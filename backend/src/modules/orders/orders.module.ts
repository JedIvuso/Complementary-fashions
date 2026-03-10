import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { Order } from "./order.entity";
import { OrderItem } from "./order-item.entity";
import { CartItem } from "../cart/cart-item.entity";
import { Product } from "../products/product.entity";
import { PaymentSettings } from "../payments/payment-settings.entity";
import { Admin } from "../admins/admin.entity";
import { MailModule } from "src/mail/mail.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      CartItem,
      Product,
      PaymentSettings,
      Admin,
    ]),
    MailModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
