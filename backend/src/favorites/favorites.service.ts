import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../common/entities/favorite.entity';

@Injectable()
export class FavoritesService {
  constructor(@InjectRepository(Favorite) private repo: Repository<Favorite>) {}

  async getFavorites(userId: string) {
    return this.repo.find({ where: { userId }, relations: ['product', 'product.images'] });
  }

  async toggle(userId: string, productId: string) {
    const existing = await this.repo.findOne({ where: { userId, productId } });
    if (existing) {
      await this.repo.remove(existing);
      return { favorited: false };
    }
    await this.repo.save(this.repo.create({ userId, productId }));
    return { favorited: true };
  }

  async isFavorited(userId: string, productId: string) {
    const f = await this.repo.findOne({ where: { userId, productId } });
    return { favorited: !!f };
  }
}
