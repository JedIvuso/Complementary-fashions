import { Controller, Get, Put, Body, Param, Query, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';
import { Public } from '../common/decorators/public.decorator';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

const storage = diskStorage({ destination: './uploads/settings', filename: (_, f, cb) => cb(null, `${uuid()}${extname(f.originalname)}`) });

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard)
@Controller('admin')
export class AdminController {
  constructor(private service: AdminService) {}

  @Get('dashboard')
  getDashboard() { return this.service.getDashboard(); }

  @Public()
  @Get('settings')
  getSettings() { return this.service.getSettings(); }

  @Put('settings')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 },
  ], { storage }))
  updateSettings(@Body() body: any, @UploadedFiles() files: any) {
    const logoUrl = files?.logo?.[0] ? `/uploads/settings/${files.logo[0].filename}` : undefined;
    const faviconUrl = files?.favicon?.[0] ? `/uploads/settings/${files.favicon[0].filename}` : undefined;
    return this.service.updateSettings(body, logoUrl, faviconUrl);
  }

  @Get('users')
  getUsers(@Query('page') page: number, @Query('limit') limit: number) {
    return this.service.getUsers(page, limit);
  }

  @Put('users/:id/toggle-block')
  toggleBlock(@Param('id') id: string) { return this.service.toggleUserBlock(id); }
}
