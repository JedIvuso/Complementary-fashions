import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';
import { Order, OrderStatus } from '../orders/order.entity';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin)
    private adminsRepository: Repository<Admin>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getDashboard() {
    const [totalProducts, totalUsers, totalOrders] = await Promise.all([
      this.productsRepository.count(),
      this.usersRepository.count(),
      this.ordersRepository.count(),
    ]);

    const revenueResult = await this.ordersRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'total')
      .where('order.status IN (:...statuses)', {
        statuses: [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.DELIVERED],
      })
      .getRawOne();

    const recentOrders = await this.ordersRepository.find({
      relations: ['user', 'items'],
      order: { createdAt: 'DESC' },
      take: 10,
    });

    const monthlySales = await this.ordersRepository
      .createQueryBuilder('order')
      .select("DATE_TRUNC('month', order.created_at)", 'month')
      .addSelect('SUM(order.totalAmount)', 'revenue')
      .addSelect('COUNT(order.id)', 'count')
      .where('order.status != :cancelled', { cancelled: OrderStatus.CANCELLED })
      .groupBy("DATE_TRUNC('month', order.created_at)")
      .orderBy('month', 'DESC')
      .limit(6)
      .getRawMany();

    const pendingOrders = await this.ordersRepository.count({
      where: { status: OrderStatus.PENDING },
    });

    return {
      stats: {
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue: Number(revenueResult?.total || 0),
        pendingOrders,
      },
      recentOrders,
      monthlySales,
    };
  }
}
