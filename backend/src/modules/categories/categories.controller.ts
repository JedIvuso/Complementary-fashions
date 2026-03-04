import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@Query('includeProducts') includeProducts?: string) {
    return this.categoriesService.findAll(includeProducts === 'true');
  }

  @Get('admin')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  findAllAdmin() {
    return this.categoriesService.findAllAdmin();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  create(@Body() body: any) {
    return this.categoriesService.create(body);
  }

  @Put('reorder')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  reorder(@Body() body: { orders: { id: string; displayOrder: number }[] }) {
    return this.categoriesService.reorder(body.orders);
  }

  @Put(':id')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() body: any) {
    return this.categoriesService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  delete(@Param('id') id: string) {
    return this.categoriesService.delete(id);
  }
}
