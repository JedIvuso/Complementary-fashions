import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from '../common/entities/banner.entity';

@Injectable()
export class BannersService {
  constructor(@InjectRepository(Banner) private repo: Repository<Banner>) {}

  async findAll(activeOnly = true) {
    const where: any = activeOnly ? { isActive: true } : {};
    return this.repo.find({ where, order: { sortOrder: 'ASC' } });
  }

  async create(data: Partial<Banner>, imageUrl: string) {
    const banner = this.repo.create({ ...data, imageUrl });
    return this.repo.save(banner);
  }

  async update(id: string, data: Partial<Banner>, imageUrl?: string) {
    const banner = await this.repo.findOne({ where: { id } });
    if (!banner) throw new NotFoundException('Banner not found');
    Object.assign(banner, data);
    if (imageUrl) banner.imageUrl = imageUrl;
    return this.repo.save(banner);
  }

  async delete(id: string) {
    await this.repo.delete(id);
    return { message: 'Banner deleted' };
  }
}
