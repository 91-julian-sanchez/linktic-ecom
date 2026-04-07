# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a **microservices e-commerce platform** with four components:

- **API Gateway** (HTTP :3000) — Single entry point, proxies requests to backend services via NestJS TCP transport
- **Catalog Service** (TCP :3001) — Product catalog, PostgreSQL at :5432
- **Orders Service** (TCP :3002) — Order processing, PostgreSQL at :5433; calls Catalog Service internally to validate products
- **Frontend** (Vite/React :5173) — Talks only to the API Gateway at http://localhost:3000

Service communication: `Frontend → API Gateway → [Catalog Service | Orders Service]` and `Orders Service → Catalog Service` (for product validation).

## Running the Stack

**Start databases first:**
```bash
docker-compose up -d
```

**Then start each service in its own terminal:**
```bash
cd catalog-service && npm run start:dev
cd orders-service && npm run start:dev
cd api-gateway && npm run start:dev
cd frontend && npm run dev
```

## Commands (per service)

All three NestJS services (`api-gateway`, `catalog-service`, `orders-service`) share the same script conventions:

```bash
npm run start:dev     # Development with watch
npm run build         # Compile TypeScript
npm run lint          # ESLint with auto-fix
npm run test          # Jest unit tests
npm run test:watch    # Watch mode
npm run test:cov      # Coverage report
npm run test:e2e      # E2E tests (from /test dir)
```

**Run a single test file:**
```bash
npm run test -- path/to/file.spec.ts
```

**Catalog Service only — database migrations:**
```bash
npm run migration:run       # Apply pending migrations
npm run migration:revert    # Rollback last migration
npm run migration:generate  # Generate new migration from entity changes
```

**Frontend:**
```bash
npm run dev      # Vite dev server
npm run build    # Production build
npm run lint     # ESLint
```

## Database Configuration

Two separate PostgreSQL instances via Docker:

| Service | Host | Port | User | Password | DB |
|---------|------|------|------|----------|----|
| Catalog | localhost | 5432 | catalog_user | catalog_password | ecommerce_catalog_db |
| Orders | localhost | 5433 | orders_user | orders_password | ecommerce_orders_db |

- **Catalog Service**: Uses TypeORM migrations (`synchronize: false`). Migrations live in `catalog-service/src/migrations/`. Initial seed creates 15 Apple product SKUs.
- **Orders Service**: Uses `synchronize: true` (dev mode), no migration files.

## Key Architectural Decisions

- **TCP transport**: Inter-service communication uses NestJS's built-in TCP microservice transport (`ClientsModule.register` with `Transport.TCP`), not HTTP or message queues.
- **Idempotency**: Order creation accepts an `Idempotency-Key` header to prevent duplicate orders.
- **Denormalized order items**: `OrderItem` stores `productName` and `unitPrice` at creation time (not references), so orders remain accurate if catalog changes.
- **Database-per-service**: Each service owns its schema independently; no cross-database joins.

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`) runs on push/PR to `main`:
1. Matrix build+test across all three NestJS services (Node 18)
2. On main branch merge: simulated version bump and cloud deployment step (not a real deploy)
