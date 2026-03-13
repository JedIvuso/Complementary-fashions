import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { AdminsModule } from "./modules/admins/admins.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { ProductsModule } from "./modules/products/products.module";
import { CartModule } from "./modules/cart/cart.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { FavoritesModule } from "./modules/favorites/favorites.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { BannersModule } from "./modules/banners/banners.module";
import { AboutModule } from "./modules/about/about.module";
import { UploadsModule } from "./modules/uploads/uploads.module";

// Entities
import { User } from "./modules/users/user.entity";
import { Admin } from "./modules/admins/admin.entity";
import { Category } from "./modules/categories/category.entity";
import { Product } from "./modules/products/product.entity";
import { ProductImage } from "./modules/products/product-image.entity";
import { ProductVariant } from "./modules/products/product-variant.entity";
import { CartItem } from "./modules/cart/cart-item.entity";
import { Order } from "./modules/orders/order.entity";
import { OrderItem } from "./modules/orders/order-item.entity";
import { Payment } from "./modules/payments/payment.entity";
import { Favorite } from "./modules/favorites/favorite.entity";
import { Banner } from "./modules/banners/banner.entity";
import { AboutContent } from "./modules/about/about.entity";
import { PaymentSettings } from "./modules/payments/payment-settings.entity";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbUrl = configService.get<string>("DATABASE_URL");
        const isProduction =
          configService.get<string>("NODE_ENV") === "production";
        const entities = [
          User,
          Admin,
          Category,
          Product,
          ProductImage,
          ProductVariant,
          CartItem,
          Order,
          OrderItem,
          Payment,
          Favorite,
          Banner,
          AboutContent,
          PaymentSettings,
        ];
        if (dbUrl) {
          return {
            type: "postgres" as const,
            url: dbUrl,
            ssl: { rejectUnauthorized: false },
            entities,
            synchronize: !isProduction,
            logging: !isProduction,
          };
        }
        return {
          type: "postgres" as const,
          host: configService.get<string>("DATABASE_HOST", "localhost"),
          port: configService.get<number>("DATABASE_PORT", 5432),
          username: configService.get<string>("DATABASE_USERNAME", "cf_user"),
          password: configService.get<string>(
            "DATABASE_PASSWORD",
            "cf_secure_password",
          ),
          database: configService.get<string>(
            "DATABASE_NAME",
            "complementary_fashions",
          ),
          entities,
          synchronize: !isProduction,
          logging: !isProduction,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    AdminsModule,
    CategoriesModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    FavoritesModule,
    PaymentsModule,
    BannersModule,
    AboutModule,
    UploadsModule,
  ],
})
export class AppModule {}
