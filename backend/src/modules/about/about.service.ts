import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AboutContent } from "./about.entity";

@Injectable()
export class AboutService {
  constructor(
    @InjectRepository(AboutContent)
    private aboutRepository: Repository<AboutContent>,
  ) {}

  async getContent() {
    let content = await this.aboutRepository.findOne({ where: {} });
    if (!content) {
      content = this.aboutRepository.create({
        brandStory:
          "Complementary Fashions was born from a love of crochet and handcrafted beauty.",
        mission: "To bring handcrafted crochet fashion to the modern wardrobe.",
        vision: "A world where artisan fashion is accessible to all.",
        craftingProcess:
          "Each piece is hand-crocheted with care using premium yarns.",
        contactEmail: "hello@complementaryfashions.com",
        contactPhone: "+254 700 000 000",
        accentColor: "#d4a373",
      } as AboutContent);
      await this.aboutRepository.save(content);
    }
    return content;
  }

  async updateContent(data: any) {
    let content = await this.aboutRepository.findOne({ where: {} });
    if (!content) {
      content = this.aboutRepository.create(data as AboutContent);
    } else {
      Object.assign(content, data);
    }
    return this.aboutRepository.save(content);
  }
}
