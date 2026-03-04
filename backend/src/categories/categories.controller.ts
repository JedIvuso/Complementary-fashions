import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';
import { Public } from '../common/decorators/public.decorator';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private service: CategoriesService) {}

  @Public()
  @Get()
  findAll() { return this.service.findAll(); }

  @UseGuards(AdminJwtGuard)
  @Get('admin/all')
  findAllAdmin() { return this.service.findAll(true); }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @UseGuards(AdminJwtGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/categories',
      filename: (_, file, cb) => cb(null, `${uuid()}${extname(file.originalname)}`),
    }),
  }))
  create(@Body() dto: CreateCategoryDto, @UploadedFile() file?: Express.Multer.File) {
    const imgUrl = file ? `/uploads/categories/${file.filename}` : undefined;
    return this.service.create(dto, imgUrl);
  }

  @UseGuards(AdminJwtGuard)
  @Put(':id')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/categories',
      filename: (_, file, cb) => cb(null, `${uuid()}${extname(file.originalname)}`),
    }),
  }))
  update(@Param('id') id: string, @Body() dto: CreateCategoryDto, @UploadedFile() file?: Express.Multer.File) {
    const imgUrl = file ? `/uploads/categories/${file.filename}` : undefined;
    return this.service.update(id, dto, imgUrl);
  }

  @UseGuards(AdminJwtGuard)
  @Delete(':id')
  delete(@Param('id') id: string) { return this.service.delete(id); }

  @UseGuards(AdminJwtGuard)
  @Put('reorder/bulk')
  reorder(@Body() body: { orders: { id: string; sortOrder: number }[] }) {
    return this.service.reorder(body.orders);
  }
}
