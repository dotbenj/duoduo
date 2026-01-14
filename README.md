# duoduo-api

NestJS HTTP API (TypeScript) with Swagger.

## Prerequisites

- Node.js 20+
- npm
- (Optional) Docker + Docker Compose v2

## Configuration

Environment variables are loaded via NestJS `ConfigModule` from `dev.env` by default (override with `DOTENV_CONFIG_PATH`).

- `PORT` (default: `3000`)
- `MONGO_DB`, `MONGO_USERNAME`, `MONGO_PASSWORD`
- `MONGODB_URI` (example in `dev.env`)

To use a different env file locally:

```bash
DOTENV_CONFIG_PATH=.env npm run start:dev
```

## Run locally (Node)

```bash
npm install
npm run start:dev
```

API: `http://localhost:3000`  
Swagger UI: `http://localhost:3000/api`

## Run with Docker (API + MongoDB)

This starts both the API and a MongoDB container.

```bash
# Compose v2 (plugin)
docker compose --env-file dev.env up --build

# Compose v1
docker-compose --env-file dev.env up --build
```

API: `http://localhost:3000`  
Swagger UI: `http://localhost:3000/api`

MongoDB is exposed on `localhost:27017`.

## Tests

```bash
npm test
```
