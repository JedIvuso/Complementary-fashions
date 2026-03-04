import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../common/entities/cart.entity';
import { Product } from '../common/entities/product.entity';
import { SiteSettings } from '../common/entities/site-settings.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private cartRepo: Repository<Cart>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(SiteSettings) private settingsRepo: Repository<SiteSettings>,
  ) {}

  async getCart(userId: string) {
    const items = await this.cartRepo.find({ where: { userId }, relations: ['product', 'product.images', 'variant'] });
    const settings = await this.settingsRepo.findOne({ where: {} });
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.product.price as any) * item.quantity), 0);
    const deliveryFee = settings?.freeDeliveryThreshold && subtotal >= parseFloat(settings.freeDeliveryThreshold as any)
      ? 0 : parseFloat(settings?.deliveryFee as any) || 0;
    return { items, subtotal, deliveryFee, total: subtotal + deliveryFee };
  }

  async addItem(userId: string, productId: string, variantId?: string, quantity = 1) {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');
    if (!product.isAvailable) throw new BadRequestException('Product not available');

    let item = await this.cartRepo.findOne({ where: { userId, productId, variantId: variantId || null } });
    if (item) {
      item.quantity += quantity;
    } else {
      item = this.cartRepo.create({ userId, productId, variantId, quantity });
    }
    return this.cartRepo.save(item);
  }

  async updateQuantity(userId: string, itemId: string, quantity: number) {
    const item = await this.cartRepo.findOne({ where: { id: itemId, userId } });
    if (!item) throw new NotFoundException('Cart item not found');
    if (quantity <= 0) { await this.cartRepo.remove(item); return { message: 'Item removed' }; }
    item.quantity = quantity;
    return this.cartRepo.save(item);
  }

  async removeItem(userId: string, itemId: string) {
    const item = await this.cartRepo.findOne({ where: { id: itemId, userId } });
    if (!item) throw new NotFoundException('Cart item not found');
    await this.cartRepo.remove(item);
    return { message: 'Item removed' };
  }

  async clearCart(userId: string) {
    await this.cartRepo.delete({ userId });
    return { message: 'Cart cleared' };
  }
}
