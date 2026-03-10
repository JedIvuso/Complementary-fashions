import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, MoreThanOrEqual } from "typeorm";
import { Order, OrderStatus } from "./order.entity";
import { OrderItem } from "./order-item.entity";
import { Product } from "../products/product.entity";
import { ProductVariant } from "../products/product-variant.entity";
import { MailService } from "../../mail/mail.service";

@Injectable()
export class PosService {
  constructor(
    @InjectRepository(Order) private ordersRepo: Repository<Order>,
    @InjectRepository(OrderItem) private itemsRepo: Repository<OrderItem>,
    @InjectRepository(Product) private productsRepo: Repository<Product>,
    @InjectRepository(ProductVariant)
    private variantsRepo: Repository<ProductVariant>,
    private mailService: MailService,
  ) {}

  async createPosOrder(dto: any, admin: any) {
    const {
      items,
      paymentMethod,
      customerName,
      customerPhone,
      customerEmail,
      discountType,
      discountValue,
      taxRate,
      cashTendered,
      notes,
    } = dto;

    if (!items?.length) throw new BadRequestException("No items in cart");

    // Validate stock for all items
    for (const item of items) {
      const product = await this.productsRepo.findOne({
        where: { id: item.productId },
        relations: ["variants"],
      });
      if (!product)
        throw new BadRequestException(`Product not found: ${item.productId}`);
      if (!product.isAvailable)
        throw new BadRequestException(`"${product.name}" is not available`);

      // If item has a size/color, validate variant stock
      if (item.selectedSize || item.selectedColor) {
        const variant = product.variants?.find(
          (v) =>
            (!item.selectedSize || v.size === item.selectedSize) &&
            (!item.selectedColor || v.color === item.selectedColor),
        );
        if (variant && variant.stockQuantity < item.quantity) {
          throw new BadRequestException(
            `Only ${variant.stockQuantity} unit(s) of "${product.name}" (${item.selectedSize || ""}${item.selectedColor ? " · " + item.selectedColor : ""}) available`,
          );
        }
      } else if (product.stockQuantity < item.quantity) {
        throw new BadRequestException(
          `Only ${product.stockQuantity} unit(s) of "${product.name}" available`,
        );
      }
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems: Partial<OrderItem>[] = [];

    for (const item of items) {
      const product = await this.productsRepo.findOne({
        where: { id: item.productId },
      });
      const unitPrice = Number(item.unitPrice || product.price);
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;
      orderItems.push({
        productId: item.productId,
        productName: item.productName || product.name,
        unitPrice,
        quantity: item.quantity,
        totalPrice,
        selectedSize: item.selectedSize || null,
        selectedColor: item.selectedColor || null,
      });
    }

    // Discount
    let discountAmount = 0;
    if (discountType === "percentage" && discountValue > 0) {
      discountAmount = (subtotal * discountValue) / 100;
    } else if (discountType === "fixed" && discountValue > 0) {
      discountAmount = Math.min(discountValue, subtotal);
    }

    const afterDiscount = subtotal - discountAmount;
    const taxAmount = taxRate > 0 ? (afterDiscount * taxRate) / 100 : 0;
    const totalAmount = afterDiscount + taxAmount;
    const changeGiven = cashTendered
      ? Math.max(0, cashTendered - totalAmount)
      : 0;

    // Generate order number
    const count = await this.ordersRepo.count();
    const orderNumber = `POS-${String(count + 1).padStart(6, "0")}`;

    const order = this.ordersRepo.create({
      orderNumber,
      userId: null, // POS orders are not linked to a customer user account
      status: OrderStatus.PAID,
      orderType: "pos",
      subtotal,
      deliveryFee: 0,
      discountAmount,
      discountType: discountType || null,
      discountValue: discountValue || 0,
      taxAmount,
      totalAmount,
      cashTendered: cashTendered || null,
      changeGiven: changeGiven || null,
      selectedPaymentMethod: paymentMethod,
      // POS customer info
      posCustomerName: customerName || "Walk-in Customer",
      posCustomerPhone: customerPhone || "",
      posCustomerEmail: customerEmail || "",
      // Delivery fields (required by entity — use POS defaults)
      deliveryFullName: customerName || "Walk-in Customer",
      deliveryPhone: customerPhone || "",
      deliveryEmail: customerEmail || "",
      deliveryAddress: "In-Store",
      deliveryCity: "In-Store",
      notes: notes || "",
      processedById: admin.id,
      processedByName: `${admin.firstName} ${admin.lastName}`,
    });

    const savedOrder = await this.ordersRepo.save(order);

    // Save items and update stock
    for (const item of orderItems) {
      const oi = this.itemsRepo.create({ ...item, orderId: savedOrder.id });
      await this.itemsRepo.save(oi);

      // Decrement variant stock if item has size/color
      if (item.selectedSize || item.selectedColor) {
        const variant = await this.variantsRepo.findOne({
          where: {
            productId: item.productId,
            ...(item.selectedSize ? { size: item.selectedSize } : {}),
            ...(item.selectedColor ? { color: item.selectedColor } : {}),
          },
        });
        if (variant) {
          await this.variantsRepo
            .createQueryBuilder()
            .update()
            .set({
              stockQuantity: () =>
                `GREATEST(stock_quantity - ${item.quantity}, 0)`,
            })
            .where("id = :id", { id: variant.id })
            .execute();
        }
      }

      // Decrement product-level stock
      await this.productsRepo
        .createQueryBuilder()
        .update()
        .set({
          stockQuantity: () => `GREATEST(stock_quantity - ${item.quantity}, 0)`,
        })
        .where("id = :id", { id: item.productId })
        .execute();

      await this.productsRepo
        .createQueryBuilder()
        .update()
        .set({ soldCount: () => `sold_count + ${item.quantity}` })
        .where("id = :id", { id: item.productId })
        .execute();

      // Auto-mark unavailable if product-level stock hits 0
      await this.productsRepo
        .createQueryBuilder()
        .update()
        .set({ isAvailable: false })
        .where("id = :id AND stock_quantity <= 0", { id: item.productId })
        .execute();
    }

    // Load full order for receipt
    const fullOrder = await this.ordersRepo.findOne({
      where: { id: savedOrder.id },
      relations: ["items", "items.product"],
    });

    // Email receipt if customer email provided
    if (customerEmail) {
      this.mailService.sendOrderConfirmation(fullOrder).catch(() => {});
    }

    return fullOrder;
  }

  async getAnalytics(period: string = "today") {
    const now = new Date();
    let startDate: Date;

    if (period === "today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === "week") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      startDate = new Date(now.getFullYear(), 0, 1); // year
    }

    const [totalOrders, posOrders, onlineOrders] = await Promise.all([
      this.ordersRepo.count({
        where: {
          createdAt: MoreThanOrEqual(startDate),
          status: OrderStatus.PAID,
        },
      }),
      this.ordersRepo.count({
        where: {
          createdAt: MoreThanOrEqual(startDate),
          orderType: "pos",
          status: OrderStatus.PAID,
        },
      }),
      this.ordersRepo.count({
        where: {
          createdAt: MoreThanOrEqual(startDate),
          orderType: "online",
          status: OrderStatus.PAID,
        },
      }),
    ]);

    const revenueResult = await this.ordersRepo
      .createQueryBuilder("o")
      .select("SUM(o.total_amount)", "total")
      .addSelect(
        `SUM(CASE WHEN o.order_type = 'pos' THEN o.total_amount ELSE 0 END)`,
        "pos",
      )
      .addSelect(
        `SUM(CASE WHEN o.order_type = 'online' THEN o.total_amount ELSE 0 END)`,
        "online",
      )
      .where("o.created_at >= :startDate", { startDate })
      .andWhere("o.status = :status", { status: OrderStatus.PAID })
      .getRawOne();

    // Daily chart data (last 30 days)
    const dailyData = await this.ordersRepo
      .createQueryBuilder("o")
      .select(`DATE(o.created_at)`, "date")
      .addSelect("SUM(o.total_amount)", "revenue")
      .addSelect("COUNT(o.id)", "orders")
      .where("o.created_at >= :start", {
        start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      })
      .andWhere("o.status = :status", { status: OrderStatus.PAID })
      .groupBy("DATE(o.created_at)")
      .orderBy("DATE(o.created_at)", "ASC")
      .getRawMany();

    // Top products
    const topProducts = await this.itemsRepo
      .createQueryBuilder("oi")
      .select("oi.product_name", "name")
      .addSelect("SUM(oi.quantity)", "sold")
      .addSelect("SUM(oi.total_price)", "revenue")
      .innerJoin("oi.order", "o")
      .where("o.created_at >= :startDate", { startDate })
      .andWhere("o.status = :status", { status: OrderStatus.PAID })
      .groupBy("oi.product_name")
      .orderBy("SUM(oi.quantity)", "DESC")
      .limit(10)
      .getRawMany();

    // Staff performance
    const staffStats = await this.ordersRepo
      .createQueryBuilder("o")
      .select("o.processed_by_name", "staffName")
      .addSelect("COUNT(o.id)", "transactions")
      .addSelect("SUM(o.total_amount)", "revenue")
      .where("o.order_type = :type", { type: "pos" })
      .andWhere("o.created_at >= :startDate", { startDate })
      .andWhere("o.status = :status", { status: OrderStatus.PAID })
      .andWhere("o.processed_by_name IS NOT NULL")
      .groupBy("o.processed_by_name")
      .orderBy("SUM(o.total_amount)", "DESC")
      .getRawMany();

    // Low stock products
    const lowStock = await this.productsRepo
      .createQueryBuilder("p")
      .where("p.stock_quantity <= 5")
      .orderBy("p.stock_quantity", "ASC")
      .limit(10)
      .getMany();

    return {
      summary: {
        totalOrders,
        posOrders,
        onlineOrders,
        totalRevenue: Number(revenueResult?.total || 0),
        posRevenue: Number(revenueResult?.pos || 0),
        onlineRevenue: Number(revenueResult?.online || 0),
      },
      dailyChart: dailyData.map((d) => ({
        date: d.date,
        revenue: Number(d.revenue || 0),
        orders: Number(d.orders || 0),
      })),
      topProducts: topProducts.map((p) => ({
        name: p.name,
        sold: Number(p.sold || 0),
        revenue: Number(p.revenue || 0),
      })),
      staffStats: staffStats.map((s) => ({
        staffName: s.staffName,
        transactions: Number(s.transactions || 0),
        revenue: Number(s.revenue || 0),
      })),
      lowStock: lowStock.map((p) => ({
        id: p.id,
        name: p.name,
        stockQuantity: p.stockQuantity,
        isAvailable: p.isAvailable,
      })),
    };
  }

  async getReport(type: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const qb = this.ordersRepo
      .createQueryBuilder("o")
      .leftJoinAndSelect("o.items", "items")
      .where("o.created_at BETWEEN :start AND :end", { start, end })
      .andWhere("o.status = :status", { status: OrderStatus.PAID });

    if (type === "pos") qb.andWhere("o.order_type = :type", { type: "pos" });
    if (type === "online")
      qb.andWhere("o.order_type = :type", { type: "online" });

    const orders = await qb.orderBy("o.created_at", "DESC").getMany();

    return {
      type,
      startDate,
      endDate,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((s, o) => s + Number(o.totalAmount), 0),
      orders: orders.map((o) => ({
        orderNumber: o.orderNumber,
        orderType: o.orderType,
        date: o.createdAt,
        customer:
          o.orderType === "pos" ? o.posCustomerName : o.deliveryFullName,
        items: o.items?.length || 0,
        paymentMethod: o.selectedPaymentMethod,
        discount: Number(o.discountAmount || 0),
        total: Number(o.totalAmount),
        processedBy: o.processedByName || "Online",
      })),
    };
  }

  async getCashDrawer(date: string) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const cashOrders = await this.ordersRepo.find({
      where: {
        orderType: "pos",
        selectedPaymentMethod: "cash",
        status: OrderStatus.PAID,
        createdAt: Between(start, end),
      },
    });

    const totalCash = cashOrders.reduce((s, o) => s + Number(o.totalAmount), 0);
    const totalTendered = cashOrders.reduce(
      (s, o) => s + Number(o.cashTendered || 0),
      0,
    );
    const totalChange = cashOrders.reduce(
      (s, o) => s + Number(o.changeGiven || 0),
      0,
    );

    return {
      date,
      transactions: cashOrders.length,
      totalCashSales: totalCash,
      totalTendered,
      totalChange,
      orders: cashOrders.map((o) => ({
        orderNumber: o.orderNumber,
        time: o.createdAt,
        total: Number(o.totalAmount),
        tendered: Number(o.cashTendered || 0),
        change: Number(o.changeGiven || 0),
        processedBy: o.processedByName,
      })),
    };
  }
}
