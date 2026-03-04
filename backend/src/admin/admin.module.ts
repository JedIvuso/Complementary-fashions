import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { SiteSettings } from '../common/entities/site-settings.entity';
import { User } from '../common/entities/user.entity';
import { Product } from '../common/entities/product.entity';
import { Category } from '../common/entities/category.entity';
import { Order } from '../common/entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SiteSettings, User, Product, Category, Order])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
