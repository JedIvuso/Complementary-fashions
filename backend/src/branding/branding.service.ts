import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Branding } from "./entities/branding.entity";

@Injectable()
export class BrandingService {
  constructor(
    @InjectRepository(Branding)
    private brandingRepo: Repository<Branding>,
  ) {}

  async get() {
    let branding = await this.brandingRepo.findOne({ where: {} });
    if (!branding) {
      branding = this.brandingRepo.create({
        siteName: "Complementary Fashions",
        accentColor: "#c8956c",
      } as Branding);
      await this.brandingRepo.save(branding);
    }
    return branding;
  }

  async update(dto: any) {
    let branding = await this.brandingRepo.findOne({ where: {} });
    if (!branding) {
      branding = this.brandingRepo.create(dto as Branding);
    } else {
      Object.assign(branding, dto);
    }
    return this.brandingRepo.save(branding);
  }
}
