<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# NestJS Prisma Template

A production-ready NestJS template with Prisma ORM, PostgreSQL, JWT authentication, role-based access control, and Swagger documentation.

## Features

- **NestJS 11** with TypeScript
- **Prisma 7** ORM with PostgreSQL
- **JWT Authentication** with Passport
- **Role-Based Access Control** (USER, ADMIN roles)
- **Swagger/OpenAPI** documentation
- **Docker Compose** for local development
- **Testing** with Jest and mocking
- **Validation** with class-validator and Zod
- **Security** with Helmet, CORS

## Prerequisites

- Node.js 20+
- pnpm (or npm/yarn)
- Docker & Docker Compose

## Installation

```bash
# Install dependencies
pnpm install

# Generate Prisma Client
pnpm run db:generate
```

## Database Setup

```bash
# Start PostgreSQL container
pnpm run db:up

# Push schema to database
pnpm run db:push

# Open Prisma Studio (optional)
pnpm run db:studio
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nestjs?schema=public"

# JWT
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_EXPIRES="1h"

# App
PORT=3000
WHITELIST=""
```

## Running the Application

```bash
# Development (watch mode)
pnpm run start:dev

# Production
pnpm run start:prod
```

## API Documentation

Once running, access the Swagger UI at:

```
http://localhost:3000/api
```

### Available Endpoints

#### Auth (`/auth`)
| Method | Endpoint | Description | Public |
|--------|----------|-------------|--------|
| POST | `/auth/login` | Login with credentials | Yes |
| PUT | `/auth/regenerate` | Refresh JWT token | Yes |

#### User (`/user`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/user` | Get current user | JWT |
| GET | `/user/all` | Get all users (admin) | JWT+ADMIN |
| GET | `/user/:id` | Get user by ID (admin) | JWT+ADMIN |
| POST | `/user` | Create user | JWT |
| PUT | `/user` | Update current user | JWT |
| PUT | `/user/:id` | Update user (admin) | JWT+ADMIN |
| DELETE | `/user` | Delete current user | JWT |
| DELETE | `/user/:id` | Delete user (admin) | JWT+ADMIN |

#### Post (`/post`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/post` | Get all published posts | No |
| GET | `/post/all` | Get all posts (admin) | JWT+ADMIN |
| GET | `/post/my` | Get my posts | JWT |
| GET | `/post/:id` | Get post by ID | No |
| POST | `/post` | Create post | JWT |
| PUT | `/post/:id` | Update post | JWT |
| DELETE | `/post/:id` | Delete post | JWT |

#### Health (`/health`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/health` | Basic health check | No |
| GET | `/health/prisma` | Database health check | JWT+ADMIN |

## Testing

```bash
# Unit tests
pnpm run test

# Watch mode
pnpm run test:watch

# Coverage report
pnpm run test:cov

# E2E tests
pnpm run test:e2e
```

## Database Scripts

```bash
pnpm run db:up        # Start PostgreSQL
pnpm run db:down      # Stop PostgreSQL
pnpm run db:push      # Push schema to DB
pnpm run db:generate  # Generate Prisma Client
pnpm run db:migrate   # Run migrations
pnpm run db:studio    # Open Prisma Studio
pnpm run db:reset     # Reset database
```

## Project Structure

```
src/
├── auth/               # Authentication module
│   ├── jwt/           # JWT strategy and guards
│   ├── roles/         # Role-based access control
│   ├── strategies/    # Passport strategies
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── user/              # User module
│   ├── user.controller.ts
│   ├── user.service.ts
│   ├── user.dto.ts
│   └── user.module.ts
├── post/              # Post module (example)
│   ├── post.controller.ts
│   ├── post.service.ts
│   ├── post.dto.ts
│   └── post.module.ts
├── prisma/            # Prisma service
│   └── prisma.service.ts
├── common/           # Shared utilities
│   ├── pipes/        # Custom pipes
│   └── interceptors/ # Custom interceptors
├── main.ts           # Application bootstrap
└── app.module.ts     # Root module
```

## Customization

### Adding a New Module

Follow the existing pattern:

1. Create the module directory in `src/`
2. Create `*.module.ts`, `*.service.ts`, `*.controller.ts`, `*.dto.ts`
3. Register the module in `app.module.ts`
4. Add Swagger decorators to controller

### Adding a New Database Model

1. Add model to `prisma/schema.prisma`
2. Run `pnpm run db:generate`
3. Run `pnpm run db:push`

## License

MIT