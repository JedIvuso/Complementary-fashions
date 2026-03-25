import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LegalContent } from "./legal.entity";

@Injectable()
export class LegalService {
  constructor(
    @InjectRepository(LegalContent)
    private legalRepository: Repository<LegalContent>,
  ) {}

  async get(): Promise<LegalContent> {
    let content = await this.legalRepository.findOne({ where: {} });
    if (!content) {
      content = this.legalRepository.create({});
      await this.legalRepository.save(content);
    }
    return content;
  }

  async updatePrivacyPolicy(text: string): Promise<LegalContent> {
    let content = await this.get();
    content.privacyPolicy = text;
    content.privacyPolicyUpdatedAt = new Date();
    return this.legalRepository.save(content);
  }

  async updateTerms(text: string): Promise<LegalContent> {
    let content = await this.get();
    content.termsAndConditions = text;
    content.termsUpdatedAt = new Date();
    return this.legalRepository.save(content);
  }

  async updateAll(dto: {
    privacyPolicy?: string;
    termsAndConditions?: string;
  }): Promise<LegalContent> {
    let content = await this.get();
    if (dto.privacyPolicy !== undefined) {
      content.privacyPolicy = dto.privacyPolicy;
      content.privacyPolicyUpdatedAt = new Date();
    }
    if (dto.termsAndConditions !== undefined) {
      content.termsAndConditions = dto.termsAndConditions;
      content.termsUpdatedAt = new Date();
    }
    return this.legalRepository.save(content);
  }
}
