import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { Cart } from '../common/entities/cart.entity';
import { Product } from '../common/entities/product.entity';
import { ProductVariant } from '../common/entities/product-variant.entity';
import { SiteSettings } from '../common/entities/site-settings.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, Product, ProductVariant, SiteSettings])],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
