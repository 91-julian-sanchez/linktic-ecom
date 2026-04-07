import { Injectable, Inject, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Order, OrderItem, OrderStatus } from './order.entity';
import { firstValueFrom } from 'rxjs';
export class CreateOrderItemDto {
  productId: string;
  quantity: number;
}

export class CreateOrderDto {
  customerEmail: string;
  idempotencyKey?: string;
  items: CreateOrderItemDto[];
}

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem) private readonly orderItemRepository: Repository<OrderItem>,
    @Inject('CATALOG_SERVICE') private readonly catalogClient: ClientProxy,
  ) {}

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({ relations: ['items'] });
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    if (createOrderDto.idempotencyKey) {
      const existingOrder = await this.orderRepository.findOne({
        where: { idempotencyKey: createOrderDto.idempotencyKey }
      });
      if (existingOrder) {
        return existingOrder; // Return existing successfully (Idempotency)
      }
    }

    if (!createOrderDto.items || createOrderDto.items.length === 0) {
      throw new BadRequestException('Order must have at least one item.');
    }

    const productIds = createOrderDto.items.map(i => i.productId);
    
    // Fetch products from Catalog service
    const productsRes = await firstValueFrom(
      this.catalogClient.send({ cmd: 'find_products_by_ids' }, productIds)
    );

    if (productsRes.error) {
      throw new Error(`Catalog service error: ${productsRes.error}`);
    }

    const products: any[] = productsRes;

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products do not exist.');
    }

    let totalAmount = 0;
    const orderItemsToSave: Partial<OrderItem>[] = [];

    for (const itemDto of createOrderDto.items) {
const product = products.find(p => p.id === itemDto.productId);
      
      if (!product) {
        throw new BadRequestException(`Product ${itemDto.productId} not found`);
      }
      if (product.stock < itemDto.quantity) {
        throw new ConflictException(`Not enough stock for product ${product.name}`);
      }

      totalAmount += product.price * itemDto.quantity;
      
      orderItemsToSave.push({
        productId: product.id,
        productName: product.name,
        quantity: itemDto.quantity,
        unitPrice: product.price,
      });
    }

    const order = await this.orderRepository.save(
      this.orderRepository.create({
        customerEmail: createOrderDto.customerEmail,
        idempotencyKey: createOrderDto.idempotencyKey,
        totalAmount,
        status: OrderStatus.COMPLETED,
      })
    );

    const items = orderItemsToSave.map(item =>
      this.orderItemRepository.create({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        order,
      })
    );
    await this.orderItemRepository.save(items);

    return this.orderRepository.findOne({ where: { id: order.id }, relations: ['items'] }) as Promise<Order>;
  }
}
