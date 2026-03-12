import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from "typeorm";

@Entity("payment_settings")
export class PaymentSettings {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // M-Pesa STK Push
  @Column({ name: "mpesa_stk_enabled", default: false })
  mpesaStkEnabled: boolean;

  @Column({ name: "mpesa_shortcode", nullable: true })
  mpesaShortcode: string;

  @Column({ name: "mpesa_passkey", nullable: true })
  mpesaPasskey: string;

  @Column({ name: "mpesa_consumer_key", nullable: true })
  mpesaConsumerKey: string;

  @Column({ name: "mpesa_consumer_secret", nullable: true })
  mpesaConsumerSecret: string;

  // M-Pesa Paybill
  @Column({ name: "paybill_enabled", default: false })
  paybillEnabled: boolean;

  @Column({ name: "paybill_number", nullable: true })
  paybillNumber: string;

  @Column({
    name: "paybill_account_format",
    nullable: true,
    default: "ORDER_NUMBER",
  })
  paybillAccountFormat: string; // ORDER_NUMBER or STORE_NAME

  @Column({ name: "paybill_store_name", nullable: true })
  paybillStoreName: string; // shown as account no when format = STORE_NAME

  // Till Number
  @Column({ name: "till_enabled", default: false })
  tillEnabled: boolean;

  @Column({ name: "till_number", nullable: true })
  tillNumber: string;

  @Column({ name: "till_name", nullable: true })
  tillName: string;

  // Send Money (personal number)
  @Column({ name: "send_money_enabled", default: false })
  sendMoneyEnabled: boolean;

  @Column({ name: "send_money_phone", nullable: true })
  sendMoneyPhone: string;

  @Column({ name: "send_money_name", nullable: true })
  sendMoneyName: string;

  // Pay on Delivery
  @Column({ name: "pay_on_delivery_enabled", default: false })
  payOnDeliveryEnabled: boolean;

  @Column({ name: "pay_on_delivery_instructions", nullable: true })
  payOnDeliveryInstructions: string;

  // Pay Later
  @Column({ name: "pay_later_enabled", default: false })
  payLaterEnabled: boolean;

  @Column({ name: "pay_later_instructions", nullable: true })
  payLaterInstructions: string;

  // Delivery
  @Column({
    name: "delivery_fee",
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 200,
  })
  deliveryFee: number;

  @Column({
    name: "free_delivery_threshold",
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
  })
  freeDeliveryThreshold: number;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
