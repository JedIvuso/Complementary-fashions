import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Exclude } from "class-transformer";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "first_name" })
  firstName: string;

  @Column({ name: "last_name" })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ name: "phone_number", nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  address: string;

  @Column({ default: true, name: "is_active" })
  isActive: boolean;

  @Column({ default: "user" })
  role: string;

  @Column({ name: "theme_preference", default: "light" })
  themePreference: string;

  @Column({ name: "profile_image", nullable: true })
  profileImage: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @Column({ name: "reset_token", nullable: true })
  resetToken: string;

  @Column({ name: "reset_token_expiry", nullable: true, type: "timestamp" })
  resetTokenExpiry: Date;
}

// Appended for password reset
