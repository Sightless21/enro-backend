import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CurrentUser } from '@/auth/decorator/current-user.decorator';
import { Roles } from '@/auth/decorator/roles.decorator';
import { Role } from '@prisma/client';
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(@CurrentUser('sub') userId: string) {
    return this.ordersService.findMyOrders(userId);
  }

  @Get(':id')
  @Roles('STUDENT', 'ADMIN')
  findOne(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.ordersService.findOne(id, userId, role === 'ADMIN');
  }

  @Post()
  @Roles('STUDENT')
  create(@Body() data: CreateOrderDto, @CurrentUser('sub') userId: string) {
    return this.ordersService.create(userId, data);
  }
}
