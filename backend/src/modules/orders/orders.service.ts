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
import { Admin } from "../admins/admin.entity";
import { MailService } from "../../mail/mail.service";

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
    @InjectRepository(Admin)
    private adminsRepository: Repository<Admin>,
    private mailService: MailService,
  ) {}

  async createOrder(userId: string, deliveryDetails: any) {
    const cartItems = await this.cartRepository.find({
      where: { userId },
      relations: ["product", "variant"],
    });

    if (!cartItems.length) {
      throw new BadRequestException("Cart is empty");
    }

    // Validate stock availability for all items before creating order
    for (const item of cartItems) {
      if (!item.product)
        throw new BadRequestException(
          "A product in your cart is no longer available",
        );
      if (!item.product.isAvailable || item.product.stockQuantity <= 0) {
        throw new BadRequestException(`"${item.product.name}" is out of stock`);
      }
      if (item.quantity > item.product.stockQuantity) {
        throw new BadRequestException(
          `Only ${item.product.stockQuantity} unit(s) of "${item.product.name}" are available`,
        );
      }
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

    // Reduce stock for each product/variant
    for (const item of cartItems) {
      if (item.variantId && item.variant) {
        await this.productsRepository.manager
          .getRepository("product_variants")
          .decrement({ id: item.variantId }, "stockQuantity", item.quantity);
      }
      // Always reduce the product-level stock too
      // Decrement stock but never go below 0
      await this.productsRepository
        .createQueryBuilder()
        .update()
        .set({
          stockQuantity: () => `GREATEST(stock_quantity - ${item.quantity}, 0)`,
        })
        .where("id = :id", { id: item.productId })
        .execute();
      // Auto-mark as unavailable if stock hits 0
      await this.productsRepository
        .createQueryBuilder()
        .update()
        .set({ isAvailable: false })
        .where("id = :id AND stock_quantity <= 0", { id: item.productId })
        .execute();
      await this.productsRepository.increment(
        { id: item.productId },
        "soldCount",
        item.quantity,
      );
    }

    await this.cartRepository.delete({ userId });

    // Load full order for emails
    const fullOrder = await this.findOne(savedOrder.id);

    // Send order confirmation to customer (non-blocking)
    this.mailService.sendOrderConfirmation(fullOrder).catch(() => {});

    // Notify all admins
    const admins = await this.adminsRepository.find({
      where: { isActive: true },
    });
    for (const admin of admins) {
      this.mailService
        .sendAdminNewOrderNotification(fullOrder, admin.email)
        .catch(() => {});
    }

    return fullOrder;
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
    const saved = await this.ordersRepository.save(order);
    // Send status update email to customer (non-blocking)
    this.mailService.sendOrderStatusUpdate(saved, status).catch(() => {});
    return saved;
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

  async updatePaymentMethod(
    orderId: string,
    userId: string,
    paymentMethod: string,
  ) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId, userId },
    });
    if (!order) throw new Error("Order not found");
    if (order.status !== "pending")
      throw new Error("Cannot update payment method for this order");
    await this.ordersRepository.update(orderId, {
      selectedPaymentMethod: paymentMethod,
    });
    return { success: true };
  }

  async exportOrders() {
    return this.ordersRepository.find({
      relations: ["user", "items"],
      order: { createdAt: "DESC" },
    });
  }
}
