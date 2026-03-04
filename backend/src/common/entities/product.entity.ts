import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Category } from './category.entity';
import { ProductImage } from './product-image.entity';
import { ProductVariant } from './product-variant.entity';
import { CartItem } from './cart.entity';
import { Favorite } from './favorite.entity';
import { OrderItem } from './order-item.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true, unique: true })
  slug: string;

  @Column({ default: 0 })
  stockQuantity: number;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  soldCount: number;

  @ManyToOne(() => Category, cat => cat.products, { eager: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ nullable: true })
  categoryId: string;

  @OneToMany(() => ProductImage, img => img.product, { cascade: true, eager: true })
  images: ProductImage[];

  @OneToMany(() => ProductVariant, v => v.product, { cascade: true, eager: true })
  variants: ProductVariant[];

  @OneToMany(() => CartItem, ci => ci.product)
  cartItems: CartItem[];

  @OneToMany(() => Favorite, fav => fav.product)
  favorites: Favorite[];

  @OneToMany(() => OrderItem, oi => oi.product)
  orderItems: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
