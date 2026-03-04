import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './favorite.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoritesRepository: Repository<Favorite>,
  ) {}

  async getFavorites(userId: string) {
    return this.favoritesRepository.find({
      where: { userId },
      relations: ['product', 'product.images', 'product.category'],
      order: { createdAt: 'DESC' },
    });
  }

  async toggle(userId: string, productId: string) {
    const existing = await this.favoritesRepository.findOne({
      where: { userId, productId },
    });

    if (existing) {
      await this.favoritesRepository.remove(existing);
      return { favorited: false, message: 'Removed from favorites' };
    }

    const favorite = this.favoritesRepository.create({ userId, productId });
    await this.favoritesRepository.save(favorite);
    return { favorited: true, message: 'Added to favorites' };
  }

  async isFavorited(userId: string, productId: string) {
    const existing = await this.favoritesRepository.findOne({
      where: { userId, productId },
    });
    return { favorited: !!existing };
  }
}
