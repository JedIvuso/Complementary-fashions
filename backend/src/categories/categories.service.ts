import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../common/entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(Category) private repo: Repository<Category>) {}

  async findAll(includeInactive = false) {
    const qb = this.repo.createQueryBuilder('cat')
      .leftJoinAndSelect('cat.products', 'products')
      .orderBy('cat.sortOrder', 'ASC');
    if (!includeInactive) qb.where('cat.isActive = :active', { active: true });
    return qb.getMany();
  }

  async findOne(id: string) {
    const cat = await this.repo.findOne({ where: { id }, relations: ['products', 'products.images'] });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async create(dto: CreateCategoryDto, imageUrl?: string) {
    const existing = await this.repo.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException('Category name already exists');
    const slug = dto.name.toLowerCase().replace(/\s+/g, '-');
    const cat = this.repo.create({ ...dto, slug, image: imageUrl });
    return this.repo.save(cat);
  }

  async update(id: string, dto: Partial<CreateCategoryDto>, imageUrl?: string) {
    const cat = await this.findOne(id);
    Object.assign(cat, dto);
    if (imageUrl) cat.image = imageUrl;
    if (dto.name) cat.slug = dto.name.toLowerCase().replace(/\s+/g, '-');
    return this.repo.save(cat);
  }

  async delete(id: string) {
    const cat = await this.findOne(id);
    await this.repo.remove(cat);
    return { message: 'Category deleted' };
  }

  async reorder(orders: { id: string; sortOrder: number }[]) {
    await Promise.all(orders.map(o => this.repo.update(o.id, { sortOrder: o.sortOrder })));
    return { message: 'Categories reordered' };
  }
}
