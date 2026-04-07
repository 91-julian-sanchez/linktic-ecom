import { Controller, Get, Post, Body, Inject, HttpException, HttpStatus, Headers } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { IsString, IsArray, ValidateNested, ArrayMinSize, IsEmail, IsNumber, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsEmail()
  customerEmail: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}

@Controller('orders')
export class OrdersController {
  constructor(@Inject('ORDERS_SERVICE') private readonly ordersClient: ClientProxy) {}

  @Get()
  async getOrders() {
    return firstValueFrom(this.ordersClient.send({ cmd: 'find_all_orders' }, {}));
  }

  @Post()
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Headers('Idempotency-Key') idempotencyKey?: string,
  ) {
    const payload = {
      ...createOrderDto,
      idempotencyKey,
    };

    const res: any = await firstValueFrom(this.ordersClient.send({ cmd: 'create_order' }, payload));
    if (res?.error) {
      throw new HttpException(res.error, HttpStatus.BAD_REQUEST);
    }
    return res;
  }
}
