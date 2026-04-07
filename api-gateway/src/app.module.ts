import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ProductsController } from './products/products.controller';
import { OrdersController } from './orders/orders.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'CATALOG_SERVICE',
        transport: Transport.TCP,
        options: { host: process.env.CATALOG_SERVICE_HOST || '127.0.0.1', port: parseInt(process.env.CATALOG_SERVICE_PORT || '3001', 10) },
      },
      {
        name: 'ORDERS_SERVICE',
        transport: Transport.TCP,
        options: { host: process.env.ORDERS_SERVICE_HOST || '127.0.0.1', port: parseInt(process.env.ORDERS_SERVICE_PORT || '3002', 10) },
      },
    ]),
  ],
  controllers: [ProductsController, OrdersController],
  providers: [],
})
export class AppModule {}
