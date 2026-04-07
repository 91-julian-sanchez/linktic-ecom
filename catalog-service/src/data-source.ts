import { DataSource } from 'typeorm';
import { Product } from './product/product.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'catalog_user',
  password: 'catalog_password',
  database: 'ecommerce_catalog_db',
  entities: [Product],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});
