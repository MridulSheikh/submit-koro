# Submit Koro frontend

The Submit Koro frontend is a Next.js dashboard for project submissions and reviews. It includes account registration and sign-in, email verification, profile management, submission workflows, review tools, and team and mentor pages.

## Requirements

- Node.js and npm (use a Node.js version supported by the installed Next.js release).
- The Submit Koro API running locally or available at a configured API URL.

## Setup

Run these commands from the `frontend` project directory:

```bash
npm ci
```

Create a local environment file from the example:

```bash
cp .env.example .env.local
```

On Windows PowerShell, use `Copy-Item .env.example .env.local` instead. Set the values in `.env.local`:

| Variable                                 | Purpose                                                                        | Example                    |
| ---------------------------------------- | ------------------------------------------------------------------------------ | -------------------------- |
| `NEXT_PUBLIC_API_URL`                  | Base URL of the Submit Koro API. The frontend calls API routes under `/api`. | `http://localhost:8000`  |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`    | Cloudinary cloud name used for profile image uploads.                          | Your Cloudinary cloud name |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Cloudinary unsigned upload preset used for profile image uploads.              | Your upload preset         |

The API URL defaults to `http://localhost:8000` when it is not set. The Cloudinary values are needed for image uploads; other frontend features can run without them. These variables are exposed to the browser because they use the `NEXT_PUBLIC_` prefix. Do not put secrets in them.

Start the API before using sign-in, dashboard data, or other API-backed features. The backend API setup and endpoint reference are documented in [`API_END_POINTS.md`](./API_END_POINTS.md).

## Run locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The Next.js development server reloads pages as you edit source files.

## Available commands

| Command           | Description                                               |
| ----------------- | --------------------------------------------------------- |
| `npm run dev`   | Start the local development server.                       |
| `npm run build` | Create an optimized production build.                     |
| `npm run start` | Serve the production build (run `npm run build` first). |
| `npm run lint`  | Run ESLint on the project.                                |

## Main pages

| Path              | Page                        |
| ----------------- | --------------------------- |
| `/`             | Dashboard overview          |
| `/login`        | Sign in                     |
| `/signup`       | Create an account           |
| `/verify-email` | Email verification flow     |
| `/submission`   | View and manage submissions |
| `/review`       | Review submissions          |
| `/mentors`      | Mentor and team tools       |
| `/profile`      | Manage account profile      |
| `/forbidden`    | Permission error page       |

Dashboard pages require a signed-in account with a verified email. Available dashboard actions depend on the account's role and permissions.

## Project structure

```text
app/                 Next.js App Router pages and layouts
components/          Reusable UI and feature components
hooks/               Shared React hooks
lib/                 API clients, authentication helpers, schemas, utilities
public/              Static assets
style/               Global styles
API_END_POINTS.md    Backend API reference
```

Route pages live under `app/`. The dashboard route group is `app/(dashboard)/`; the parentheses group the routes without adding a URL segment. Shared API and authentication helpers are in `lib/`.

## Authentication and API

The frontend uses Better Auth against the configured API and sends session cookies for authenticated requests. Dashboard pages check the session and email verification status on the server. If the API is unavailable, start it and reload the page.

For backend routes, request payloads, and response shapes, see [`API_END_POINTS.md`](./API_END_POINTS.md). Keep this document aligned when API integration changes.

## Production build

Configure the production API URL and Cloudinary settings in the deployment environment, then build and start the app:

```bash
npm run build
npm run start
```

Deployments must be able to reach the configured API from both the browser and the Next.js server. Configure the API's allowed client origin and cookie settings for the deployed frontend domain.
