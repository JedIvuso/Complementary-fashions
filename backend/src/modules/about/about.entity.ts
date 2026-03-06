import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from "typeorm";

@Entity("about_content")
export class AboutContent {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Hero section
  @Column({
    name: "hero_title",
    nullable: true,
    default: "Crafting Stories, One Stitch at a Time",
  })
  heroTitle: string;

  @Column({ name: "hero_subtitle", nullable: true, default: "Our Identity" })
  heroSubtitle: string;

  // Brand story
  @Column({ name: "brand_story", type: "text", nullable: true })
  brandStory: string;

  @Column({ type: "text", nullable: true })
  mission: string;

  @Column({ type: "text", nullable: true })
  vision: string;

  @Column({ name: "crafting_process", type: "text", nullable: true })
  craftingProcess: string;

  // Owner section
  @Column({ name: "owner_name", nullable: true })
  ownerName: string;

  @Column({ name: "owner_bio", type: "text", nullable: true })
  ownerBio: string;

  @Column({ name: "owner_image_url", nullable: true })
  ownerImageUrl: string;

  // Contact
  @Column({ name: "contact_email", nullable: true })
  contactEmail: string;

  @Column({ name: "contact_phone", nullable: true })
  contactPhone: string;

  @Column({ name: "contact_address", type: "text", nullable: true })
  contactAddress: string;

  // Social
  @Column({ name: "facebook_url", nullable: true })
  facebookUrl: string;

  @Column({ name: "instagram_url", nullable: true })
  instagramUrl: string;

  @Column({ name: "twitter_url", nullable: true })
  twitterUrl: string;

  @Column({ name: "tiktok_url", nullable: true })
  tiktokUrl: string;

  @Column({ name: "whatsapp_number", nullable: true })
  whatsappNumber: string;

  // Branding
  @Column({ name: "logo_url", nullable: true })
  logoUrl: string;

  @Column({ name: "favicon_url", nullable: true })
  faviconUrl: string;

  @Column({ name: "accent_color", nullable: true, default: "#d4a373" })
  accentColor: string;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
