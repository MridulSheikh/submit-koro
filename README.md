# Submit Koro

Submit Koro is a project-submission and review platform. The repository contains a Next.js frontend and an Express API backed by PostgreSQL and Prisma.

## Project structure

- `frontend/` — Next.js app with dashboard, submission, review, and authentication screens.
- `api/` — Express API, Prisma schema, and database migrations.

## Requirements

- Node.js and npm
- PostgreSQL

## Getting started

### API

In a terminal, go to the API directory and install dependencies:

```powershell
cd api
npm install
```

Create `api/.env` with your PostgreSQL connection string, the API port, and the frontend origin:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/submit_koro"
REDIS_URL="redis://localhost:6379"
PORT=4000
CLIENT_URL="http://localhost:3000"
```

Apply the database migrations, generate the Prisma client, and start the API:

```powershell
npx prisma migrate deploy --config prisma7.config.ts
npx prisma generate --config prisma7.config.ts
npm run start:dev
```

The API listens on `http://localhost:4000`. Check its health at [`http://localhost:4000/health`](http://localhost:4000/health).

### Frontend

In a separate terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open [`http://localhost:3000`](http://localhost:3000) in your browser.

The login form sends credentials to the API. If the API is not running at its
default URL (`http://localhost:4000`), set `NEXT_PUBLIC_API_URL` in
`frontend/.env.local` to the API origin.

## Other frontend commands

Run these from `frontend/`:

```powershell
npm run lint
npm run build
npm run start
```

## Configuration

The API reads `DATABASE_URL`, `REDIS_URL`, `PORT`, and `CLIENT_URL` from `api/.env`. Redis is used to cache overview data for 60 seconds. Keep environment files and secrets out of version control.
