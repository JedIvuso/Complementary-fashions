import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(page = 1, limit = 20) {
    const [data, total] = await this.usersRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      select: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'isActive', 'createdAt'],
    });
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'address', 'isActive', 'createdAt'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async toggleBlock(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.isActive = !user.isActive;
    await this.usersRepository.save(user);
    return { message: user.isActive ? 'User unblocked' : 'User blocked', isActive: user.isActive };
  }

  async getDashboardCount() {
    return this.usersRepository.count();
  }

  async updateProfile(userId: string, data: any) {
    const { password, role, ...safeData } = data;
    await this.usersRepository.update(userId, safeData);
    return this.findOne(userId);
  }
}
