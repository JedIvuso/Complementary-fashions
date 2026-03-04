import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';

import { User } from '../users/user.entity';
import { Admin } from '../admins/admin.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Admin)
    private adminsRepository: Repository<Admin>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existing = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);
    const user = this.usersRepository.create({
      ...registerDto,
      password: hashedPassword,
    });
    await this.usersRepository.save(user);

    const token = this.generateToken(user.id, user.email, user.role);
    return { user: this.sanitizeUser(user), token };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('Account is blocked');

    const valid = await bcrypt.compare(loginDto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.generateToken(user.id, user.email, user.role);
    return { user: this.sanitizeUser(user), token };
  }

  async adminLogin(loginDto: LoginDto) {
    const admin = await this.adminsRepository.findOne({
      where: { email: loginDto.email },
    });
    if (!admin) throw new UnauthorizedException('Invalid credentials');
    if (!admin.isActive) throw new UnauthorizedException('Account is blocked');

    const valid = await bcrypt.compare(loginDto.password, admin.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.generateToken(admin.id, admin.email, admin.role, true);
    return { admin: this.sanitizeAdmin(admin), token };
  }

  async getProfile(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return this.sanitizeUser(user);
  }

  async getAdminProfile(adminId: string) {
    const admin = await this.adminsRepository.findOne({ where: { id: adminId } });
    if (!admin) throw new UnauthorizedException();
    return this.sanitizeAdmin(admin);
  }

  async updateThemePreference(userId: string, theme: string) {
    await this.usersRepository.update(userId, { themePreference: theme });
    return { message: 'Theme preference updated' };
  }

  private generateToken(id: string, email: string, role: string, isAdmin = false) {
    return this.jwtService.sign({
      sub: id,
      email,
      role,
      isAdmin,
    });
  }

  private sanitizeUser(user: User) {
    const { password, ...result } = user as any;
    return result;
  }

  private sanitizeAdmin(admin: Admin) {
    const { password, ...result } = admin as any;
    return result;
  }

  async validateUser(id: string) {
    return this.usersRepository.findOne({ where: { id } });
  }

  async validateAdmin(id: string) {
    return this.adminsRepository.findOne({ where: { id } });
  }

  async createDefaultAdmin() {
    const existing = await this.adminsRepository.findOne({
      where: { email: 'admin@complementaryfashions.com' },
    });
    if (!existing) {
      const hashedPassword = await bcrypt.hash('Admin@1234', 12);
      const admin = this.adminsRepository.create({
        firstName: 'Super',
        lastName: 'Admin',
        email: 'admin@complementaryfashions.com',
        password: hashedPassword,
        role: 'super_admin',
      });
      await this.adminsRepository.save(admin);
      console.log('Default admin created: admin@complementaryfashions.com / Admin@1234');
    }
  }
}
