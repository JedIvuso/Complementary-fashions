import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AboutService } from './about.service';
import { AdminJwtGuard } from '../auth/guards/admin-jwt.guard';

@ApiTags('About')
@Controller('about')
export class AboutController {
  constructor(private aboutService: AboutService) {}

  @Get()
  get() {
    return this.aboutService.get();
  }

  @Put()
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  update(@Body() dto: any) {
    return this.aboutService.update(dto);
  }
}
