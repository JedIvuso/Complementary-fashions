import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteSettings } from '../common/entities/site-settings.entity';
import { User } from '../common/entities/user.entity';
import { Product } from '../common/entities/product.entity';
import { Category } from '../common/entities/category.entity';
import { Order } from '../common/entities/order.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(SiteSettings) private settingsRepo: Repository<SiteSettings>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
  ) {}

  async getDashboard() {
    const [totalProducts, totalCategories, totalUsers, totalOrders] = await Promise.all([
      this.productRepo.count(),
      this.categoryRepo.count(),
      this.userRepo.count(),
      this.orderRepo.count(),
    ]);
    const revenue = await this.orderRepo.createQueryBuilder('o').select('SUM(o.total)', 'sum').getRawOne();
    const recentOrders = await this.orderRepo.find({ relations: ['user'], order: { createdAt: 'DESC' }, take: 10 });
    return { totalProducts, totalCategories, totalUsers, totalOrders, totalRevenue: revenue?.sum || 0, recentOrders };
  }

  async getSettings() {
    let settings = await this.settingsRepo.findOne({ where: {} });
    if (!settings) { settings = this.settingsRepo.create(); await this.settingsRepo.save(settings); }
    return settings;
  }

  async updateSettings(data: Partial<SiteSettings>, logoUrl?: string, faviconUrl?: string) {
    let settings = await this.getSettings();
    Object.assign(settings, data);
    if (logoUrl) settings.logoUrl = logoUrl;
    if (faviconUrl) settings.faviconUrl = faviconUrl;
    return this.settingsRepo.save(settings);
  }

  async getUsers(page = 1, limit = 20) {
    const [users, total] = await this.userRepo.findAndCount({ skip: (page-1)*limit, take: limit, order: { createdAt: 'DESC' } });
    return { users, total, page, limit };
  }

  async toggleUserBlock(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return null;
    user.isBlocked = !user.isBlocked;
    return this.userRepo.save(user);
  }
}
