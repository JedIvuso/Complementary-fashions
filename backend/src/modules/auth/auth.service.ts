import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { ConfigService } from "@nestjs/config";
import { User } from "../users/user.entity";
import { Admin } from "../admins/admin.entity";
import { MailService } from "../../mail/mail.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Admin) private adminsRepository: Repository<Admin>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existing = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existing) throw new ConflictException("Email already registered");
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);
    const user = this.usersRepository.create({
      ...registerDto,
      password: hashedPassword,
    });
    await this.usersRepository.save(user);
    // Send welcome email (non-blocking)
    this.mailService
      .sendWelcomeEmail(user.email, user.firstName)
      .catch(() => {});
    const token = this.generateUserToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
    });
    if (!user) throw new UnauthorizedException("Invalid credentials");
    if (!user.isActive) throw new UnauthorizedException("Account is blocked");
    const valid = await bcrypt.compare(loginDto.password, user.password);
    if (!valid) throw new UnauthorizedException("Invalid credentials");
    const token = this.generateUserToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  async adminLogin(loginDto: LoginDto) {
    const admin = await this.adminsRepository.findOne({
      where: { email: loginDto.email },
    });
    if (!admin) throw new UnauthorizedException("Invalid credentials");
    if (!admin.isActive) throw new UnauthorizedException("Account is blocked");
    const valid = await bcrypt.compare(loginDto.password, admin.password);
    if (!valid) throw new UnauthorizedException("Invalid credentials");
    const token = this.generateAdminToken(admin);
    return { admin: this.sanitizeAdmin(admin), token };
  }

  async getProfile(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return this.sanitizeUser(user);
  }

  async getAdminProfile(adminId: string) {
    const admin = await this.adminsRepository.findOne({
      where: { id: adminId },
    });
    if (!admin) throw new UnauthorizedException();
    return this.sanitizeAdmin(admin);
  }

  async updateUserProfile(userId: string, data: any) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    if (data.email && data.email !== user.email) {
      const existing = await this.usersRepository.findOne({
        where: { email: data.email },
      });
      if (existing) throw new ConflictException("Email already in use");
    }

    if (data.currentPassword && data.newPassword) {
      const valid = await bcrypt.compare(data.currentPassword, user.password);
      if (!valid)
        throw new BadRequestException("Current password is incorrect");
      user.password = await bcrypt.hash(data.newPassword, 12);
    }

    if (data.firstName) user.firstName = data.firstName;
    if (data.lastName) user.lastName = data.lastName;
    if (data.email) user.email = data.email;
    if (data.phoneNumber !== undefined) user.phoneNumber = data.phoneNumber;
    if (data.address !== undefined) user.address = data.address;

    await this.usersRepository.save(user);
    return {
      user: this.sanitizeUser(user),
      message: "Profile updated successfully",
    };
  }

  async updateAdminProfile(adminId: string, data: any) {
    const admin = await this.adminsRepository.findOne({
      where: { id: adminId },
    });
    if (!admin) throw new NotFoundException("Admin not found");

    if (data.email && data.email !== admin.email) {
      const existing = await this.adminsRepository.findOne({
        where: { email: data.email },
      });
      if (existing) throw new ConflictException("Email already in use");
    }

    if (data.currentPassword && data.newPassword) {
      const valid = await bcrypt.compare(data.currentPassword, admin.password);
      if (!valid)
        throw new BadRequestException("Current password is incorrect");
      admin.password = await bcrypt.hash(data.newPassword, 12);
    }

    if (data.firstName) admin.firstName = data.firstName;
    if (data.lastName) admin.lastName = data.lastName;
    if (data.email) admin.email = data.email;

    await this.adminsRepository.save(admin);
    return {
      admin: this.sanitizeAdmin(admin),
      message: "Profile updated successfully",
    };
  }

  // Password reset token generation (no email — token returned directly for now)
  async generateUserResetToken(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException("No account found with that email");
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await this.usersRepository.save(user);
    // Send password reset email
    await this.mailService.sendPasswordResetEmail(
      user.email,
      user.firstName,
      token,
    );
    return {
      message: "Password reset instructions have been sent to your email.",
    };
  }

  async resetUserPassword(token: string, newPassword: string) {
    const user = await this.usersRepository.findOne({
      where: { resetToken: token },
    });
    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      throw new BadRequestException("Invalid or expired reset token");
    }
    user.password = await bcrypt.hash(newPassword, 12);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await this.usersRepository.save(user);
    return { message: "Password reset successfully" };
  }

  async generateAdminResetToken(email: string) {
    const admin = await this.adminsRepository.findOne({ where: { email } });
    if (!admin)
      throw new NotFoundException("No admin account found with that email");
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000);
    admin.resetToken = token;
    admin.resetTokenExpiry = expiry;
    await this.adminsRepository.save(admin);
    return {
      token,
      message: "Use this token to reset your password. Valid for 1 hour.",
    };
  }

  async resetAdminPassword(token: string, newPassword: string) {
    const admin = await this.adminsRepository.findOne({
      where: { resetToken: token },
    });
    if (
      !admin ||
      !admin.resetTokenExpiry ||
      admin.resetTokenExpiry < new Date()
    ) {
      throw new BadRequestException("Invalid or expired reset token");
    }
    admin.password = await bcrypt.hash(newPassword, 12);
    admin.resetToken = null;
    admin.resetTokenExpiry = null;
    await this.adminsRepository.save(admin);
    return { message: "Password reset successfully" };
  }

  async updateThemePreference(userId: string, theme: string) {
    await this.usersRepository.update(userId, { themePreference: theme });
    return { message: "Theme preference updated" };
  }

  private generateUserToken(user: User) {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      isAdmin: false,
    });
  }

  private generateAdminToken(admin: Admin) {
    return this.jwtService.sign({
      sub: admin.id,
      email: admin.email,
      role: admin.role,
      isAdmin: true,
    });
  }

  private sanitizeUser(user: User) {
    const { password, resetToken, resetTokenExpiry, ...result } = user as any;
    return result;
  }

  private sanitizeAdmin(admin: Admin) {
    const { password, resetToken, resetTokenExpiry, ...result } = admin as any;
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
      where: { email: "admin@complementaryfashions.com" },
    });
    if (!existing) {
      const hashedPassword = await bcrypt.hash("Admin@1234", 12);
      const admin = this.adminsRepository.create({
        firstName: "Super",
        lastName: "Admin",
        email: "admin@complementaryfashions.com",
        password: hashedPassword,
        role: "super_admin",
      });
      await this.adminsRepository.save(admin);
      console.log(
        "Default admin created: admin@complementaryfashions.com / Admin@1234",
      );
    }
  }
}
