import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { PosController } from "./pos.controller";
import { PosService } from "./pos.service";
import { Order } from "./order.entity";
import { OrderItem } from "./order-item.entity";
import { CartItem } from "../cart/cart-item.entity";
import { Product } from "../products/product.entity";
import { PaymentSettings } from "../payments/payment-settings.entity";
import { Admin } from "../admins/admin.entity";
import { ProductVariant } from "../products/product-variant.entity";
import { MailModule } from "../../mail/mail.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      CartItem,
      Product,
      ProductVariant,
      PaymentSettings,
      Admin,
    ]),
    MailModule,
  ],
  controllers: [OrdersController, PosController],
  providers: [OrdersService, PosService],
  exports: [OrdersService, PosService],
})
export class OrdersModule {}
