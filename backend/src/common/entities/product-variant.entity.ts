import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  size: string;

  @Column({ nullable: true, length: 50 })
  color: string;

  @Column({ default: 0 })
  stockQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  priceAdjustment: number;

  @Column({ default: true })
  isAvailable: boolean;

  @ManyToOne(() => Product, p => p.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: string;
}
