import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { BannersService } from './banners.service';
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';
import { Public } from '../common/decorators/public.decorator';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

const storage = diskStorage({ destination: './uploads/banners', filename: (_, f, cb) => cb(null, `${uuid()}${extname(f.originalname)}`) });

@ApiTags('Banners')
@Controller('banners')
export class BannersController {
  constructor(private service: BannersService) {}

  @Public()
  @Get()
  findAll() { return this.service.findAll(); }

  @UseGuards(AdminJwtGuard)
  @Get('admin/all')
  findAllAdmin() { return this.service.findAll(false); }

  @UseGuards(AdminJwtGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image', { storage }))
  create(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    return this.service.create(body, `/uploads/banners/${file.filename}`);
  }

  @UseGuards(AdminJwtGuard)
  @Put(':id')
  @UseInterceptors(FileInterceptor('image', { storage }))
  update(@Param('id') id: string, @Body() body: any, @UploadedFile() file?: Express.Multer.File) {
    return this.service.update(id, body, file ? `/uploads/banners/${file.filename}` : undefined);
  }

  @UseGuards(AdminJwtGuard)
  @Delete(':id')
  delete(@Param('id') id: string) { return this.service.delete(id); }
}
