import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private service: CartService) {}

  @Get()
  getCart(@CurrentUser() user: any) { return this.service.getCart(user.sub); }

  @Post('items')
  addItem(@CurrentUser() user: any, @Body() body: { productId: string; variantId?: string; quantity?: number }) {
    return this.service.addItem(user.sub, body.productId, body.variantId, body.quantity);
  }

  @Put('items/:id')
  updateQuantity(@CurrentUser() user: any, @Param('id') id: string, @Body() body: { quantity: number }) {
    return this.service.updateQuantity(user.sub, id, body.quantity);
  }

  @Delete('items/:id')
  removeItem(@CurrentUser() user: any, @Param('id') id: string) {
    return this.service.removeItem(user.sub, id);
  }

  @Delete()
  clearCart(@CurrentUser() user: any) { return this.service.clearCart(user.sub); }
}
