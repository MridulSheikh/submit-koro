# Submit Koro

Submit Koro is a project submission and review platform with a Next.js frontend and an Express API backed by PostgreSQL, Prisma, and Redis.

## Project structure

- `frontend/` — Next.js app, authentication screens, and dashboard.
- `api/` — Express API, Better Auth setup, Prisma schema, migrations, and seed data.

## Requirements

- Node.js and npm
- PostgreSQL
- Redis
- SMTP credentials for signup verification email

## Run locally

Run the API and frontend in separate terminals.

### 1. Configure and start the API

```powershell
cd api
npm install
```

Create `api/.env` and fill in the local service credentials. At minimum, configure:

```env
NODE_ENV=development
PORT=4000
CLIENT_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:4000
BETTER_AUTH_SECRET=replace-with-a-long-random-secret
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/submit_koro
REDIS_URL=redis://localhost:6379
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
SUPER_ADMIN_EMAIL=you@example.com
SUPER_ADMIN_NAME=Your Name
SUPER_ADMIN_PASSWORD=choose-a-strong-password
```

`REDIS_URL` is required by the API. SMTP settings are needed to deliver email verification links. The `SUPER_ADMIN_*` values are used only when running the seed. Keep real secrets in `.env`; never commit them.

Generate the Prisma client, apply migrations, and optionally seed the roles, super-admin account, and sample submissions:

```powershell
npx prisma generate --config prisma.config.ts
npx prisma migrate deploy --config prisma.config.ts
npx prisma db seed --config prisma.config.ts
```

The seed defaults to 40,000 sample submissions. To seed a smaller amount, set `SUBMISSION_SEED_COUNT=40` in `api/.env` before running it.

Start the API:

```powershell
npm run start:dev
```

The API listens on `http://localhost:4000` with the configuration above. Check it at [`http://localhost:4000/health`](http://localhost:4000/health).

### 2. Configure and start the frontend

In a second terminal:

```powershell
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
```

The API port in this URL must match `PORT` in `api/.env`. The frontend uses the API URL for server-side requests and as the destination for its `/api/*` and `/health` rewrites. Browser requests go through the frontend origin so the auth cookie is available to the dashboard.

Start the development server:

```powershell
npm run dev
```

Open [`http://localhost:3000`](http://localhost:3000). The app waits for the API health endpoint before rendering the pages. Protected API routes require a signed-in, email-verified user.

Profile image uploads also require an unsigned Cloudinary upload preset and cloud name in the frontend environment. The API requires its own Cloudinary credentials for API-managed profile image uploads; see `api/readme.md` for details.

## Production deployment

### Vercel frontend

Set the Vercel project root directory to `frontend`. Set these environment variables for the Production environment before building:

```env
NEXT_PUBLIC_API_URL=https://your-api-service.onrender.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-unsigned-preset
```

`NEXT_PUBLIC_API_URL` is used when the frontend build creates the external API rewrites. Changing it requires a new Vercel deployment.

### Render API

Set the Render service root directory to `api`, then configure the service to install dependencies, generate Prisma, build the TypeScript API, and start with `npm run start:prod`. Provide these Render environment variables:

- `DATABASE_URL` — PostgreSQL connection string.
- `REDIS_URL` — Redis connection string.
- `CLIENT_URL` — exact public Vercel origin, such as `https://your-project.vercel.app`.
- `BETTER_AUTH_URL` — public API origin, such as `https://your-api-service.onrender.com`.
- `BETTER_AUTH_SECRET` — long random secret shared by the API instances.
- `SMTP_USER` and `SMTP_PASSWORD` — SMTP credentials for verification email.
- `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_NAME`, and `SUPER_ADMIN_PASSWORD` — needed to create or assign the super-admin when seeding.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` — needed for API-managed profile image uploads.

Render supplies `PORT` for the deployed web service. The API trusts Render's proxy for client IP handling and rate limits sign-in, sign-up, and verification-email resend requests; session checks are not rate-limited.

The login page currently shows and pre-fills its demo credentials in production. Only use a disposable demo account with limited permissions there. Never put a real privileged account password in frontend code; anything rendered or bundled by the frontend is public.

## Useful commands

Run in `frontend/`:

```powershell
npm run dev
npm run build
npm start
npm run lint
```

Run in `api/`:

```powershell
npm run start:dev
npm run build
npm run start:prod
```

For endpoint details and response shapes, see [`frontend/API_END_POINTS.md`](frontend/API_END_POINTS.md) and [`api/readme.md`](api/readme.md).
