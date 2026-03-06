import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  Patch,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { AdminAuthGuard } from "../../common/guards/admin-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post("login")
  login(@Body() body: any) {
    return this.authService.login(body);
  }

  @Post("admin/login")
  adminLogin(@Body() body: any) {
    return this.authService.adminLogin(body);
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
