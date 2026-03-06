import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Order } from "../orders/order.entity";

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export enum PaymentMethod {
  MPESA = "mpesa",
  CARD = "card",
  CASH = "cash",
}

@Entity("payments")
export class Payment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "order_id" })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.payments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "order_id" })
  order: Order;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @Column({ type: "enum", enum: PaymentMethod, default: PaymentMethod.MPESA })
  method: PaymentMethod;

  @Column({ type: "enum", enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ name: "transaction_id", nullable: true })
  transactionId: string;

  @Column({ name: "mpesa_receipt", nullable: true })
  mpesaReceipt: string;

  @Column({ name: "phone_number", nullable: true })
  phoneNumber: string;

  @Column({ name: "checkout_request_id", nullable: true })
  checkoutRequestId: string;

  @Column({ name: "merchant_request_id", nullable: true })
  merchantRequestId: string;

  @Column({ type: "jsonb", nullable: true, name: "raw_response" })
  rawResponse: any;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
