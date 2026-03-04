// users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

export { UsersService };

@Injectable()
class UsersService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async findAll(query: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 20, search } = query;
    const qb = this.userRepo.createQueryBuilder('u')
      .leftJoinAndSelect('u.orders', 'orders');

    if (search) qb.andWhere('(u.email ILIKE :s OR u.firstName ILIKE :s OR u.lastName ILIKE :s)', { s: `%${search}%` });
    qb.orderBy('u.createdAt', 'DESC').skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data: data.map(u => { const { password, refreshToken, ...rest } = u as any; return rest; }), total };
  }

  async findOne(id: string) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['orders'],
    });
    if (!user) throw new NotFoundException('User not found');
    const { password, refreshToken, ...rest } = user as any;
    return rest;
  }

  async toggleBlock(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.isBlocked = !user.isBlocked;
    await this.userRepo.save(user);
    return { message: `User ${user.isBlocked ? 'blocked' : 'unblocked'}`, isBlocked: user.isBlocked };
  }

  async getCount() {
    return this.userRepo.count();
  }

  async updateProfile(id: string, dto: { firstName?: string; lastName?: string; phone?: string }) {
    await this.userRepo.update(id, dto);
    return this.findOne(id);
  }
}
