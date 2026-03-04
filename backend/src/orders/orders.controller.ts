import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { OrderStatus } from '../common/entities/order.entity';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private service: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  createOrder(@CurrentUser() user: any, @Body() dto: CreateOrderDto) {
    return this.service.createOrder(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-orders')
  getUserOrders(@CurrentUser() user: any) { return this.service.getUserOrders(user.sub); }

  @UseGuards(JwtAuthGuard)
  @Get('my-orders/:id')
  getOrder(@Param('id') id: string) { return this.service.getOrder(id); }

  @UseGuards(AdminJwtGuard)
  @Get('admin/all')
  getAllOrders(@Query('page') page: number, @Query('limit') limit: number, @Query('status') status?: OrderStatus) {
    return this.service.getAllOrders(page, limit, status);
  }

  @UseGuards(AdminJwtGuard)
  @Get('admin/stats')
  getStats() { return this.service.getDashboardStats(); }

  @UseGuards(AdminJwtGuard)
  @Get('admin/:id')
  getOrderAdmin(@Param('id') id: string) { return this.service.getOrder(id); }

  @UseGuards(AdminJwtGuard)
  @Put('admin/:id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: OrderStatus }) {
    return this.service.updateStatus(id, body.status);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/confirm-payment')
  confirmPayment(@Param('id') id: string, @Body() body: any) {
    return this.service.confirmPayment(id, body);
  }
}
