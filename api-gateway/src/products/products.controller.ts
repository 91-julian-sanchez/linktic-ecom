import { Controller, Get, Post, Body, Inject, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { IsString, IsNumber, Min } from 'class-validator';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty, ApiParam } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'MBP16-M4', description: 'Unique product SKU' })
  @IsString()
  sku: string;

  @ApiProperty({ example: 'MacBook Pro 16" (M4)' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Apple M4 chip, 24GB RAM, 512GB SSD' })
  @IsString()
  description: string;

  @ApiProperty({ example: 2499, minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 10, minimum: 0 })
  @IsNumber()
  @Min(0)
  stock: number;
}

export class ProductResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'MBP16-M4' })
  sku: string;

  @ApiProperty({ example: 'MacBook Pro 16" (M4)' })
  name: string;

  @ApiProperty({ example: 'Apple M4 chip, 24GB RAM, 512GB SSD' })
  description: string;

  @ApiProperty({ example: '2499.00' })
  price: string;

  @ApiProperty({ example: 10 })
  stock: number;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt: string;
}

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(@Inject('CATALOG_SERVICE') private readonly catalogClient: ClientProxy) {}

  @Get()
  @ApiOperation({ summary: 'List all products', description: 'Returns the full product catalog.' })
  @ApiResponse({ status: 200, description: 'Array of products', type: [ProductResponseDto] })
  async getProducts() {
    return firstValueFrom(this.catalogClient.send({ cmd: 'find_all_products' }, {}));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Product found', type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProduct(@Param('id') id: string) {
    const res: any = await firstValueFrom(this.catalogClient.send({ cmd: 'find_product' }, id));
    if (res?.error) {
      throw new HttpException(res.error, HttpStatus.NOT_FOUND);
    }
    return res;
  }

  @Post()
  @ApiOperation({ summary: 'Create a product' })
  @ApiResponse({ status: 201, description: 'Product created', type: ProductResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error or duplicate SKU' })
  async createProduct(@Body() createProductDto: CreateProductDto) {
    const res: any = await firstValueFrom(this.catalogClient.send({ cmd: 'create_product' }, createProductDto));
    if (res?.error) {
      throw new HttpException(res.error, HttpStatus.BAD_REQUEST);
    }
    return res;
  }
}
