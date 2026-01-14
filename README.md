# Outreach Ops

A compliant AI outreach operations app.

## Structure

- `apps/web`: Next.js dashboard
- `services/api`: Node.js REST API
- `services/worker`: Background job worker (Redis-based)
- `packages/db`: Prisma ORM
- `packages/shared`: Shared utilities

## Getting Started

1. `cp .env.example .env` and fill in secrets.
2. `docker-compose up -d` to start DB and Redis.
3. `npm install`
4. `npm run dev`
