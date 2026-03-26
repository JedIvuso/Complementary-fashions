import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  Patch,
  Req,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { AdminAuthGuard } from "../../common/guards/admin-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { LoginLogService } from "../login-log/login-log.service";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly loginLogService: LoginLogService,
  ) {}

  @Post("register")
  register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post("login")
  async login(@Body() body: any, @Req() req: any) {
    try {
      const result = await this.authService.login(body);
      this.loginLogService.log({
        email: body.email,
        userType: "customer",
        fullName: `${result.user.firstName} ${result.user.lastName}`,
        success: true,
        ipAddress: req.ip || req.headers["x-forwarded-for"],
        userAgent: req.headers["user-agent"],
      });
      return result;
    } catch (err) {
      this.loginLogService.log({
        email: body.email,
        userType: "customer",
        success: false,
        failureReason: err.message,
        ipAddress: req.ip || req.headers["x-forwarded-for"],
        userAgent: req.headers["user-agent"],
      });
      throw err;
    }
  }

  @Post("admin/login")
  async adminLogin(@Body() body: any, @Req() req: any) {
    try {
      const result = await this.authService.adminLogin(body);
      this.loginLogService.log({
        email: body.email,
        userType: "admin",
        fullName: `${result.admin.firstName} ${result.admin.lastName}`,
        success: true,
        ipAddress: req.ip || req.headers["x-forwarded-for"],
        userAgent: req.headers["user-agent"],
      });
      return result;
    } catch (err) {
      this.loginLogService.log({
        email: body.email,
        userType: "admin",
        success: false,
        failureReason: err.message,
        ipAddress: req.ip || req.headers["x-forwarded-for"],
        userAgent: req.headers["user-agent"],
      });
      throw err;
    }
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getProfile(@CurrentUser() user: any) {
    return this.authService.getProfile(user.sub);
  }

  @Get("admin/me")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  getAdminProfile(@CurrentUser() admin: any) {
    return this.authService.getAdminProfile(admin.sub);
  }

  @Put("profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateProfile(@CurrentUser() user: any, @Body() body: any) {
    return this.authService.updateUserProfile(user.sub, body);
  }

  @Put("admin/profile")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  updateAdminProfile(@CurrentUser() admin: any, @Body() body: any) {
    return this.authService.updateAdminProfile(admin.sub, body);
  }

  @Post("forgot-password")
  forgotPassword(@Body() body: { email: string }) {
    return this.authService.generateUserResetToken(body.email);
  }

  @Post("reset-password")
  resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.authService.resetUserPassword(body.token, body.newPassword);
  }

  @Post("admin/forgot-password")
  adminForgotPassword(@Body() body: { email: string }) {
    return this.authService.generateAdminResetToken(body.email);
  }

  @Post("admin/reset-password")
  adminResetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.authService.resetAdminPassword(body.token, body.newPassword);
  }

  @Patch("theme")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateTheme(@CurrentUser() user: any, @Body() body: { theme: string }) {
    return this.authService.updateThemePreference(user.sub, body.theme);
  }
}
