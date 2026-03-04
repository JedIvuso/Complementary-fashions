import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AboutContent } from "./entities/about-content.entity";

@Injectable()
export class AboutService {
  constructor(
    @InjectRepository(AboutContent)
    private aboutRepo: Repository<AboutContent>,
  ) {}

  async get() {
    let content = await this.aboutRepo.findOne({ where: {} });
    if (!content) {
      content = this.aboutRepo.create({
        brandStory:
          "Complementary Fashions was born from a love of handcrafted crochet clothing.",
        mission:
          "To create beautiful, handcrafted crochet pieces that celebrate individuality.",
        vision:
          "A world where fashion is slow, sustainable, and deeply personal.",
        craftingProcess:
          "Each piece is hand-crocheted with love and attention to detail.",
        email: "hello@complementaryfashions.com",
      } as AboutContent);
      await this.aboutRepo.save(content);
    }
    return content;
  }

  async update(dto: any) {
    let content = await this.aboutRepo.findOne({ where: {} });
    if (!content) {
      content = this.aboutRepo.create(dto as AboutContent);
    } else {
      Object.assign(content, dto);
    }
    return this.aboutRepo.save(content);
  }
}
