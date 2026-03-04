import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from '../common/entities/order.entity';
import { OrderItem } from '../common/entities/order-item.entity';
import { Payment } from '../common/entities/payment.entity';
import { Cart } from '../common/entities/cart.entity';
import { Product } from '../common/entities/product.entity';
import { SiteSettings } from '../common/entities/site-settings.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Payment, Cart, Product, SiteSettings])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
