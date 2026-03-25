import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from "typeorm";

@Entity("legal_content")
export class LegalContent {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "privacy_policy", type: "text", nullable: true })
  privacyPolicy: string;

  @Column({
    name: "privacy_policy_updated_at",
    type: "timestamp",
    nullable: true,
  })
  privacyPolicyUpdatedAt: Date;

  @Column({ name: "terms_and_conditions", type: "text", nullable: true })
  termsAndConditions: string;

  @Column({ name: "terms_updated_at", type: "timestamp", nullable: true })
  termsUpdatedAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
