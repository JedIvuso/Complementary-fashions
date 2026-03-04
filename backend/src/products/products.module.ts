import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from '../common/entities/product.entity';
import { ProductImage } from '../common/entities/product-image.entity';
import { ProductVariant } from '../common/entities/product-variant.entity';
import { Category } from '../common/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductImage, ProductVariant, Category])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
