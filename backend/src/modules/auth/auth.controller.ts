import {
  Controller, Post, Get, Body, UseGuards, Request, Patch,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('admin/login')
  adminLogin(@Body() loginDto: LoginDto) {
    return this.authService.adminLogin(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getProfile(@CurrentUser() user: any) {
    return this.authService.getProfile(user.id);
  }

  @Get('admin/me')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  getAdminProfile(@CurrentUser() admin: any) {
    return this.authService.getAdminProfile(admin.id);
  }

  @Patch('theme')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateTheme(@CurrentUser() user: any, @Body() body: { theme: string }) {
    return this.authService.updateThemePreference(user.id, body.theme);
  }
}
