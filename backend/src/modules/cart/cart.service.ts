import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './cart-item.entity';
import { Product } from '../products/product.entity';

const DELIVERY_FEE = 200; // KES

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async getCart(userId: string) {
    const items = await this.cartRepository.find({
      where: { userId },
      relations: ['product', 'product.images', 'variant'],
      order: { createdAt: 'ASC' },
    });

    const subtotal = items.reduce((sum, item) => {
      const price = Number(item.product?.price || 0) + Number(item.variant?.additionalPrice || 0);
      return sum + price * item.quantity;
    }, 0);

    const deliveryFee = items.length > 0 ? DELIVERY_FEE : 0;

    return {
      items,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    };
  }

  async addToCart(userId: string, productId: string, variantId?: string, quantity = 1) {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');
    if (!product.isAvailable) throw new BadRequestException('Product is not available');

    let cartItem = await this.cartRepository.findOne({
      where: { userId, productId, variantId: variantId || null },
    });

    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cartItem = this.cartRepository.create({
        userId,
        productId,
        variantId,
        quantity,
      });
    }

    await this.cartRepository.save(cartItem);
    return this.getCart(userId);
  }

  async updateQuantity(userId: string, cartItemId: string, quantity: number) {
    const item = await this.cartRepository.findOne({
      where: { id: cartItemId, userId },
    });
    if (!item) throw new NotFoundException('Cart item not found');

    if (quantity <= 0) {
      await this.cartRepository.remove(item);
    } else {
      item.quantity = quantity;
      await this.cartRepository.save(item);
    }

    return this.getCart(userId);
  }

  async removeFromCart(userId: string, cartItemId: string) {
    const item = await this.cartRepository.findOne({
      where: { id: cartItemId, userId },
    });
    if (!item) throw new NotFoundException('Cart item not found');
    await this.cartRepository.remove(item);
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    await this.cartRepository.delete({ userId });
    return { message: 'Cart cleared' };
  }
}
