import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './banner.entity';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private bannersRepository: Repository<Banner>,
  ) {}

  async findAll() {
    return this.bannersRepository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
    });
  }

  async findAllAdmin() {
    return this.bannersRepository.find({ order: { displayOrder: 'ASC' } });
  }

  async create(data: any) {
    const banner = this.bannersRepository.create(data);
    return this.bannersRepository.save(banner);
  }

  async update(id: string, data: any) {
    const banner = await this.bannersRepository.findOne({ where: { id } });
    if (!banner) throw new NotFoundException('Banner not found');
    Object.assign(banner, data);
    return this.bannersRepository.save(banner);
  }

  async delete(id: string) {
    const banner = await this.bannersRepository.findOne({ where: { id } });
    if (!banner) throw new NotFoundException('Banner not found');
    await this.bannersRepository.remove(banner);
    return { message: 'Banner deleted' };
  }
}
