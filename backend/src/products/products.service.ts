import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between } from 'typeorm';
import { Product } from '../common/entities/product.entity';
import { ProductImage } from '../common/entities/product-image.entity';
import { ProductVariant } from '../common/entities/product-variant.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(ProductImage) private imageRepo: Repository<ProductImage>,
    @InjectRepository(ProductVariant) private variantRepo: Repository<ProductVariant>,
  ) {}

  async findAll(query: ProductQueryDto) {
    const qb = this.productRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.images', 'images')
      .leftJoinAndSelect('p.variants', 'variants')
      .leftJoinAndSelect('p.category', 'category');

    if (!query.includeUnavailable) qb.where('p.isAvailable = :avail', { avail: true });
    if (query.search) qb.andWhere('p.name ILIKE :search OR p.description ILIKE :search', { search: `%${query.search}%` });
    if (query.categoryId) qb.andWhere('p.categoryId = :catId', { catId: query.categoryId });
    if (query.minPrice) qb.andWhere('p.price >= :min', { min: query.minPrice });
    if (query.maxPrice) qb.andWhere('p.price <= :max', { max: query.maxPrice });
    if (query.featured) qb.andWhere('p.isFeatured = :feat', { feat: true });

    const sortField = query.sortBy === 'price' ? 'p.price' : query.sortBy === 'popularity' ? 'p.soldCount' : 'p.createdAt';
    qb.orderBy(sortField, query.sortDir === 'ASC' ? 'ASC' : 'DESC');

    const page = query.page || 1;
    const limit = query.limit || 20;
    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const p = await this.productRepo.findOne({
      where: { id },
      relations: ['images', 'variants', 'category'],
    });
    if (!p) throw new NotFoundException('Product not found');
    await this.productRepo.increment({ id }, 'viewCount', 1);
    return p;
  }

  async findRelated(id: string) {
    const p = await this.findOne(id);
    return this.productRepo.find({
      where: { categoryId: p.categoryId, isAvailable: true },
      relations: ['images'],
      take: 6,
    });
  }

  async create(dto: CreateProductDto, imageFiles?: Express.Multer.File[]) {
    const slug = dto.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    const product = this.productRepo.create({ ...dto, slug });
    const saved = await this.productRepo.save(product);

    if (dto.variants) {
      const variants = (typeof dto.variants === 'string' ? JSON.parse(dto.variants) : dto.variants)
        .map((v: any) => this.variantRepo.create({ ...v, productId: saved.id }));
      await this.variantRepo.save(variants);
    }

    if (imageFiles?.length) {
      const images = imageFiles.map((f, i) => this.imageRepo.create({
        url: `/uploads/products/${f.filename}`,
        isPrimary: i === 0,
        sortOrder: i,
        productId: saved.id,
      }));
      await this.imageRepo.save(images);
    }

    return this.findOne(saved.id);
  }

  async update(id: string, dto: Partial<CreateProductDto>, imageFiles?: Express.Multer.File[]) {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    await this.productRepo.save(product);

    if (dto.variants) {
      await this.variantRepo.delete({ productId: id });
      const variants = (typeof dto.variants === 'string' ? JSON.parse(dto.variants) : dto.variants)
        .map((v: any) => this.variantRepo.create({ ...v, productId: id }));
      await this.variantRepo.save(variants);
    }

    if (imageFiles?.length) {
      const images = imageFiles.map((f, i) => this.imageRepo.create({
        url: `/uploads/products/${f.filename}`,
        isPrimary: false,
        sortOrder: product.images.length + i,
        productId: id,
      }));
      await this.imageRepo.save(images);
    }

    return this.findOne(id);
  }

  async delete(id: string) {
    const p = await this.findOne(id);
    await this.productRepo.remove(p);
    return { message: 'Product deleted' };
  }

  async deleteImage(productId: string, imageId: string) {
    await this.imageRepo.delete({ id: imageId, productId });
    return { message: 'Image deleted' };
  }

  async getFeatured() {
    return this.productRepo.find({
      where: { isFeatured: true, isAvailable: true },
      relations: ['images', 'category'],
      take: 10,
    });
  }
}
