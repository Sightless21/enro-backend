import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CurrentUser } from '@/auth/decorator/current-user.decorator';
import { Roles } from '@/auth/decorator/roles.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Post()
  @Roles('STUDENT')
  create(@Body() data: CreateOrderDto, @CurrentUser('sub') userId: string) {
    return this.ordersService.create(userId, data);
  }
}
