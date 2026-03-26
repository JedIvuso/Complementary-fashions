import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("login_logs")
export class LoginLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  email: string;

  @Column({ name: "user_type" })
  userType: string; // 'customer' | 'admin'

  @Column({ name: "full_name", nullable: true })
  fullName: string;

  @Column()
  success: boolean;

  @Column({ name: "failure_reason", nullable: true })
  failureReason: string;

  @Column({ name: "ip_address", nullable: true })
  ipAddress: string;

  @Column({ name: "user_agent", nullable: true })
  userAgent: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
