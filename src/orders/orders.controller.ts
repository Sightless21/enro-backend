import { Controller, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

  // @Post()
  // createOrder() {
  //   return this.orderService.createOrder('studentId', 'courseId');
  // }
}
