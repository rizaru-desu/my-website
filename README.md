# Portfolio Platform

A personal portfolio and editorial admin workspace built with Next.js 16, React 19, Prisma, PostgreSQL, and Better Auth.

This codebase is in its final product shape. Public content and admin-managed content are backed by real persisted Prisma models in PostgreSQL, and the app no longer depends on `lib/mock-content.ts`.

## Overview

The project combines two surfaces in one codebase:

- A recruiter-facing public portfolio with projects, blog posts, resume content, testimonials, and a real contact flow.
- A protected admin workspace for managing profile content, projects, blog posts, blog comments, skills, resume assets, experience, education, certificates, testimonials, messages, users, and account security.

## Main Features

- Real authentication with Better Auth, Prisma adapter, email/password sign-in, email verification, password reset, and 2FA.
- Role-aware admin workspace with protected content management routes.
- Prisma-backed CRUD for profile, skills, projects, blog posts, resume asset, experience, education, and certificates.
- Public blog with article pages plus blog comment submission and moderation.
- Public contact form that persists messages into the admin inbox.
- Testimonial submission flow with moderation and featured testimonial display.
- Visitor analytics and CV download tracking.
- Editorial visual language across both the public site and the admin workspace.

## Stack

| Layer | Stack |
| --- | --- |
| App | Next.js 16 App Router + React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | Better Auth + Prisma adapter + Argon2 |
| Database | PostgreSQL + Prisma |
| Client state | TanStack Query + TanStack Form |
| Rich text | MDXEditor |
| Charts | Recharts |
| Mail | Nodemailer |
| Caching / dedupe | Redis |

## Persisted Data Model

The Prisma schema already includes the core content and platform entities used by the app:

- Auth: `User`, `Account`, `Session`, `Verification`, `TwoFactor`
- Portfolio content: `ProfileContent`, `Skill`, `Project`, `BlogPost`, `BlogComment`
- Resume content: `ResumeAsset`, `Experience`, `Education`, `Certificate`
- Engagement and analytics: `Message`, `Testimonial`, `VisitorLog`, `CvDownloadLog`

See [`prisma/schema.prisma`](prisma/schema.prisma) for the full schema.

## Routes and Surfaces

Public routes include:

- `/`
- `/projects`
- `/projects/[slug]`
- `/blog`
- `/blog/[slug]`
- `/resume`
- `/testimonials`
- `/login`
- `/two-factor`

Admin routes include:

- `/admin`
- `/admin/profile`
- `/admin/projects`
- `/admin/blog`
- `/admin/skills`
- `/admin/resume`
- `/admin/messages`
- `/admin/testimonials`
- `/admin/users`
- `/admin/account`

## Local Setup

1. Install dependencies:

```bash
pnpm install
```

2. Copy the environment template:

```bash
cp .env.example .env
```

3. Fill the minimum required environment variables in `.env`:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`

4. Generate the Prisma client and apply the schema:

```bash
pnpm prisma generate
pnpm prisma db push
```

5. Seed the initial admin user:

```bash
pnpm db:seed
```

6. Start the app:

```bash
pnpm dev
```

Default seed values come from [`.env.example`](.env.example). Override them in `.env` before running the seed if you want custom credentials.

## Optional Environment Variables

These are not required to boot the app locally, but they enable production-facing integrations:

- `GOOGLE_SMTP_USER`, `GOOGLE_APP_PASSWORD`, `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME` for email delivery.
- `REDIS_URL`, `ANALYTICS_HASH_SALT`, `COMMENT_HASH_SALT` for Redis-backed analytics and comment controls.
- `RESUME_DOWNLOAD_URL` for the public CV download target.
- `CLOUDFLARE_R2_ACCOUNT_ID`, `CLOUDFLARE_R2_ACCESS_KEY_ID`, `CLOUDFLARE_R2_SECRET_ACCESS_KEY`, `CLOUDFLARE_R2_BUCKET_NAME`, `CLOUDFLARE_R2_PUBLIC_URL` for admin resume PDF uploads to Cloudflare R2.
- `NEXT_PUBLIC_APP_VERSION`, `NEXT_PUBLIC_GIT_SHA`, `NEXT_PUBLIC_BUILD_TIMESTAMP`, `RELEASE_VERSION`, `BUILD_TIMESTAMP` for build metadata.

If mailer config is missing, email flows fall back to server logging instead of failing the request.

## Useful Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm test:2fa-flow
pnpm db:seed
pnpm seed:auth-user
pnpm package:release
```

## Deployment

Production deployment is handled by [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

On pushes to `main`, GitHub Actions:

- installs dependencies with `pnpm`
- runs `prisma generate`
- builds the Next.js app
- prepares a standalone bundle
- syncs the build to the server
- reloads the PM2 process

## Versioning

- App version: [`package.json`](package.json)
- Runtime version endpoint: [`/api/version`](app/api/version/route.ts)
- Release notes: [`CHANGELOG.md`](CHANGELOG.md)
