import {
  Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  MPESA = 'mpesa',
  PAYBILL = 'paybill',
  MANUAL = 'manual',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.MPESA })
  method: PaymentMethod;

  @Column({ nullable: true })
  mpesaReceiptNumber: string;

  @Column({ nullable: true })
  checkoutRequestId: string;

  @Column({ nullable: true })
  merchantRequestId: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true, type: 'jsonb' })
  callbackData: any;

  @OneToOne(() => Order, (o) => o.payment)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  orderId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
