import { Controller, Get, Post, Body, Inject, HttpException, HttpStatus, Headers } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { IsString, IsArray, ValidateNested, ArrayMinSize, IsEmail, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty, ApiHeader } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'Product UUID' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  customerEmail: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}

export class OrderItemResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  productId: string;

  @ApiProperty({ example: 'MacBook Air 13" (M1)' })
  productName: string;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: '999.00' })
  unitPrice: string;
}

export class OrderResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  customerEmail: string;

  @ApiProperty({ example: '1998.00' })
  totalAmount: string;

  @ApiProperty({ example: 'COMPLETED', enum: ['PENDING', 'COMPLETED', 'CANCELLED'] })
  status: string;

  @ApiProperty({ example: 'uuid-idempotency-key', nullable: true })
  idempotencyKey: string;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt: string;
}

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(@Inject('ORDERS_SERVICE') private readonly ordersClient: ClientProxy) {}

  @Get()
  @ApiOperation({ summary: 'List all orders', description: 'Returns all orders with their line items.' })
  @ApiResponse({ status: 200, description: 'Array of orders', type: [OrderResponseDto] })
  async getOrders() {
    return firstValueFrom(this.ordersClient.send({ cmd: 'find_all_orders' }, {}));
  }

  @Post()
  @ApiOperation({
    summary: 'Create an order',
    description:
      'Creates a new order. Validates that all products exist in the Catalog Service and have sufficient stock. ' +
      'Supports idempotency via the `Idempotency-Key` header — sending the same key twice returns the original order.',
  })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Optional UUID to prevent duplicate orders on retry',
    required: false,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 201, description: 'Order created successfully', type: OrderResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error, product not found, or insufficient stock' })
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Headers('Idempotency-Key') idempotencyKey?: string,
  ) {
    const payload = { ...createOrderDto, idempotencyKey };
    const res: any = await firstValueFrom(this.ordersClient.send({ cmd: 'create_order' }, payload));
    if (res?.error) {
      throw new HttpException(res.error, HttpStatus.BAD_REQUEST);
    }
    return res;
  }
}
