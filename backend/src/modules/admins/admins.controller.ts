import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminsService } from './admins.service';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';

@ApiTags('Admin Dashboard')
@Controller('admin')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth()
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminsService.getDashboard();
  }
}
