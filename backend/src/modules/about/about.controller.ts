import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AboutService } from './about.service';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';

@ApiTags('About')
@Controller('about')
export class AboutController {
  constructor(private readonly aboutService: AboutService) {}

  @Get()
  getContent() {
    return this.aboutService.getContent();
  }

  @Put()
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  updateContent(@Body() body: any) {
    return this.aboutService.updateContent(body);
  }
}
