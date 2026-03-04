import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BrandingService } from './branding.service';
import { AdminJwtGuard } from '../auth/guards/admin-jwt.guard';

@ApiTags('Branding')
@Controller('branding')
export class BrandingController {
  constructor(private brandingService: BrandingService) {}

  @Get()
  get() {
    return this.brandingService.get();
  }

  @Put()
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  update(@Body() dto: any) {
    return this.brandingService.update(dto);
  }
}
