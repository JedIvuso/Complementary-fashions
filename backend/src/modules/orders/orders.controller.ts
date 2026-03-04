import {
  Controller, Get, Post, Put, Body, Param, Query, UseGuards, Res,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OrderStatus } from './order.entity';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createOrder(@CurrentUser() user: any, @Body() body: any) {
    return this.ordersService.createOrder(user.id, body);
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMyOrders(@CurrentUser() user: any) {
    return this.ordersService.findUserOrders(user.id);
  }

  @Get('my-orders/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMyOrder(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Get()
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.ordersService.findAll({ page, limit, status });
  }

  @Get('export')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  async exportOrders(@Res() res: Response) {
    const orders = await this.ordersService.exportOrders();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');

    const headers = 'Order Number,Date,Customer,Email,Phone,Status,Total,Items\n';
    const rows = orders.map((o) =>
      `${o.orderNumber},${o.createdAt},${o.user?.firstName} ${o.user?.lastName},${o.deliveryEmail},${o.deliveryPhone},${o.status},${o.totalAmount},${o.items?.length || 0}`,
    ).join('\n');

    res.send(headers + rows);
  }

  @Get(':id')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Put(':id/status')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  updateStatus(@Param('id') id: string, @Body() body: { status: OrderStatus }) {
    return this.ordersService.updateStatus(id, body.status);
  }
}
