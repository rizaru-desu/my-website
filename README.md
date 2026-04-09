# Portfolio Platform

> A bold public portfolio paired with an editorial-style admin workspace.  
> This repo is already strong in authentication, protected admin UX, and recruiter-facing presentation, but much of the CMS data layer is still mock or local-only.

## How to Read This Repo Today

This project is **not** a blank starter anymore, and it is also **not yet** a fully data-backed CMS.

The honest read:

- The product direction, design language, public pages, and admin surfaces are already substantial.
- Authentication and account security are implemented with real Better Auth flows.
- Many content-management screens currently use `mock-content`, seeded defaults, or local state instead of persisted Prisma content models.
- [`docs/task.md`](docs/task.md) still exists, but it is **not fully in sync** with the current codebase. Treat this README as the current status snapshot.

## Stack Snapshot

| Layer | Current stack |
| --- | --- |
| App | Next.js 16 App Router + React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | Better Auth + Prisma adapter + Argon2 |
| Database | PostgreSQL via Prisma |
| Client data | TanStack Query + TanStack Form |
| Charts | `rough-viz` for the current admin analytics presentation |
| Testing | Node test runner for auth / 2FA flow assertions |

## Versioning

- The source version lives in [`package.json`](package.json).
- GitHub-facing releases use SemVer tags in the `vX.Y.Z` format.
- Runtime version metadata is exposed at [`/api/version`](app/api/version/route.ts).
- Human-readable release notes live in [`CHANGELOG.md`](CHANGELOG.md).

## Status Legend

- `Done` = implemented in codebase with a real working flow or real backend support
- `Partial / Mock` = present as UI, local state, seeded defaults, or mock data, but not fully integrated
- `Not Yet` = not implemented in this repo today

## Implementation Tracker

### 1. Foundation & Auth

**Done**

- Better Auth is wired to Prisma in [`lib/auth.ts`](lib/auth.ts) and [`prisma/schema.prisma`](prisma/schema.prisma).
- Email/password login is implemented through [`app/login/page.tsx`](app/login/page.tsx).
- Two-factor verification is implemented through [`app/two-factor/page.tsx`](app/two-factor/page.tsx) and the account security panel in [`app/admin/account/account-settings-panel.tsx`](app/admin/account/account-settings-panel.tsx).
- Role definitions and Better Auth admin permissions are set up in [`lib/permissions.ts`](lib/permissions.ts).
- Architect-only user management is protected server-side in [`app/admin/users/page.tsx`](app/admin/users/page.tsx).
- Seed support for auth users exists via [`prisma/seed.mjs`](prisma/seed.mjs) and [`scripts/seed-auth-user.mjs`](scripts/seed-auth-user.mjs).
- Auth and 2FA flow coverage exists in [`tests/2fa-flow.test.mjs`](tests/2fa-flow.test.mjs).

**Partial / Mock**

- Email verification, password reset, delete-account confirmation, and OTP email delivery are wired, but delivery is still simulated with `console.log` in [`lib/auth.ts`](lib/auth.ts).
- Admin protection is not yet centralized in one dedicated admin layout or middleware rule; some protections are route-specific, and the shell is session-aware.

**Not Yet**

- Real email provider integration such as Resend or Nodemailer.
- A single global middleware-driven admin access strategy covering the whole workspace.

### 2. Admin Workspace

**Done**

- The editorial admin shell and route-aware workspace navigation are implemented in [`components/admin-shell.tsx`](components/admin-shell.tsx).
- Route-level admin loading UI exists in [`app/admin/loading.tsx`](app/admin/loading.tsx).
- Admin dashboard, analytics surface, and collection overview pages exist under [`app/admin`](app/admin).
- A real admin users flow exists with server prefetching, hydration, listing, ban/unban, and session revocation in [`app/admin/users`](app/admin/users).
- Account management, profile editing, projects, skills, blog, testimonials, messages, and resume workspace pages all exist as usable admin surfaces.

**Partial / Mock**

- Most non-user CMS sections are currently driven by `mock-content`, default-value files, or local-only state instead of persisted records.
- Dashboard analytics now use live visitor tracking for visitors, traffic sources, and top pages, but message and resume-download analytics are still pending.
- Resume upload, profile photo upload, and blog/project media handling are UI simulations rather than connected cloud storage flows.
- Some save flows are intentionally local/editorial rather than true CRUD persistence.

**Not Yet**

- Fully persisted CRUD for profile, projects, skills, blog posts, testimonials, messages, education, experience, certificates, and resume assets.
- Real moderation, inbox, or publishing workflows backed by database state across the whole admin area.
- Recharts-based analytics implementation promised in older planning docs.

### 3. Public Portfolio

**Done**

