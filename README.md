# BlinkMart

A full-stack grocery e-commerce platform with a customer storefront and a full admin panel, built with Next.js 16, Prisma 7, and Neon PostgreSQL.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Database | Neon PostgreSQL (serverless) |
| ORM | Prisma 7 (`prisma-client` generator) |
| DB Adapter | `@prisma/adapter-pg` + `pg` |
| Auth | Better Auth (email/password + Google OAuth) |
| Email | Resend + React Email |
| UI | shadcn/ui + Tailwind CSS v4 |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Data Fetching | TanStack Query v5 |
| Deployment | Vercel |

---

## Features

### Customer Storefront
- Home page with hero, category strip, promo banner, best sellers, deal of the day, and fresh arrivals
- Product listing with filtering by category and brand
- Product detail page
- Shopping cart
- Checkout flow
- Order history and order detail
- User profile with delivery address management
- In-app notifications
- Forgot/reset password flow

### Admin Panel (`/admin/*`)
- Dashboard with key metrics
- Product management (list, create, edit)
- Category & brand management
- Order management with status updates
- Customer management
- Revenue reports
- Notification broadcasting

### Auth
- Email/password signup and login
- Google OAuth
- Session management via Better Auth
- Password reset via email (Resend)

---

## Project Structure

```
src/
├── app/
│   ├── (app)/              # Customer-facing routes
│   │   ├── page.tsx        # Home page
│   │   ├── products/       # Product listing & detail
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── orders/
│   │   ├── profile/
│   │   └── notification/
│   ├── (admin-plane)/
│   │   └── admin/          # Admin panel routes
│   │       ├── dashboard/
│   │       ├── products/
│   │       ├── orders/
│   │       ├── customers/
│   │       ├── reports/
│   │       ├── revenue/
│   │       └── notification/
│   ├── (auth)/             # Auth pages
│   │   ├── login/
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   └── api/
│       ├── auth/[...all]/  # Better Auth handler
│       └── db-health/      # Connection diagnostic endpoint
├── components/             # Shared UI components
├── repositories/           # Database access layer (Prisma)
├── lib/
│   ├── prisma.ts           # PrismaClient singleton
│   └── auth.ts             # Better Auth config
└── generated/
    └── prisma/             # Generated Prisma client (gitignored)
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 10
- A [Neon](https://neon.tech) PostgreSQL database

### 1. Clone and install

```bash
git clone https://github.com/ali-rashid-dev/blinkmart.git
cd blinkmart
pnpm install
```

### 2. Set environment variables

Copy the example and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon **pooled** connection string (`-pooler` hostname, `sslmode=verify-full`) |
| `BETTER_AUTH_SECRET` | Random secret for Better Auth session signing |
| `BETTER_AUTH_URL` | Base URL of your app (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_API_URL` | Public base URL (same as above for local dev) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `RESEND_API_KEY` | Resend API key for transactional email |

> **Important:** Always use Neon's **pooled endpoint** (hostname with `-pooler` suffix) in both development and production. The direct endpoint is unsuitable for serverless.

### 3. Generate the Prisma client

```bash
pnpm prisma generate
```

### 4. Apply database migrations

```bash
pnpm prisma migrate deploy
```

### 5. (Optional) Seed the database

```bash
pnpm seed
```

### 6. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Database

The Prisma schema is at [`prisma/schema.prisma`](./prisma/schema.prisma). The generated client outputs to `src/generated/prisma/` (gitignored).

The `PrismaClient` singleton in [`src/lib/prisma.ts`](./src/lib/prisma.ts) uses the `@prisma/adapter-pg` driver adapter, which is required for Neon's serverless PostgreSQL.

### Connection string format

```
postgresql://<user>:<password>@<host>-pooler.<region>.aws.neon.tech/<dbname>?sslmode=verify-full
```

Note the `-pooler` suffix in the hostname and `sslmode=verify-full` (not `require`).

---

## Building for Production

```bash
pnpm build   # runs: prisma generate && next build
pnpm start
```

`prisma generate` is prepended to the build script so the Prisma client is always available on the build machine (e.g. Vercel), which clones from git and does not have the gitignored `src/generated/` directory.

---

## Deployment (Vercel)

1. Push to `main` — Vercel auto-deploys.
2. Set all environment variables listed above in the Vercel project dashboard.
3. The `DATABASE_URL` in Vercel must use the **pooled** Neon endpoint.

### Diagnostic endpoint

After deployment, hit `/api/db-health` to verify database connectivity:

```
GET https://your-app.vercel.app/api/db-health
```

Returns 5 sequential `SELECT 1` pings with per-attempt latency and any error messages.

---

## Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start Next.js dev server with Turbopack |
| `pnpm build` | Generate Prisma client + production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm seed` | Seed the database (`prisma/seed.ts`) |
| `pnpm prisma generate` | Regenerate the Prisma client |
| `pnpm prisma migrate dev` | Create and apply a new migration |
| `pnpm prisma migrate deploy` | Apply pending migrations (production) |
| `pnpm prisma studio` | Open Prisma Studio |
