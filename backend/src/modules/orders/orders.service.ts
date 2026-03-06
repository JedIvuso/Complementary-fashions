import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order, OrderStatus } from "./order.entity";
import { OrderItem } from "./order-item.entity";
import { CartItem } from "../cart/cart-item.entity";
import { Product } from "../products/product.entity";
import { PaymentSettings } from "../payments/payment-settings.entity";

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(CartItem)
    private cartRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(PaymentSettings)
    private paymentSettingsRepo: Repository<PaymentSettings>,
  ) {}

  async createOrder(userId: string, deliveryDetails: any) {
    const cartItems = await this.cartRepository.find({
      where: { userId },
      relations: ["product", "variant"],
    });

    if (!cartItems.length) {
      throw new BadRequestException("Cart is empty");
    }

    const subtotal = cartItems.reduce((sum, item) => {
      const price =
        Number(item.product.price) + Number(item.variant?.additionalPrice || 0);
      return sum + price * item.quantity;
    }, 0);

    // Load delivery fee from settings
    const settings = await this.paymentSettingsRepo.findOne({ where: {} });
    let deliveryFee = Number(settings?.deliveryFee ?? 200);
    // Apply free delivery threshold if set
    if (
      settings?.freeDeliveryThreshold &&
      subtotal >= Number(settings.freeDeliveryThreshold)
    ) {
      deliveryFee = 0;
    }

    const orderNumber = `CF-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const order = this.ordersRepository.create({
      orderNumber,
      userId,
      subtotal,
      deliveryFee,
      totalAmount: subtotal + deliveryFee,
      deliveryFullName: deliveryDetails.fullName,
      deliveryPhone: deliveryDetails.phone,
      deliveryEmail: deliveryDetails.email,
      deliveryAddress: deliveryDetails.address,
      deliveryCity: deliveryDetails.city,
      notes: deliveryDetails.notes,
      selectedPaymentMethod: deliveryDetails.paymentMethod || null,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.ordersRepository.save(order);

    const orderItems = cartItems.map((item) =>
      this.orderItemsRepository.create({
        orderId: savedOrder.id,
        productId: item.productId,
        productName: item.product.name,
        unitPrice:
          Number(item.product.price) +
          Number(item.variant?.additionalPrice || 0),
        quantity: item.quantity,
        totalPrice:
          (Number(item.product.price) +
            Number(item.variant?.additionalPrice || 0)) *
          item.quantity,
        selectedSize: item.variant?.size,
        selectedColor: item.variant?.color,
      }),
    );

    await this.orderItemsRepository.save(orderItems);
    await this.cartRepository.delete({ userId });

    return this.findOne(savedOrder.id);
  }

  async findAll(filters: any = {}) {
    const { page = 1, limit = 20, status, userId } = filters;

    const query = this.ordersRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.user", "user")
      .leftJoinAndSelect("order.items", "items")
      .leftJoinAndSelect("items.product", "product")
      .leftJoinAndSelect("product.images", "productImages")
      .leftJoinAndSelect("order.payments", "payments");

    if (status) query.andWhere("order.status = :status", { status });
    if (userId) query.andWhere("order.userId = :userId", { userId });

    query.orderBy("order.createdAt", "DESC");

    const total = await query.getCount();
    const data = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findUserOrders(userId: string) {
    return this.ordersRepository.find({
      where: { userId },
      relations: ["items", "items.product", "items.product.images", "payments"],
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: string) {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: [
        "user",
        "items",
        "items.product",
        "items.product.images",
        "payments",
      ],
    });
    if (!order) throw new NotFoundException("Order not found");
    return order;
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.findOne(id);
    order.status = status;
    return this.ordersRepository.save(order);
  }

  async getDashboardStats() {
    const total = await this.ordersRepository.count();
    const pending = await this.ordersRepository.count({
      where: { status: OrderStatus.PENDING },
    });
    const paid = await this.ordersRepository.count({
      where: { status: OrderStatus.PAID },
    });

    const revenueResult = await this.ordersRepository
      .createQueryBuilder("order")
      .select("SUM(order.totalAmount)", "total")
      .where("order.status != :cancelled", { cancelled: OrderStatus.CANCELLED })
      .getRawOne();

    const recentOrders = await this.ordersRepository.find({
      relations: ["user", "items"],
      order: { createdAt: "DESC" },
      take: 10,
    });

    return {
      total,
      pending,
      paid,
      totalRevenue: Number(revenueResult?.total || 0),
      recentOrders,
    };
  }

  async exportOrders() {
    return this.ordersRepository.find({
      relations: ["user", "items"],
      order: { createdAt: "DESC" },
    });
  }
}
