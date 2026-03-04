import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async findAll(includeProducts = false) {
    const relations = includeProducts ? ['products', 'products.images'] : [];
    return this.categoriesRepository.find({
      where: { isActive: true },
      relations,
      order: { displayOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async findAllAdmin() {
    return this.categoriesRepository.find({
      relations: ['products'],
      order: { displayOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string) {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['products', 'products.images'],
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(data: any) {
    const category = this.categoriesRepository.create(data);
    return this.categoriesRepository.save(category);
  }

  async update(id: string, data: any) {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    Object.assign(category, data);
    return this.categoriesRepository.save(category);
  }

  async delete(id: string) {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    await this.categoriesRepository.remove(category);
    return { message: 'Category deleted' };
  }

  async reorder(orders: { id: string; displayOrder: number }[]) {
    for (const item of orders) {
      await this.categoriesRepository.update(item.id, { displayOrder: item.displayOrder });
    }
    return { message: 'Categories reordered' };
  }
}
