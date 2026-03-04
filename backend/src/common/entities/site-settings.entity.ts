import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('site_settings')
export class SiteSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  faviconUrl: string;

  @Column({ nullable: true, length: 7, default: '#C9A96E' })
  accentColor: string;

  @Column({ nullable: true, type: 'text' })
  aboutContent: string;

  @Column({ nullable: true, type: 'text' })
  missionContent: string;

  @Column({ nullable: true, type: 'text' })
  visionContent: string;

  @Column({ nullable: true, type: 'text' })
  craftingProcess: string;

  @Column({ nullable: true })
  contactEmail: string;

  @Column({ nullable: true })
  contactPhone: string;

  @Column({ nullable: true })
  contactAddress: string;

  @Column({ nullable: true })
  instagramUrl: string;

  @Column({ nullable: true })
  facebookUrl: string;

  @Column({ nullable: true })
  twitterUrl: string;

  @Column({ nullable: true })
  tiktokUrl: string;

  @Column({ nullable: true })
  whatsappNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  deliveryFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  freeDeliveryThreshold: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