- Public pages exist for home, projects, blog, resume, auth-related screens, and not-found handling under [`app`](app).
- Project archive and project detail pages are implemented in [`app/projects/page.tsx`](app/projects/page.tsx) and [`app/projects/[slug]/page.tsx`](app/projects/[slug]/page.tsx).
- Blog archive and blog detail pages are implemented in [`app/blog/page.tsx`](app/blog/page.tsx) and [`app/blog/[slug]/page.tsx`](app/blog/[slug]/page.tsx).
- Reading progress for blog articles is implemented in [`components/reading-progress.tsx`](components/reading-progress.tsx).
- Public filtering UI exists for projects and blog through [`components/project-filter.tsx`](components/project-filter.tsx) and [`components/blog-filter.tsx`](components/blog-filter.tsx).

**Partial / Mock**

- Public portfolio content currently comes from [`lib/mock-content.ts`](lib/mock-content.ts), not from content models in Prisma.
- Testimonials are rendered on the public site, but they are sourced from mock content rather than a reviewed live submission pipeline.
- The public-facing content architecture already mirrors the intended CMS, but not yet the intended persistence layer.

**Not Yet**

- Public contact form submission flow backed by a real message model and backend handler.
- Public testimonial submission flow with review queue, spam protection, and approval persistence.
- Command palette search.
- Dedicated print-optimized `/cv` route separate from the current `/resume` page.

### 4. Data & Backend

**Done**

- Prisma currently models auth-related entities: `User`, `Account`, `Session`, `Verification`, and `TwoFactor`.
- Real backend querying exists for managed admin users through [`lib/admin-users.ts`](lib/admin-users.ts), [`app/api/admin/users/route.ts`](app/api/admin/users/route.ts), and [`app/admin/users/actions.ts`](app/admin/users/actions.ts).
- Visitor analytics now have a real persistence model and query layer through [`prisma/schema.prisma`](prisma/schema.prisma), [`lib/visitor-analytics.ts`](lib/visitor-analytics.ts), and [`app/api/track/visit/route.ts`](app/api/track/visit/route.ts).

**Partial / Mock**

- The codebase already has schemas, editor defaults, and structured UI for many CMS domains, but most of those domains do not yet persist to Prisma.
- Some admin pages are already shaped like production features, but they are still acting as local prototypes with realistic data.
- Visitor analytics use Upstash-backed dedup and Prisma-backed storage, but they currently cover only public page visits, not message or download events.

**Not Yet**

- Prisma content models for profile, projects, skills, education, experience, certificates, blog posts, testimonials, messages, and CV download logs.
- Full server actions or route handlers for CMS CRUD across those content models.
- Broader Redis-backed caching, dedup, or rate limiting for message submissions and other public flows.
- BullMQ or background job infrastructure.
- Real analytics tracking for messages and resume downloads.

### 5. Platform, SEO, and Ops

**Done**

- The repo is already on Next.js 16 conventions with App Router and TypeScript.
- A standalone build script exists in [`package.json`](package.json).

**Partial / Mock**

- Product and architecture intent are documented in [`docs/PRD-Personal-Portfolio-CMS.md`](docs/PRD-Personal-Portfolio-CMS.md), but implementation has intentionally advanced unevenly across subsystems.

**Not Yet**

- `sitemap.xml`, `robots.txt`, and dynamic Open Graph image generation.
- Dark mode.
- Sentry or equivalent production monitoring.
- Cloud storage integration for resume and image assets.
- Deployment-specific runbook or production environment guide.

## Current Gaps / Next Priorities

If this repo continues toward a production CMS, the highest-value next steps are:

1. Add Prisma content models beyond auth.
2. Replace mock/local admin save flows with real persisted CRUD.
3. Connect public forms for messages and testimonials to real backend handlers.
4. Add real email delivery and file storage.
5. Extend live analytics beyond visitors, then add SEO files and production monitoring.

## Local Setup

Run the app:

```bash
npm run dev
```

Seed an auth user with explicit values:

```bash
SEED_USER_EMAIL=admin@example.com
SEED_USER_PASSWORD=your-password
SEED_USER_NAME="Rizaru Desu"
SEED_USER_ROLE=architect
SEED_USER_USERNAME=admin
npx prisma db seed
```

If `SEED_USER_EMAIL` or `SEED_USER_PASSWORD` are omitted, the seed falls back to:

```bash
SEED_USER_EMAIL=admin@portfolio.local
SEED_USER_PASSWORD=ChangeMe123!
```

Useful verification commands:

```bash
npm run test:2fa-flow
npm run build
```

Optional env for live visitor analytics:

```bash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
ANALYTICS_HASH_SALT=
```

Optional env for Gmail SMTP delivery via Nodemailer:

```bash
GOOGLE_SMTP_USER=
GOOGLE_APP_PASSWORD=
MAIL_FROM_ADDRESS=
MAIL_FROM_NAME="Portofolio Admin"
```

Notes:

- `GOOGLE_APP_PASSWORD` requires Google 2-Step Verification to be enabled.
- If these env vars are missing, auth emails fall back to console logging instead of crashing.
