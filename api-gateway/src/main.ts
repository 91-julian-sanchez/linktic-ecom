import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Linktic Ecom — API Gateway')
    .setDescription(
      'REST API for the e-commerce microservices platform. ' +
      'Routes requests to the Catalog Service and Orders Service via internal TCP transport.',
    )
    .setVersion('1.0')
    .addTag('products', 'Product catalog management')
    .addTag('orders', 'Order processing and history')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Linktic Ecom API Docs',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
