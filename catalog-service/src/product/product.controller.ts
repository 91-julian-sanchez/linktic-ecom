import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductService, CreateProductDto } from './product.service';

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @MessagePattern({ cmd: 'find_all_products' })
  async findAll() {
    return this.productService.findAll();
  }

  @MessagePattern({ cmd: 'find_product' })
  async findOne(@Payload() id: string) {
    try {
      return await this.productService.findOne(id);
    } catch (e) {
      return { error: e.message };
    }
  }

  @MessagePattern({ cmd: 'find_products_by_ids' })
  async findByIds(@Payload() ids: string[]) {
    return this.productService.findByIds(ids);
  }

  @MessagePattern({ cmd: 'create_product' })
  async create(@Payload() createProductDto: CreateProductDto) {
    try {
      return await this.productService.create(createProductDto);
    } catch (e) {
      return { error: e.message };
    }
  }
}
