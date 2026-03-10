import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CartItem } from "./cart-item.entity";
import { Product } from "../products/product.entity";
import { PaymentSettings } from "../payments/payment-settings.entity";

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(PaymentSettings)
    private paymentSettingsRepo: Repository<PaymentSettings>,
  ) {}

  async getCart(userId: string) {
    const items = await this.cartRepository.find({
      where: { userId },
      relations: ["product", "product.images", "variant"],
      order: { createdAt: "ASC" },
    });

    const subtotal = items.reduce((sum, item) => {
      const price =
        Number(item.product?.price || 0) +
        Number(item.variant?.additionalPrice || 0);
      return sum + price * item.quantity;
    }, 0);

    let deliveryFee = 0;
    if (items.length > 0) {
      const settings = await this.paymentSettingsRepo.findOne({ where: {} });
      const fee = Number(settings?.deliveryFee ?? 200);
      const threshold = settings?.freeDeliveryThreshold
        ? Number(settings.freeDeliveryThreshold)
        : null;
      deliveryFee = threshold && subtotal >= threshold ? 0 : fee;
    }

    return {
      items,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    };
  }

  async addToCart(
    userId: string,
    productId: string,
    variantId?: string,
    quantity = 1,
  ) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException("Product not found");
    if (!product.isAvailable)
      throw new BadRequestException("Product is not available");
    if (product.stockQuantity <= 0)
      throw new BadRequestException("This product is out of stock");

    // Check requested quantity doesn't exceed available stock
    const existingQty = await this.cartRepository.findOne({
      where: { userId, productId, variantId: variantId || null },
    });
    const totalQty = (existingQty?.quantity || 0) + quantity;
    if (totalQty > product.stockQuantity) {
      throw new BadRequestException(
        `Only ${product.stockQuantity} item(s) available in stock`,
      );
    }

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
    if (!item) throw new NotFoundException("Cart item not found");

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
    if (!item) throw new NotFoundException("Cart item not found");
    await this.cartRepository.remove(item);
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    await this.cartRepository.delete({ userId });
    return { message: "Cart cleared" };
  }
}
