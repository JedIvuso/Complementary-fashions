import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BannersService } from './banners.service';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';

@ApiTags('Banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  findAll() {
    return this.bannersService.findAll();
  }

  @Get('admin')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  findAllAdmin() {
    return this.bannersService.findAllAdmin();
  }

  @Post()
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  create(@Body() body: any) {
    return this.bannersService.create(body);
  }

  @Put(':id')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() body: any) {
    return this.bannersService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  delete(@Param('id') id: string) {
    return this.bannersService.delete(id);
  }
}
