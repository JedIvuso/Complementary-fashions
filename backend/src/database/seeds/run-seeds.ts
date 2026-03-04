import "reflect-metadata";
import { DataSource } from "typeorm";
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";
dotenv.config();

import { User } from "../../users/entities/user.entity";
import { Admin } from "../../admin/entities/admin.entity";
import { Category } from "../../categories/entities/category.entity";
import { Product } from "../../products/entities/product.entity";
import { ProductImage } from "../../products/entities/product-image.entity";
import { ProductVariant } from "../../products/entities/product-variant.entity";
import { CartItem } from "../../cart/entities/cart-item.entity";
import { Favorite } from "../../favorites/entities/favorite.entity";
import { Order } from "../../orders/entities/order.entity";
import { OrderItem } from "../../orders/entities/order-item.entity";
import { Payment } from "../../payments/entities/payment.entity";
import { Banner } from "../../banners/entities/banner.entity";
import { AboutContent } from "../../about/entities/about-content.entity";
import { Branding } from "../../branding/entities/branding.entity";

const ds = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "complementary_fashions",
  entities: [
    User,
    Admin,
    Category,
    Product,
    ProductImage,
    ProductVariant,
    CartItem,
    Favorite,
    Order,
    OrderItem,
    Payment,
    Banner,
    AboutContent,
    Branding,
  ],
  synchronize: true,
});

async function seed() {
  await ds.initialize();
  console.log("🌱 Seeding database...");

  // Admin
  const adminEmail =
    process.env.ADMIN_EMAIL || "admin@complementaryfashions.com";
  const adminPass = process.env.ADMIN_PASSWORD || "Admin@123";
  const adminRepo = ds.getRepository(Admin);
  const existAdmin = await adminRepo.findOne({ where: { email: adminEmail } });
  if (!existAdmin) {
    const hashed = await bcrypt.hash(adminPass, 12);
    await adminRepo.save(
      adminRepo.create({
        email: adminEmail,
        password: hashed,
        firstName: "Super",
        lastName: "Admin",
      }),
    );
    console.log(`✅ Admin created: ${adminEmail}`);
  }

  // Branding
  const brandingRepo = ds.getRepository(Branding);
  if (!(await brandingRepo.count())) {
    await brandingRepo.save(
      brandingRepo.create({
        siteName: "Complementary Fashions",
        siteTagline: "Handcrafted crochet for the modern soul",
        accentColor: "#c8956c",
      }),
    );
    console.log("✅ Branding seeded");
  }

  // About
  const aboutRepo = ds.getRepository(AboutContent);
  if (!(await aboutRepo.count())) {
    await aboutRepo.save(
      aboutRepo.create({
        brandStory:
          "Complementary Fashions was founded in 2020 with a simple belief: clothing should tell a story. Each piece in our collection is hand-crocheted, infusing personality and artistry into every stitch.",
        mission:
          "To craft beautiful, sustainable crochet clothing that celebrates individuality and the art of slow fashion.",
        vision:
          "A world where fashion is deeply personal, mindfully made, and enduringly beautiful.",
        craftingProcess:
          "Every garment begins with the finest yarns, selected for their texture, durability, and color. Our artisans spend hours hand-crocheting each piece, ensuring every stitch is perfect.",
        email: "hello@complementaryfashions.com",
        phone: "+254 700 000 000",
        address: "Nairobi, Kenya",
        instagram: "https://instagram.com/complementaryfashions",
        facebook: "https://facebook.com/complementaryfashions",
        whatsapp: "https://wa.me/254700000000",
      }),
    );
    console.log("✅ About content seeded");
  }

  // Categories
  const categoryRepo = ds.getRepository(Category);
  if (!(await categoryRepo.count())) {
    const categories = [
      {
        name: "Tops",
        slug: "tops",
        description: "Beautiful crochet tops and blouses",
        sortOrder: 0,
      },
      {
        name: "Dresses",
        slug: "dresses",
        description: "Elegant crochet dresses",
        sortOrder: 1,
      },
      {
        name: "Cardigans",
        slug: "cardigans",
        description: "Cozy crochet cardigans",
        sortOrder: 2,
      },
      {
        name: "Skirts",
        slug: "skirts",
        description: "Flowy crochet skirts",
        sortOrder: 3,
      },
      {
        name: "Accessories",
        slug: "accessories",
        description: "Crochet bags, hats, and more",
        sortOrder: 4,
      },
    ];
    await categoryRepo.save(categories.map((c) => categoryRepo.create(c)));
    console.log("✅ Categories seeded");
  }

  // Sample Banners
  const bannerRepo = ds.getRepository(Banner);
  if (!(await bannerRepo.count())) {
    await bannerRepo.save([
      bannerRepo.create({
        title: "New Summer Collection",
        subtitle: "Handcrafted crochet pieces for the warm season",
        ctaText: "Shop Now",
        ctaLink: "/products",
        sortOrder: 0,
        imageUrl:
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200",
      }),
      bannerRepo.create({
        title: "Artisan Crafted",
        subtitle: "Every stitch tells a story",
        ctaText: "Explore",
        ctaLink: "/about",
        sortOrder: 1,
        imageUrl:
          "https://images.unsplash.com/photo-1594938298603-c8148c4b4e9e?w=1200",
      }),
    ]);
    console.log("✅ Banners seeded");
  }

  await ds.destroy();
  console.log("🎉 Seeding complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
