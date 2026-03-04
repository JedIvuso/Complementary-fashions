import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';
import { Public } from '../common/decorators/public.decorator';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

const storage = diskStorage({
  destination: './uploads/products',
  filename: (_, file, cb) => cb(null, `${uuid()}${extname(file.originalname)}`),
});

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private service: ProductsService) {}

  @Public()
  @Get()
  findAll(@Query() query: ProductQueryDto) { return this.service.findAll(query); }

  @Public()
  @Get('featured')
  getFeatured() { return this.service.getFeatured(); }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Public()
  @Get(':id/related')
  findRelated(@Param('id') id: string) { return this.service.findRelated(id); }

  @UseGuards(AdminJwtGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('images', 10, { storage }))
  create(@Body() dto: CreateProductDto, @UploadedFiles() files?: Express.Multer.File[]) {
    return this.service.create(dto, files);
  }

  @UseGuards(AdminJwtGuard)
  @Put(':id')
  @UseInterceptors(FilesInterceptor('images', 10, { storage }))
  update(@Param('id') id: string, @Body() dto: CreateProductDto, @UploadedFiles() files?: Express.Multer.File[]) {
    return this.service.update(id, dto, files);
  }

  @UseGuards(AdminJwtGuard)
  @Delete(':id')
  delete(@Param('id') id: string) { return this.service.delete(id); }

  @UseGuards(AdminJwtGuard)
  @Delete(':productId/images/:imageId')
  deleteImage(@Param('productId') productId: string, @Param('imageId') imageId: string) {
    return this.service.deleteImage(productId, imageId);
  }
}
