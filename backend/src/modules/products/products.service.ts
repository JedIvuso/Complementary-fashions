import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, FindManyOptions } from 'typeorm';
import { Product } from './product.entity';
import { ProductImage } from './product-image.entity';
import { ProductVariant } from './product-variant.entity';

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  isAvailable?: boolean;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private imagesRepository: Repository<ProductImage>,
    @InjectRepository(ProductVariant)
    private variantsRepository: Repository<ProductVariant>,
  ) {}

  async findAll(filters: ProductFilters = {}) {
    const {
      search, categoryId, minPrice, maxPrice,
      sortBy = 'newest', isAvailable, isFeatured,
      page = 1, limit = 12,
    } = filters;

    const query = this.productsRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.variants', 'variants');

    if (search) {
      query.andWhere('(product.name ILIKE :search OR product.description ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (categoryId) {
      query.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (minPrice !== undefined) {
      query.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      query.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    if (isAvailable !== undefined) {
      query.andWhere('product.isAvailable = :isAvailable', { isAvailable });
    }

    if (isFeatured !== undefined) {
      query.andWhere('product.isFeatured = :isFeatured', { isFeatured });
    }

    switch (sortBy) {
      case 'price_asc':
        query.orderBy('product.price', 'ASC');
        break;
      case 'price_desc':
        query.orderBy('product.price', 'DESC');
        break;
      case 'popular':
        query.orderBy('product.soldCount', 'DESC');
        break;
      default:
        query.orderBy('product.createdAt', 'DESC');
    }

    const total = await query.getCount();
    const products = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['category', 'images', 'variants'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findRelated(productId: string, limit = 8) {
    const product = await this.findOne(productId);
    return this.productsRepository.find({
      where: { categoryId: product.categoryId, isAvailable: true },
      relations: ['images'],
      take: limit,
      order: { soldCount: 'DESC' },
    });
  }

  async create(data: any) {
    const product = this.productsRepository.create({
      name: data.name,
      description: data.description,
      price: data.price,
      stockQuantity: data.stockQuantity,
      categoryId: data.categoryId,
      isFeatured: data.isFeatured || false,
      isAvailable: data.isAvailable !== false,
    });
    const saved = await this.productsRepository.save(product);

    if (data.images?.length) {
      const images = data.images.map((imgUrl: string, index: number) =>
        this.imagesRepository.create({
          productId: saved.id,
          imageUrl: imgUrl,
          isPrimary: index === 0,
          displayOrder: index,
        }),
      );
      await this.imagesRepository.save(images);
    }

    if (data.variants?.length) {
      const variants = data.variants.map((v: any) =>
        this.variantsRepository.create({
          productId: saved.id,
          size: v.size,
          color: v.color,
          stockQuantity: v.stockQuantity || 0,
          additionalPrice: v.additionalPrice || 0,
        }),
      );
      await this.variantsRepository.save(variants);
    }

    return this.findOne(saved.id);
  }

  async update(id: string, data: any) {
    const product = await this.findOne(id);

    Object.assign(product, {
      name: data.name ?? product.name,
      description: data.description ?? product.description,
      price: data.price ?? product.price,
      stockQuantity: data.stockQuantity ?? product.stockQuantity,
      categoryId: data.categoryId ?? product.categoryId,
      isFeatured: data.isFeatured ?? product.isFeatured,
      isAvailable: data.isAvailable ?? product.isAvailable,
    });

    await this.productsRepository.save(product);

    if (data.images) {
      await this.imagesRepository.delete({ productId: id });
      const images = data.images.map((imgUrl: string, index: number) =>
        this.imagesRepository.create({
          productId: id,
          imageUrl: imgUrl,
          isPrimary: index === 0,
          displayOrder: index,
        }),
      );
      await this.imagesRepository.save(images);
    }

    if (data.variants) {
      await this.variantsRepository.delete({ productId: id });
      const variants = data.variants.map((v: any) =>
        this.variantsRepository.create({
          productId: id,
          size: v.size,
          color: v.color,
          stockQuantity: v.stockQuantity || 0,
          additionalPrice: v.additionalPrice || 0,
        }),
      );
      await this.variantsRepository.save(variants);
    }

    return this.findOne(id);
  }

  async delete(id: string) {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
    return { message: 'Product deleted successfully' };
  }

  async getDashboardStats() {
    const total = await this.productsRepository.count();
    const available = await this.productsRepository.count({ where: { isAvailable: true } });
    const featured = await this.productsRepository.count({ where: { isFeatured: true } });
    return { total, available, featured };
  }
}
