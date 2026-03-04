import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private service: FavoritesService) {}

  @Get()
  getFavorites(@CurrentUser() user: any) { return this.service.getFavorites(user.sub); }

  @Post(':productId/toggle')
  toggle(@CurrentUser() user: any, @Param('productId') productId: string) {
    return this.service.toggle(user.sub, productId);
  }

  @Get(':productId/status')
  isFavorited(@CurrentUser() user: any, @Param('productId') productId: string) {
    return this.service.isFavorited(user.sub, productId);
  }
}
