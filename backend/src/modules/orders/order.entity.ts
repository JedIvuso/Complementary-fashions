import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { User } from "../users/user.entity";
import { OrderItem } from "./order-item.entity";
import { Payment } from "../payments/payment.entity";

export enum OrderStatus {
  PENDING = "pending",
  PAID = "paid",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "order_number", unique: true })
  orderNumber: string;

  @Column({ name: "user_id", nullable: true })
  userId: string;

  @ManyToOne(() => User, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];

  @Column({
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ type: "decimal", precision: 10, scale: 2, name: "subtotal" })
  subtotal: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    name: "delivery_fee",
    default: 0,
  })
  deliveryFee: number;

  @Column({ type: "decimal", precision: 10, scale: 2, name: "total_amount" })
  totalAmount: number;

  // Delivery details
  @Column({ name: "delivery_full_name" })
  deliveryFullName: string;

  @Column({ name: "delivery_phone" })
  deliveryPhone: string;

  @Column({ name: "delivery_email" })
  deliveryEmail: string;

  @Column({ name: "delivery_address", type: "text" })
  deliveryAddress: string;

  @Column({ name: "delivery_city", nullable: true })
  deliveryCity: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ name: "selected_payment_method", nullable: true })
  selectedPaymentMethod: string;

  // POS fields
  @Column({ name: "order_type", default: "online" })
  orderType: string; // 'online' | 'pos'

  @Column({ name: "pos_customer_name", nullable: true })
  posCustomerName: string;

  @Column({ name: "pos_customer_phone", nullable: true })
  posCustomerPhone: string;

  @Column({ name: "pos_customer_email", nullable: true })
  posCustomerEmail: string;

  @Column({ name: "processed_by_id", nullable: true })
  processedById: string;

  @Column({ name: "processed_by_name", nullable: true })
  processedByName: string;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    name: "discount_amount",
    default: 0,
  })
  discountAmount: number;

  @Column({ name: "discount_type", nullable: true })
  discountType: string; // 'percentage' | 'fixed'

  @Column({
    type: "decimal",
    precision: 5,
    scale: 2,
    name: "discount_value",
    default: 0,
  })
  discountValue: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    name: "tax_amount",
    default: 0,
  })
  taxAmount: number;

  @Column({
    name: "cash_tendered",
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
  })
  cashTendered: number;

  @Column({
    name: "change_given",
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
  })
  changeGiven: number;

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
