import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../common/entities/order.entity';
import { OrderItem } from '../common/entities/order-item.entity';
import { Payment, PaymentStatus } from '../common/entities/payment.entity';
import { Cart } from '../common/entities/cart.entity';
import { Product } from '../common/entities/product.entity';
import { SiteSettings } from '../common/entities/site-settings.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private itemRepo: Repository<OrderItem>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Cart) private cartRepo: Repository<Cart>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(SiteSettings) private settingsRepo: Repository<SiteSettings>,
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto) {
    const cartItems = await this.cartRepo.find({ where: { userId }, relations: ['product', 'variant'] });
    if (!cartItems.length) throw new BadRequestException('Cart is empty');

    const settings = await this.settingsRepo.findOne({ where: {} });
    const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.product.price as any) * item.quantity), 0);
    const deliveryFee = settings?.freeDeliveryThreshold && subtotal >= parseFloat(settings.freeDeliveryThreshold as any)
      ? 0 : parseFloat(settings?.deliveryFee as any) || 0;
    const total = subtotal + deliveryFee;

    const orderNumber = `CF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const order = this.orderRepo.create({
      orderNumber,
      userId,
      status: OrderStatus.PENDING,
      subtotal,
      deliveryFee,
      total,
      ...dto,
    });
    const savedOrder = await this.orderRepo.save(order);

    const items = cartItems.map(ci => this.itemRepo.create({
      orderId: savedOrder.id,
      productId: ci.productId,
      variantId: ci.variantId,
      variantSize: ci.variant?.size,
      variantColor: ci.variant?.color,
      quantity: ci.quantity,
      unitPrice: parseFloat(ci.product.price as any),
      totalPrice: parseFloat(ci.product.price as any) * ci.quantity,
    }));
    await this.itemRepo.save(items);

    return this.getOrder(savedOrder.id);
  }

  async getOrder(id: string) {
    const o = await this.orderRepo.findOne({ where: { id }, relations: ['items', 'items.product', 'items.product.images', 'user', 'payments'] });
    if (!o) throw new NotFoundException('Order not found');
    return o;
  }

  async getUserOrders(userId: string) {
    return this.orderRepo.find({ where: { userId }, relations: ['items', 'items.product', 'items.product.images'], order: { createdAt: 'DESC' } });
  }

  async getAllOrders(page = 1, limit = 20, status?: OrderStatus) {
    const qb = this.orderRepo.createQueryBuilder('o')
      .leftJoinAndSelect('o.user', 'user')
      .leftJoinAndSelect('o.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('o.payments', 'payments')
      .orderBy('o.createdAt', 'DESC');
    if (status) qb.where('o.status = :status', { status });
    qb.skip((page - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.getOrder(id);
    order.status = status;
    return this.orderRepo.save(order);
  }

  async confirmPayment(orderId: string, transactionData: any) {
    const order = await this.getOrder(orderId);
    const payment = this.paymentRepo.create({
      orderId,
      status: PaymentStatus.COMPLETED,
      method: transactionData.method || 'mpesa',
      amount: order.total,
      transactionId: transactionData.transactionId,
      mpesaReceiptNumber: transactionData.receiptNumber,
      phoneNumber: transactionData.phone,
    });
    await this.paymentRepo.save(payment);
    order.status = OrderStatus.PAID;
    await this.orderRepo.save(order);
    // Clear cart after payment
    await this.cartRepo.delete({ userId: order.userId });
    return { message: 'Payment confirmed', order };
  }

  async getDashboardStats() {
    const totalOrders = await this.orderRepo.count();
    const totalRevenue = await this.orderRepo
      .createQueryBuilder('o')
      .select('SUM(o.total)', 'sum')
      .where('o.status != :cancelled', { cancelled: OrderStatus.CANCELLED })
      .getRawOne();
    const recentOrders = await this.orderRepo.find({
      relations: ['user', 'items'],
      order: { createdAt: 'DESC' },
      take: 10,
    });
    return { totalOrders, totalRevenue: totalRevenue?.sum || 0, recentOrders };
  }
}
