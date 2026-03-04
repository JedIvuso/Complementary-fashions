import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column()
  size: string;

  @Column({ nullable: true })
  color: string;

  @Column({ name: 'stock_quantity', default: 0 })
  stockQuantity: number;

  @Column({
    name: 'additional_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  additionalPrice: number;
}
