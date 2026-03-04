import {
  Controller, Get, Post, Put, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: any) {
    return this.cartService.getCart(user.id);
  }

  @Post('add')
  addToCart(
    @CurrentUser() user: any,
    @Body() body: { productId: string; variantId?: string; quantity?: number },
  ) {
    return this.cartService.addToCart(user.id, body.productId, body.variantId, body.quantity);
  }

  @Put(':itemId')
  updateQuantity(
    @CurrentUser() user: any,
    @Param('itemId') itemId: string,
    @Body() body: { quantity: number },
  ) {
    return this.cartService.updateQuantity(user.id, itemId, body.quantity);
  }

  @Delete('clear')
  clearCart(@CurrentUser() user: any) {
    return this.cartService.clearCart(user.id);
  }

  @Delete(':itemId')
  removeFromCart(@CurrentUser() user: any, @Param('itemId') itemId: string) {
    return this.cartService.removeFromCart(user.id, itemId);
  }
}
