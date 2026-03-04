import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  getFavorites(@CurrentUser() user: any) {
    return this.favoritesService.getFavorites(user.id);
  }

  @Post(':productId/toggle')
  toggle(@CurrentUser() user: any, @Param('productId') productId: string) {
    return this.favoritesService.toggle(user.id, productId);
  }

  @Get(':productId/status')
  isFavorited(@CurrentUser() user: any, @Param('productId') productId: string) {
    return this.favoritesService.isFavorited(user.id, productId);
  }
}
