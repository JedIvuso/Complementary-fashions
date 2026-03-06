import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CartController } from "./cart.controller";
import { CartService } from "./cart.service";
import { CartItem } from "./cart-item.entity";
import { Product } from "../products/product.entity";
import { ProductVariant } from "../products/product-variant.entity";
import { PaymentSettings } from "../payments/payment-settings.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CartItem,
      Product,
      ProductVariant,
      PaymentSettings,
    ]),
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
