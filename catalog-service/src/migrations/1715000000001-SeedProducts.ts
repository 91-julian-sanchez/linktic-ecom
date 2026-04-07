import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedProducts1715000000001 implements MigrationInterface {
    name = 'SeedProducts1715000000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "products" (sku, name, description, price, stock) VALUES
            ('MBA13-M1', 'MacBook Air 13" (M1)', 'Apple M1 chip, 8GB RAM, 256GB SSD', 999.00, 45),
            ('MBA13-M2', 'MacBook Air 13" (M2)', 'Apple M2 chip, 8GB RAM, 256GB SSD', 1099.00, 30),
            ('MBA13-M3', 'MacBook Air 13" (M3)', 'Apple M3 chip, 8GB RAM, 256GB SSD', 1199.00, 25),
            ('MBA15-M3', 'MacBook Air 15" (M3)', 'Apple M3 chip, 8GB RAM, 256GB SSD', 1299.00, 20),
            ('MBP14-M3', 'MacBook Pro 14" (M3)', 'Apple M3 chip, 16GB RAM, 512GB SSD', 1599.00, 15),
            ('MBP14-M3P', 'MacBook Pro 14" (M3 Pro)', 'Apple M3 Pro chip, 18GB RAM, 512GB SSD', 1999.00, 10),
            ('MBP14-M3M', 'MacBook Pro 14" (M3 Max)', 'Apple M3 Max chip, 36GB RAM, 1TB SSD', 3199.00, 5),
            ('MBP16-M3P', 'MacBook Pro 16" (M3 Pro)', 'Apple M3 Pro chip, 18GB RAM, 512GB SSD', 2499.00, 12),
            ('MBP16-M3M', 'MacBook Pro 16" (M3 Max)', 'Apple M3 Max chip, 36GB RAM, 1TB SSD', 3499.00, 8),
            ('IMAC24-M3', 'iMac 24" (M3)', 'Apple M3 chip, 8-core GPU, 8GB RAM, 256GB SSD', 1299.00, 10),
            ('MMINI-M2', 'Mac mini (M2)', 'Apple M2 chip, 8GB RAM, 256GB SSD', 599.00, 50),
            ('MMINI-M2P', 'Mac mini (M2 Pro)', 'Apple M2 Pro chip, 16GB RAM, 512GB SSD', 1299.00, 15),
            ('MSTUDIO-M2M', 'Mac Studio (M2 Max)', 'Apple M2 Max chip, 32GB RAM, 512GB SSD', 1999.00, 7),
            ('MSTUDIO-M2U', 'Mac Studio (M2 Ultra)', 'Apple M2 Ultra chip, 64GB RAM, 1TB SSD', 3999.00, 3),
            ('MPRO-M2U', 'Mac Pro (M2 Ultra)', 'Apple M2 Ultra chip, 64GB RAM, 1TB SSD', 6999.00, 2)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "products" WHERE sku IN (
            'MBA13-M1', 'MBA13-M2', 'MBA13-M3', 'MBA15-M3', 'MBP14-M3',
            'MBP14-M3P', 'MBP14-M3M', 'MBP16-M3P', 'MBP16-M3M', 'IMAC24-M3',
            'MMINI-M2', 'MMINI-M2P', 'MSTUDIO-M2M', 'MSTUDIO-M2U', 'MPRO-M2U'
        )`);
    }

}
