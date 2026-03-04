import {
  Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn,
} from 'typeorm';

@Entity('about_content')
export class AboutContent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'text' })
  brandStory: string;

  @Column({ nullable: true, type: 'text' })
  mission: string;

  @Column({ nullable: true, type: 'text' })
  vision: string;

  @Column({ nullable: true, type: 'text' })
  craftingProcess: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  instagram: string;

  @Column({ nullable: true })
  facebook: string;

  @Column({ nullable: true })
  twitter: string;

  @Column({ nullable: true })
  whatsapp: string;

  @Column({ nullable: true })
  tiktok: string;

  @Column({ nullable: true })
  heroImageUrl: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
