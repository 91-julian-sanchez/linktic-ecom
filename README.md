# E-commerce Platform (Microservices Backend)

E-commerce platform developed under a microservices architecture using NestJS, with simulated local deployment using Docker Compose.

## Architecture

The platform follows the **Database-per-service** pattern, ensuring decoupling and separation of concerns:

1. **API Gateway**: Single point of entry for the web application. Exposes a REST API and communicates internally via TCP protocol with microservices.
2. **Catalog Service**: Microservice in charge of managing the product catalog. It has its own database (`ecommerce_catalog_db`).
3. **Orders Service**: Microservice in charge of processing order creation. It communicates with the *Catalog Service* via TCP synchronously to validate products and prices. It has its own database (`ecommerce_orders_db`).
4. **Frontend App**: User interface developed in React with Vite that allows browsing the catalog and making purchases by consuming the *API Gateway*.

Both backend services use PostgreSQL as the database and TypeORM as the ORM. Data access logic is encapsulated using the Repository Pattern.

## Prerequisites

- Node.js (v18+)
- Docker and Docker Compose

## Project Initialization

### 1. Spin up Infrastructure

The project uses Docker Compose to set up isolated databases.

```bash
docker-compose up -d
```

This will start:
- `ecommerce_catalog_db` on port `5432`
- `ecommerce_orders_db` on port `5433`

### 2. Run Microservices

Each microservice must install its dependencies in its respective directory and be started individually.

#### API Gateway
```bash
cd api-gateway
npm install
npm run start:dev
```

#### Catalog Service
```bash
cd catalog-service
npm install
npm run start:dev
```

#### Orders Service
```bash
cd orders-service
npm install
npm run start:dev
```

### 3. Run Frontend

The web application is located in the `frontend` directory and is built with React and Vite.

```bash
cd frontend
npm install
npm run dev
```

The application will be available by default at `http://localhost:5173`.

## Relevant Patterns and Technical Decisions

- **Microservices with TCP**: Instead of using HTTP or message queues (RabbitMQ), NestJS native TCP transport is used for direct and fast order validation communication.
- **Database-per-service**: Independent storage, avoiding strict "foreign keys" between the Catalog Service and Orders Service.
- **Decoupled Microservices**: Denormalization (`productName` in `OrderItem`) is used to optimize reads and provide historical context.
- **Idempotency**: Support for `Idempotency-Key` in order creation endpoints.
- **Repositories**: Database interaction exclusively through the Repository Pattern.
