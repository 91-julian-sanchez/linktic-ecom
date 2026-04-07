import { Controller, Get, Post, Body, Inject, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  sku: string;
  @IsString()
  name: string;
  @IsString()
  description: string;
  @IsNumber()
  @Min(0)
  price: number;
  @IsNumber()
  @Min(0)
  stock: number;
}

@Controller('products')
export class ProductsController {
  constructor(@Inject('CATALOG_SERVICE') private readonly catalogClient: ClientProxy) {}

  @Get()
  async getProducts() {
    return this.catalogClient.send({ cmd: 'find_all_products' }, {});
  }

  @Get(':id')
  async getProduct(@Param('id') id: string) {
    const res: any = await firstValueFrom(this.catalogClient.send({ cmd: 'find_product' }, id));
    if (res?.error) {
      throw new HttpException(res.error, HttpStatus.NOT_FOUND);
    }
    return res;
  }

  @Post()
  async createProduct(@Body() createProductDto: CreateProductDto) {
    const res: any = await firstValueFrom(this.catalogClient.send({ cmd: 'create_product' }, createProductDto));
    if (res?.error) {
      throw new HttpException(res.error, HttpStatus.BAD_REQUEST);
    }
    return res;
  }
}
