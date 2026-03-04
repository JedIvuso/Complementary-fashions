import {
  Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn,
} from 'typeorm';

@Entity('branding')
export class Branding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  faviconUrl: string;

  @Column({ nullable: true, default: '#c8956c' })
  accentColor: string;

  @Column({ nullable: true, default: 'Complementary Fashions' })
  siteName: string;

  @Column({ nullable: true, type: 'text' })
  siteTagline: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
